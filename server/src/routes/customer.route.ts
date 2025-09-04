import express from "express";
import { createCustomer, deleteCustomer, getAllCustomers, getCustomerById, getOrdersByCustomer, updateCustomer, searchCustomers } from "../controllers/customer.controller.js";

const router = express.Router();

// Search customers (must come before /:id routes)
router.get('/search', searchCustomers);

router.get('/', getAllCustomers);
router.get('/:id', getCustomerById);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

router.get('/:id/orders', getOrdersByCustomer);

export default router;