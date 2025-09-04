import express from "express";
import {
  adjustInventoryLevel,
  getAllInventory,
  getInventoryStats,
  getInventoryByProduct,
  getInventoryByShop,
  getInventorySummary,
  getLowStockProducts,
  restockInventory,
  updateInventoryStock
} from "../controllers/inventory.controller.ts";
import isAdmin from "../middlewares/isAdmin.ts";
import { verifyToken } from "../middlewares/verifyToken.ts";

const router = express.Router();

// Get all inventory with optional shop filter
router.get('/', verifyToken, getAllInventory);

// Get inventory statistics
router.get('/stats', verifyToken, getInventoryStats);

// Get inventory summary for all shops (admin only)
router.get('/summary', isAdmin, getInventorySummary);

// Get inventory for specific shop
router.get('/shop/:shopId', verifyToken, getInventoryByShop);

// Get inventory for specific product
router.get('/product/:productId', verifyToken, getInventoryByProduct);

// Get products low in stock
router.get('/low-stock', verifyToken, getLowStockProducts);

// Update inventory stock quantity
router.put('/:inventoryId', verifyToken, updateInventoryStock);

// Restock inventory
router.post('/restock', verifyToken, restockInventory);

// Adjust inventory levels manually (admin only)
router.post('/adjust', isAdmin, adjustInventoryLevel);

export default router;