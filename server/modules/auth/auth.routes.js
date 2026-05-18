import { Router } from "express";
import { register, login, logout } from "./auth.controller.js";
import { protect } from "./auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout);

export default router;
