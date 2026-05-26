import express from "express";
import { getAffiliates } from "./user.controller.js";
import { protect } from "../../middleware/auth.middleware.js";

const router = express.Router();

router.get("/affiliates", protect, getAffiliates);

export default router;
