import express from "express";
import { checkAuth, login, logout, signup } from "../controllers/auth.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
// import alreadyLoggedIn from "../middlewares/alreadyLoggedIn.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/login", login);
router.post("/signup", signup);
router.post("/logout", logout);

export default router;