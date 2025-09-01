import express from 'express';
import { createSalesOrder, deleteSalesOrder, getAllSalesOrders, getSalesOrderById, getSalesOrdersByCustomer, getSalesOrdersByShop, updateSalesOrderStatus } from '../controllers/salesOrder.controller.ts';

const router = express.Router();

router.get('/', getAllSalesOrders);
router.get('/:id', getSalesOrderById);
router.post('/', createSalesOrder);
router.put('/:id/status', updateSalesOrderStatus);
router.delete('/:id', deleteSalesOrder);
router.get('/customer/:customerId', getSalesOrdersByCustomer);
router.get('/shop/:shopId', getSalesOrdersByShop);

export default router;