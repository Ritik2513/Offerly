import { Router } from "express";
import { authorize, protect } from "../middleware/auth.middleware.js";
import authRoutes from "../modules/auth/auth.routes.js";
import offerRoutes from "../modules/offer/offer.routes.js";
import trackingRoutes from "../modules/tracking/tracking.routes.js";
import analyticsRoutes from "../modules/analytics/analytics.routes.js";
import userRoutes from "../modules/user/user.routes.js";
import conversionRoutes from "../modules/conversions/conversion.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.json({ status: "OK" });
});

router.use("/auth", authRoutes);
router.use("/offers", offerRoutes);
router.use("/tracking", trackingRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/users", userRoutes);
router.use("/conversions", conversionRoutes);

export default router;
