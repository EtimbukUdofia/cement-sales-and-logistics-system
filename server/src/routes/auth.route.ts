import express from "express";
import { checkAuth, login, logout, signup } from "../controllers/auth.controller.ts";
import { verifyToken } from "../middlewares/verifyToken.ts";
import alreadyLoggedIn from "../middlewares/alreadyLoggedIn.ts";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/login", alreadyLoggedIn, login);
router.post("/signup", alreadyLoggedIn, signup);
router.post("/logout", logout);

export default router;