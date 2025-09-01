import express from "express";
import isAdmin from "../middlewares/isAdmin.ts";
import { addUser, deleteUser, getAllUsers, getUserById, updateUser } from "../controllers/user.controller.ts";

const router = express.Router();

router.get("/:id", isAdmin, getUserById);
router.get("/", isAdmin, getAllUsers);
router.post("/", isAdmin, addUser);
router.put("/:id", isAdmin, updateUser);
router.delete("/:id", isAdmin, deleteUser);

export default router;