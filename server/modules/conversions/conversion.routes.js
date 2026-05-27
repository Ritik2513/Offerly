import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import { getConversions } from "./conversion.controller.js";

const router = express.Router();

router.get("/", protect, getConversions);

export default router;
