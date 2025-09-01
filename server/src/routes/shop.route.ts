import express from 'express';
import isAdmin from '../middlewares/isAdmin.ts';
import { createShop, deleteShop, getAllShops, getShopById, updateShop } from '../controllers/shop.controller.ts';

const router = express.Router();

router.get('/', getAllShops);
router.get('/:id', getShopById);
router.post('/', isAdmin, createShop);
router.put('/:id', isAdmin, updateShop);
router.delete('/:id', isAdmin, deleteShop);

export default router;