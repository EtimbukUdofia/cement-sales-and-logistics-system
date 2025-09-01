import express from "express";
import isAdmin from "../middlewares/isAdmin.ts";
import { addUser, deleteUser, getAllSalesPersons, getAllUsers, getUserById, updateUser } from "../controllers/user.controller.ts";

const router = express.Router();

router.get("/salespersons", getAllSalesPersons);
router.get("/", isAdmin, getAllUsers);
router.get("/:id", isAdmin, getUserById);
router.post("/", isAdmin, addUser);
router.put("/:id", isAdmin, updateUser);
router.delete("/:id", isAdmin, deleteUser);

export default router;