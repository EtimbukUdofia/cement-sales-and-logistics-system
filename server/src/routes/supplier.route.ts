import express from 'express';
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier
} from '../controllers/supplier.controller.js';
import isAdmin from '../middlewares/isAdmin.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

// Get all suppliers
router.get('/', getSuppliers);

// Get supplier by ID
router.get('/:id', getSupplierById);

// Create new supplier (admin only)
router.post('/', isAdmin, createSupplier);

// Update supplier (admin only)
router.put('/:id', isAdmin, updateSupplier);

// Delete supplier (admin only)
router.delete('/:id', isAdmin, deleteSupplier);

export default router;