import express from "express";
import isAdmin from "../middlewares/isAdmin.js";
import { addUser, deleteUser, getAllSalesPersons, getAllUsers, getUserById, updateUser } from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.use(verifyToken);

router.get("/salespersons", getAllSalesPersons);
router.get("/", isAdmin, getAllUsers);
router.get("/:id", isAdmin, getUserById);
router.post("/", isAdmin, addUser);
router.put("/:id", isAdmin, updateUser);
router.delete("/:id", isAdmin, deleteUser);

export default router;