import express from "express";
import { createCustomer, deleteCustomer, getAllCustomers, getCustomerById, getOrdersByCustomer, updateCustomer } from "../controllers/customer.controller.ts";

const router = express.Router();

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

router.get('/:id/orders', getOrdersByCustomer);

export default router;