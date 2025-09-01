import express from "express";
import { adjustInventoryLevel, getInventoryByProduct, getInventoryByShop, getInventorySummary, getLowStockProducts, restockInventory } from "../controllers/inventory.controller.ts";
import isAdmin from "../middlewares/isAdmin.ts";

const router = express.Router();

router.get('/', isAdmin, getInventorySummary); // summary for all shops
router.get('/shop/:shopId', getInventoryByShop); // summary for specific shop
router.get('/product/:productId', getInventoryByProduct); // get inventory for specific product
router.post('/restock', restockInventory); // restock inventory
router.post('/adjust', isAdmin, adjustInventoryLevel); // adjust inventory levels manually
router.get('/low-stock', getLowStockProducts); // get products low in stock across all shops


export default router;