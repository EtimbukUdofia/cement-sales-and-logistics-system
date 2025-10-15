import express from 'express';
import {
  createPurchaseOrder,
  getPurchaseOrders,
  getPurchaseOrderById,
  updatePurchaseOrder,
  deletePurchaseOrder,
  getPurchaseOrderStats
} from '../controllers/purchaseOrder.controller.js';
import isAdmin from '../middlewares/isAdmin.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

// Get all purchase orders
router.get('/', getPurchaseOrders);

// Get purchase order statistics
router.get('/stats', getPurchaseOrderStats);

// Get purchase order by ID
router.get('/:id', getPurchaseOrderById);

// Create new purchase order (admin only)
router.post('/', isAdmin, createPurchaseOrder);

// Update purchase order (admin only)
router.put('/:id', isAdmin, updatePurchaseOrder);

// Delete purchase order (admin only)
router.delete('/:id', isAdmin, deletePurchaseOrder);

export default router;