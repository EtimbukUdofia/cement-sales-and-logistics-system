import express from 'express';
import {
  createSalesOrder,
  deleteSalesOrder,
  getAllSalesOrders,
  getSalesOrderById,
  getSalesOrdersByCustomer,
  getSalesOrdersByShop,
  updateSalesOrderStatus,
  flagOrderForCorrection,
  getOrdersNeedingCorrection,
  getNotCollectedOrders,
  resolveOrderCorrection,
  recordPartialCollection
} from '../controllers/salesOrder.controller.js';
import isAdmin from '../middlewares/isAdmin.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', isAdmin, getAllSalesOrders);
router.get('/corrections', isAdmin, getOrdersNeedingCorrection);
router.get('/not-collected', getNotCollectedOrders);
router.get('/:id', getSalesOrderById);
router.post('/', createSalesOrder);
router.put('/:id/status', updateSalesOrderStatus);
router.put('/:id/flag-correction', flagOrderForCorrection);
router.put('/:id/resolve-correction', isAdmin, resolveOrderCorrection);
router.put('/:id/partial-collection', recordPartialCollection);
router.delete('/:id', isAdmin, deleteSalesOrder);
router.get('/customer/:customerId', getSalesOrdersByCustomer);
router.get('/shop/:shopId', getSalesOrdersByShop);

export default router;