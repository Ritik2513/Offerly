import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import authRoutes from "../modules/auth/auth.routes.js";
import offerRoutes from "../modules/offer/offer.routes.js";
import trackingRoutes from "../modules/tracking/tracking.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

router.use("/auth", authRoutes);
router.use("/offers", offerRoutes);
router.use("/tracking", trackingRoutes);

// router.get("/me", protect, (req, res) => {
//   res.json(req.user);
// });

// router.get("/admin-test", protect, authorize("admin"), (req, res) => {
//   res.json({ message: "Welcome admin" });
// });

export default router;
