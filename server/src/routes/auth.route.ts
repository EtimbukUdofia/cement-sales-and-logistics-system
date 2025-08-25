import express from "express";
import { checkAuth, login, logout, signup } from "../controllers/auth.controller.ts";

const router = express.Router();

router.get("/check-auth", checkAuth);

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);

export default router;