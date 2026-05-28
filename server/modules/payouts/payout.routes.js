import express from "express";
import { createPayout, getPayout } from "./payout.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getPayout);
router.post("/create", protect, createPayout);

export default router;
