import express from "express";
import {
  getTodayStats,
  getCountryStats,
  getOfferStats,
  getAffiliateStats,
} from "./analytics.controller.js";

const router = express.Router();

router.get("/today", getTodayStats);
router.get("/countries", getCountryStats);
router.get("/offers", getOfferStats);
router.get("/affiliates", getAffiliateStats);

export default router;
