import express from 'express';
import { createProduct, deleteProduct, getDistinctBrands, getProductById, getProducts, getProductsWithInventory, getProductsByBrand, updateProduct } from '../controllers/product.controller.js';
import isAdmin from '../middlewares/isAdmin.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/with-inventory/:shopId', getProductsWithInventory);
router.get('/:id', getProductById);
router.post('/', isAdmin, createProduct);
router.put('/:id', isAdmin, updateProduct);
router.delete('/:id', isAdmin, deleteProduct);

router.get('/brands', getDistinctBrands);
router.get('/brands/:brand', getProductsByBrand);

export default router;