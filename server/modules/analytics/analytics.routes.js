import express from "express";
import {
  getTodayStats,
  getCountryStats,
  getOfferStats,
  getAffiliateStats,
  getClickTrends,
  getAffiliateAnalytics,
} from "./analytics.controller.js";
import { protect, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/today", getTodayStats);
router.get("/countries", getCountryStats);
router.get("/offers", getOfferStats);
router.get("/admin", getAffiliateStats); //admin analytics
router.get("/trends", getClickTrends);
// affiliate analytics
router.get(
  "/affiliate",
  protect,
  authorize("affiliate"),
  getAffiliateAnalytics,
);

export default router;
