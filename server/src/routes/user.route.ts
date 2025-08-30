import express from "express";
import isAdmin from "../middlewares/isAdmin.ts";
import { addUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user.controller.ts";

const router = express.Router();

router.get("/user/:id", isAdmin, getUserById);
router.get("/users", isAdmin, getAllUsers);
router.post("/user", isAdmin, addUser);
router.put("/user/:id", isAdmin, updateUser);
router.delete("/user/:id", isAdmin, deleteUser);

export default router;