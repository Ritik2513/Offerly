<div align="center">

# Offerly

**Production-grade Affiliate Tracking & Payout Management SaaS**

A full-stack platform for managing affiliate campaigns, tracking conversions in real time via S2S postbacks, and automating payout workflows — built for advertisers, affiliates, and platform admins.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-offerly--sigma.vercel.app-111827?style=flat-square&logo=vercel&logoColor=white)](https://offerly-sigma.vercel.app/login)
&nbsp;
[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Redis%20%2B%20BullMQ-20232a?style=flat-square)](https://github.com/Ritik2513/Offerly)
&nbsp;
[![License](https://img.shields.io/badge/License-MIT-639922?style=flat-square)](LICENSE)

</div>

---

## What is Offerly?

Offerly is a multi-role affiliate tracking SaaS that handles the full lifecycle of affiliate marketing operations:

- **Advertisers** create campaigns, generate tracking links, and monitor conversion performance
- **Affiliates** access dashboards, view their active campaigns, and track payout status
- **Admins** oversee the entire platform — approving affiliates, managing payouts, and viewing cross-campaign analytics

The core engineering challenge: tracking click and conversion events at high concurrency without blocking the API response chain — solved via Redis-backed queues and BullMQ worker processing.

---

## Architecture overview

```
Client (React)
     │
     ▼
Express REST API  ──→  MongoDB (persistent storage)
     │
     ├──→  Redis Queue (click / conversion events)
     │            │
     │            ▼
     │       BullMQ Workers (async event processing)
     │            │
     │            ▼
     │       MongoDB (event records written async)
     │
     └──→  S2S Postback Handler (advertiser server callbacks)
```

**Why queues?** Tracking endpoints must respond in milliseconds. Writing directly to MongoDB on every click under high concurrency creates bottlenecks and risks data loss. Events are pushed to Redis instantly and processed by BullMQ workers asynchronously — the API stays fast, no events are dropped.

---

## Features

### Tracking engine
- **Click tracking** — unique tracking links per affiliate/campaign with Redis-backed ingestion
- **Conversion attribution** — match conversions back to originating clicks via tracking IDs
- **S2S postback support** — advertisers fire server-to-server callbacks on conversion; Offerly processes and attributes them automatically
- **Async event processing** — BullMQ workers drain the Redis queue and persist events to MongoDB without blocking the request cycle

### Campaign management
- Create, edit, and pause campaigns with configurable payout models
- Per-campaign tracking link generation
- Conversion cap and budget controls

### Role-based access control
- Three distinct roles: `admin`, `advertiser`, `affiliate`
- Route-level and resource-level authorization via JWT + RBAC middleware
- Each role sees only the data and actions relevant to them

### Analytics & payouts
- Real-time click and conversion dashboards per affiliate and campaign
- Payout calculation based on confirmed conversions
- Admin payout approval and history tracking

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js, Tailwind CSS, Context API |
| Backend | Node.js, Express.js |
| Database | MongoDB (aggregation, indexing) |
| Queue / async | Redis, BullMQ |
| Auth | JWT, cookie-based sessions, RBAC |
| Containerization | Docker |
| Deployment | Vercel (client), Render (server) |
| API testing | Postman |

---

## Getting started

### Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- Redis (local or Upstash)
- Docker (optional, for containerized setup)

### 1. Clone the repository

```bash
git clone https://github.com/Ritik2513/Offerly.git
cd Offerly
```

### 2. Configure environment variables

**Server** — create `server/.env`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379
CLIENT_URL=http://localhost:5173
```

**Client** — create `client/.env`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Install dependencies

```bash
# Server
cd server && npm install

# Client
cd ../client && npm install
```

### 4. Run the application

```bash
# Terminal 1 — start the API server
cd server && npm run dev

# Terminal 2 — start the BullMQ worker
cd server && npm run worker

# Terminal 3 — start the React client
cd client && npm run dev
```

Client runs at `http://localhost:5173` · API at `http://localhost:5000`

### 5. Docker (alternative)

```bash
docker-compose up --build
```

---

## API overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register user (affiliate / advertiser) | Public |
| `POST` | `/api/auth/login` | Login and receive JWT | Public |
| `GET` | `/api/campaigns` | List campaigns | Advertiser / Admin |
| `POST` | `/api/campaigns` | Create a new campaign | Advertiser |
| `GET` | `/api/campaigns/:id/link` | Generate affiliate tracking link | Affiliate |
| `GET` | `/api/track/click/:linkId` | Record click event (redirects user) | Public |
| `POST` | `/api/track/postback` | S2S postback conversion endpoint | Advertiser server |
| `GET` | `/api/analytics/campaign/:id` | Campaign performance stats | Advertiser / Admin |
| `GET` | `/api/payouts` | View payout history | Affiliate / Admin |
| `POST` | `/api/payouts/approve/:id` | Approve a payout request | Admin |

---

## Project structure

```
Offerly/
├── client/                  # React frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # Role-specific page views
│   │   ├── context/         # Auth and global state
│   │   └── utils/           # API helpers, constants
│   └── vite.config.js
│
└── server/                  # Node.js backend
    ├── config/              # DB and Redis connections
    ├── controllers/         # Route handler logic
    ├── middleware/          # Auth, RBAC, error handling
    ├── models/              # Mongoose schemas
    ├── queues/              # Redis queue setup (BullMQ)
    ├── routes/              # Express route definitions
    ├── workers/             # BullMQ event processors
    └── index.js
```

---

## Demo credentials

You can explore the live demo at [offerly-sigma.vercel.app/login](https://offerly-sigma.vercel.app/login)

| Role | Email | Password |
|------|-------|----------|
| Admin | offerly-sigma.vercel.app/login | admin123 |

---

## Key engineering decisions

**Redis + BullMQ for event ingestion** — Click and conversion events are time-sensitive and high-volume. Pushing them to a Redis queue decouples ingestion from persistence, keeps the tracking endpoint sub-50ms, and ensures zero data loss even under traffic spikes.

**S2S postback model** — Instead of relying on browser pixel fires (which fail due to ad blockers and page exits), Offerly supports server-to-server callbacks. The advertiser's server fires a postback URL on conversion — more reliable and impossible for the user to block.

**RBAC at middleware layer** — Role checks happen at the route level before any controller logic runs. Each role's permissions are defined centrally, making it easy to audit and extend without touching business logic.

**Cookie-based sessions over localStorage** — Auth tokens are stored in `httpOnly` cookies, not localStorage. This prevents XSS-based token theft — a common vulnerability in SPA auth implementations.

---

## Author

**Ritik Kumar Gupta** — Full Stack Engineer

[Portfolio](https://ritik2513.vercel.app) · [LinkedIn](https://www.linkedin.com/in/ritik-gupta-a69253229/) · [GitHub](https://github.com/Ritik2513) · [ritikgupta2513@gmail.com](mailto:ritikgupta2513@gmail.com)
