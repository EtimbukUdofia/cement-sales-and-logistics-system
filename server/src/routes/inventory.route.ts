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
} from "../controllers/inventory.controller.js";
import isAdmin from "../middlewares/isAdmin.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.use(verifyToken);

// Get all inventory with optional shop filter
router.get('/', getAllInventory);

// Get inventory statistics
router.get('/stats', getInventoryStats);

// Get inventory summary for all shops (admin only)
router.get('/summary', isAdmin, getInventorySummary);

// Get inventory for specific shop
router.get('/shop/:shopId', getInventoryByShop);

// Get inventory for specific product
router.get('/product/:productId', getInventoryByProduct);

// Get products low in stock
router.get('/low-stock', getLowStockProducts);

// Update inventory stock quantity
router.put('/:inventoryId', updateInventoryStock);

// Restock inventory
router.post('/restock', restockInventory);

// Adjust inventory levels manually (admin only)
router.post('/adjust', isAdmin, adjustInventoryLevel);

export default router;