import express from 'express';
import { createSalesOrder, deleteSalesOrder, getAllSalesOrders, getSalesOrderById, getSalesOrdersByCustomer, getSalesOrdersByShop, updateSalesOrderStatus } from '../controllers/salesOrder.controller.ts';
import isAdmin from '../middlewares/isAdmin.ts';

const router = express.Router();

router.get('/', isAdmin, getAllSalesOrders);
router.get('/:id', getSalesOrderById);
router.post('/', createSalesOrder);
router.put('/:id/status', isAdmin, updateSalesOrderStatus);
router.delete('/:id', isAdmin, deleteSalesOrder);
router.get('/customer/:customerId', getSalesOrdersByCustomer);
router.get('/shop/:shopId', getSalesOrdersByShop);

export default router;