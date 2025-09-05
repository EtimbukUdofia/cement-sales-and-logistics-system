import express from 'express';
import isAdmin from '../middlewares/isAdmin.js';
import { createShop, deleteShop, getAllShops, getShopById, updateShop } from '../controllers/shop.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', getAllShops);
router.get('/:id', getShopById);
router.post('/', isAdmin, createShop);
router.put('/:id', isAdmin, updateShop);
router.delete('/:id', isAdmin, deleteShop);

export default router;