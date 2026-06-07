# Offerly — Architecture Document

> This document explains the system design, data flow, folder structure, and key engineering decisions behind Offerly. It is intended for contributors, reviewers, and anyone evaluating the codebase.

---

## Table of contents

1. [System overview](#1-system-overview)
2. [High-level architecture](#2-high-level-architecture)
3. [Request flows](#3-request-flows)
   - 3.1 [Click tracking flow](#31-click-tracking-flow)
   - 3.2 [S2S postback conversion flow](#32-s2s-postback-conversion-flow)
   - 3.3 [Authentication & authorization flow](#33-authentication--authorization-flow)
   - 3.4 [Payout flow](#34-payout-flow)
4. [Folder structure](#4-folder-structure)
5. [Data models](#5-data-models)
6. [Queue & worker architecture](#6-queue--worker-architecture)
7. [Role-based access control](#7-role-based-access-control)
8. [Authentication design](#8-authentication-design)
9. [API design principles](#9-api-design-principles)
10. [Engineering decisions](#10-engineering-decisions)
11. [Known limitations & roadmap](#11-known-limitations--roadmap)

---

## 1. System overview

Offerly is a multi-role affiliate tracking SaaS. It handles the full operational lifecycle of affiliate marketing:

- **Campaign creation** — admin define campaigns, payout models, and budgets
- **Affiliate onboarding** — affiliates register, get approved, and receive unique tracking links
- **Click tracking** — every affiliate click is captured, queued, and persisted asynchronously
- **Conversion attribution** — advertiser servers fire S2S postback callbacks; Offerly attributes them to the originating click
- **Payout management** — conversions roll up into payout records; admins approve and process them
- **Analytics** — role-scoped dashboards show clicks, conversions, and revenue in real time

### Roles

| Role | Capabilities |
|------|-------------|
| `admin` | Full platform access — approve affiliates, manage payouts, view all campaigns and analytics |
| `advertiser` | Create and manage campaigns, view campaign performance, fire postbacks |
| `affiliate` | Browse approved campaigns, generate tracking links, view own analytics and payouts |

---

## 2. High-level architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (React)                        │
│         Vite · Tailwind CSS · Context API · Axios            │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS REST
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    EXPRESS REST API                          │
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │  Auth layer │  │ RBAC middleware│  │  Route modules   │   │
│  │  JWT/Cookie │  │ role checks  │  │  (per domain)    │   │
│  └─────────────┘  └──────────────┘  └──────────────────┘   │
│                           │                                  │
│         ┌─────────────────┼──────────────────┐              │
│         ▼                 ▼                  ▼              │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐   │
│  │   MongoDB   │  │  Redis Queue │  │  S2S Postback    │   │
│  │  (primary   │  │  (BullMQ)    │  │  endpoint        │   │
│  │   storage)  │  │              │  │  (direct write)  │   │
│  └─────────────┘  └──────┬───────┘  └──────────────────┘   │
│                           │                                  │
└───────────────────────────┼─────────────────────────────────┘
                            │ async
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     BULLMQ WORKERS                           │
│   Drain Redis queue → attribute events → write to MongoDB    │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Request flows

### 3.1 Click tracking flow

This is the highest-frequency path in the system. The design priority is: **respond fast, never lose an event.**

```
Affiliate user clicks tracking link
         │
         ▼
GET /api/track/click/:linkId
         │
         ├── 1. Validate linkId → look up campaign + affiliate in MongoDB
         ├── 2. Extract metadata (IP, User-Agent, referrer, timestamp)
         ├── 3. Push click event to Redis queue (BullMQ)   ← non-blocking
         ├── 4. Redirect user to advertiser destination URL ← immediate response
         │
         └── [async, separate process]
              BullMQ worker picks up event from queue
                   │
                   ├── Deduplicate (check for duplicate click fingerprint)
                   ├── Enrich event record
                   └── Write to MongoDB clicks collection
```

**Why queue instead of direct write?**
The redirect must happen in under 50ms to avoid user-visible latency and preserve tracking pixel attribution windows. Writing to MongoDB synchronously on every click under concurrent load introduces p95 latency spikes and risks dropped events if the DB connection is slow. The Redis queue acts as a durable buffer — events are safe the moment they're queued, and workers process them at their own pace.

---

### 3.2 S2S postback conversion flow

S2S (Server-to-Server) postbacks are fired by the advertiser's server when a conversion occurs on their end — a purchase, sign-up, or other goal event.

```
Advertiser's server fires:
GET /api/track/postback?click_id=xxx&payout=xx&event=purchase
         │
         ▼
Postback endpoint (no auth required — validated by secret token)
         │
         ├── 1. Validate postback secret token
         ├── 2. Look up click_id → find originating click record in MongoDB
         ├── 3. Attribute conversion to affiliate + campaign
         ├── 4. Write conversion record to MongoDB  ← direct write
         ├── 5. Update campaign conversion counter
         └── 6. Queue payout calculation job
```

**Why direct write here (not queued)?**
Unlike click tracking, postbacks arrive at low frequency and carry high business value — a missed postback means an affiliate doesn't get paid. Direct write gives us immediate consistency and simplifies the attribution lookup. The volume does not justify a queue.

---

### 3.3 Authentication & authorization flow

```
Client sends credentials
         │
         ▼
POST /api/auth/login
         │
         ├── 1. Validate email + password (bcrypt compare)
         ├── 2. Sign JWT (payload: userId, role, iat, exp)
         └── 3. Set JWT in httpOnly cookie on response
                   │
                   ▼
         All subsequent requests:
                   │
                   ├── auth middleware: verify JWT from cookie
                   ├── Attach req.user = { id, role }
                   │
                   └── RBAC middleware: check req.user.role
                            │
                            ├── role allowed → next()
                            └── role denied  → 403 Forbidden
```

---

### 3.4 Payout flow

```
Conversions accumulate per affiliate
         │
         ▼
Affiliate requests payout
POST /api/payouts/request
         │
         ├── 1. Aggregate unpaid conversions for affiliate
         ├── 2. Create payout record (status: pending)
         └── 3. Notify admin (in-app)
                   │
                   ▼
Admin reviews and approves
POST /api/payouts/approve/:id
         │
         ├── 1. RBAC check — admin only
         ├── 2. Update payout status → approved
         ├── 3. Mark conversions as paid
         └── 4. Return updated payout record to client
```

---

## 4. Folder structure

```
Offerly/
│
├── client/                        # React frontend (Vite)
│   └── src/
│       ├── components/            # Shared UI components
│       ├── pages/                 # Role-gated page views
│       │   ├── admin/
│       │   ├── advertiser/
│       │   └── affiliate/
│       ├── context/               # Auth context, global state
│       ├── utils/                 # Axios instance, helpers
│       └── App.jsx                # Route definitions + role guards
│
└── server/                        # Node.js + Express backend
    ├── config/                    # DB connection, Redis client setup
    ├── middleware/                 # Auth (JWT verify), RBAC, error handler
    ├── modules/                   # Feature modules (see below)
    │   ├── auth/
    │   ├── campaigns/
    │   ├── tracking/
    │   ├── analytics/
    │   └── payouts/
    ├── queues/                    # BullMQ queue definitions
    ├── workers/                   # BullMQ worker processors
    ├── routes/                    # Top-level route registration
    ├── services/                  # Shared business logic (e.g. attribution)
    ├── utils/                     # Helpers (token gen, fingerprinting)
    └── index.js                   # App entry point, middleware chain
```

### Module structure (inside `modules/`)

Each feature module is self-contained:

```
modules/campaigns/
├── campaign.model.js       # Mongoose schema
├── campaign.controller.js  # Request handlers
├── campaign.routes.js      # Express router
└── campaign.service.js     # Business logic (called by controller)
```

This keeps domain logic co-located and prevents controllers from becoming bloated with business rules.

---

## 5. Data models

### User
```
_id, name, email, passwordHash, role (admin|advertiser|affiliate),
status (pending|approved|rejected), createdAt
```

### Campaign
```
_id, advertiserId (ref: User), name, description, targetURL,
payoutModel (CPA|CPC|CPL), payoutAmount, status (active|paused),
conversionCap, totalClicks, totalConversions, createdAt
```

### AffiliateLink
```
_id, campaignId (ref: Campaign), affiliateId (ref: User),
linkCode (unique), destinationURL, createdAt
```

### ClickEvent
```
_id, linkId (ref: AffiliateLink), campaignId, affiliateId,
ip, userAgent, referrer, timestamp, isDuplicate, processedAt
```

### ConversionEvent
```
_id, clickId (ref: ClickEvent), campaignId, affiliateId,
advertiserId, payoutAmount, eventType, postbackReceivedAt,
status (pending|confirmed|rejected)
```

### Payout
```
_id, affiliateId (ref: User), conversions [ref: ConversionEvent],
totalAmount, status (pending|approved|paid), requestedAt, processedAt
```

---

## 6. Queue & worker architecture

Offerly uses **BullMQ** (built on Redis) for async event processing.

### Queues

| Queue name | Producer | Consumer | Purpose |
|------------|----------|----------|---------|
| `click-events` | Tracking endpoint | `clickWorker` | Persist click events to MongoDB |
| `payout-calc` | Postback endpoint | `payoutWorker` | Recalculate payout totals after conversion |

### Worker design

```javascript
// workers/clickWorker.js (simplified)
const clickWorker = new Worker('click-events', async (job) => {
  const { linkId, ip, userAgent, referrer, timestamp } = job.data;

  // 1. Resolve link → campaign + affiliate
  const link = await AffiliateLink.findById(linkId);

  // 2. Deduplicate — same IP + linkId within 24h window
  const isDuplicate = await checkDuplicate(linkId, ip);

  // 3. Persist
  await ClickEvent.create({ ...job.data, isDuplicate });

  // 4. Increment campaign click counter (non-duplicate only)
  if (!isDuplicate) {
    await Campaign.findByIdAndUpdate(link.campaignId,
      { $inc: { totalClicks: 1 } }
    );
  }
}, { connection: redisClient, concurrency: 5 });
```

### Retry & failure handling

- BullMQ retries failed jobs up to **3 times** with exponential backoff
- Failed jobs after max retries move to the `failed` queue for manual inspection
- Worker processes run as a **separate Node.js process** (`npm run worker`) — a worker crash does not affect the API server

---

## 7. Role-based access control

RBAC is enforced at the middleware layer, before any controller logic runs.

```javascript
// middleware/rbac.js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

// Usage in routes
router.post('/campaigns', authenticate, authorize('advertiser', 'admin'), createCampaign);
router.get('/payouts', authenticate, authorize('affiliate', 'admin'), getPayouts);
router.post('/payouts/approve/:id', authenticate, authorize('admin'), approvePayout);
```

Role definitions are centralized — adding a new role requires changes in one place only.

---

## 8. Authentication design

| Decision | Choice | Reason |
|----------|--------|--------|
| Token format | JWT (signed HS256) | Stateless, no DB lookup on every request |
| Token storage | `httpOnly` cookie | Prevents XSS token theft via `document.cookie` |
| Token expiry | 7 days | Balance between security and UX |
| Password hashing | bcrypt (salt rounds: 10) | Industry standard, resistant to rainbow tables |
| Refresh strategy | Re-login on expiry (v1) | Kept simple for v1; refresh tokens planned |

**Why `httpOnly` cookies over `localStorage`?**
`localStorage` is accessible by any JavaScript on the page. An XSS vulnerability anywhere in the React app would expose the token. `httpOnly` cookies are invisible to JavaScript and automatically sent by the browser on every request — same convenience, significantly safer.

---

## 9. API design principles

- **RESTful resource naming** — `/campaigns`, `/campaigns/:id`, `/campaigns/:id/links`
- **HTTP verbs as intent** — `GET` read, `POST` create, `PATCH` partial update, `DELETE` remove
- **Consistent error shape** — all errors return `{ success: false, message: string, errors?: [] }`
- **Consistent success shape** — all responses return `{ success: true, data: {} }`
- **Pagination** — list endpoints accept `?page=1&limit=20`, return `{ data, total, page, pages }`
- **No sensitive data in responses** — `passwordHash`, internal IDs excluded from all user-facing responses

---

## 10. Engineering decisions

### Why BullMQ over a direct MongoDB write on click?
Click tracking is the most latency-sensitive operation in the system. Affiliates expect the redirect to be instant — any visible delay reduces trust and can skew attribution windows. By queuing the event and redirecting immediately, the tracking endpoint stays under 50ms regardless of MongoDB load. BullMQ also provides automatic retries, meaning a temporary DB outage doesn't lose events.

### Why a module-based folder structure over MVC?
A flat `controllers/` and `models/` directory works at small scale but becomes hard to navigate as the domain grows. Co-locating model, controller, routes, and service by feature (e.g. `modules/campaigns/`) means every file related to campaigns lives in one place. New engineers can understand a feature without jumping across the codebase.

### Why S2S postbacks over browser pixel fires?
Browser pixels rely on the user's browser making a request after a conversion. Ad blockers, browser privacy settings, and page exits all cause pixel fires to fail silently. S2S postbacks are fired server-to-server — they're immune to browser-side interference, more reliable, and better suited for high-value conversion events like purchases or sign-ups.

### Why keep postback writes synchronous (no queue)?
Postbacks arrive at low frequency (one per conversion, not one per click). Their business consequence is high — a missed postback means an affiliate doesn't get attributed or paid. Direct writes give immediate consistency and simplify the attribution logic. The throughput doesn't justify a queue.

---

## 11. Known limitations & roadmap

### Current limitations

| Area | Limitation |
|------|-----------|
| TypeScript | Codebase is JavaScript — no compile-time type safety |
| Testing | No automated test suite currently |
| CI/CD | No GitHub Actions pipeline |
| Refresh tokens | Auth uses 7-day JWTs without a refresh token flow |
| Docker | Docker setup is planned but not yet implemented |
| Rate limiting | Tracking endpoints lack rate limiting (DDoS risk) |

### Planned improvements

- [ ] **TypeScript migration** — models and service layer first, then controllers
- [ ] **Test suite** — Jest + Supertest for API integration tests; target 70%+ coverage on core tracking flows
- [ ] **GitHub Actions CI** — lint + test on every pull request
- [ ] **Docker Compose** — containerize API server, worker, Redis, and MongoDB for one-command local setup
- [ ] **Rate limiting** — `express-rate-limit` on `/api/track/*` endpoints
- [ ] **Refresh token flow** — short-lived access tokens + refresh token rotation
- [ ] **Webhook notifications** — real-time advertiser webhooks on conversion events
- [ ] **CSV export** — payout history export for affiliate accounting

---

## Author

**Ritik Kumar Gupta** — Full Stack Engineer
[Portfolio](https://ritik2513.vercel.app) · [LinkedIn](https://www.linkedin.com/in/ritik-gupta-a69253229/) · [GitHub](https://github.com/Ritik2513)
