import express from "express";
import {
  getTodayStats,
  getCountryStats,
  getOfferStats,
  getAffiliateStats,
  getClickTrends,
} from "./analytics.controller.js";

const router = express.Router();

router.get("/today", getTodayStats);
router.get("/countries", getCountryStats);
router.get("/offers", getOfferStats);
router.get("/affiliates", getAffiliateStats);
router.get("/trends", getClickTrends);

export default router;
