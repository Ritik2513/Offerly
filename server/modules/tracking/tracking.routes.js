import express from "express";
import { generateTrackingLink } from "./tracking.controller.js";
import { protect, authorize } from "../../middleware/auth.middleware.js";

const router = express.Router();

//only affiliates generate link
router.post("/generate", protect, authorize("affiliate"), generateTrackingLink);

export default router;
