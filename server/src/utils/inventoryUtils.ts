import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import Inventory from '../models/Inventory.js';

/**
 * Ensures all active shops have inventory entries for all active products
 * This function can be run periodically or on-demand to fix missing inventory entries
 */
export const ensureInventoryCompleteness = async (): Promise<{
  created: number;
  checked: number;
  message: string
}> => {
  try {
    // Get all active shops and products
    const [activeShops, activeProducts] = await Promise.all([
      Shop.find({ isActive: true }, '_id').lean(),
      Product.find({ isActive: true }, '_id').lean()
    ]);

    if (activeShops.length === 0 || activeProducts.length === 0) {
      return {
        created: 0,
        checked: 0,
        message: 'No active shops or products found'
      };
    }

    let createdCount = 0;
    const checkedCount = activeShops.length * activeProducts.length;

    // Check each shop-product combination
    for (const shop of activeShops) {
      for (const product of activeProducts) {
        // Check if inventory entry exists
        const existingInventory = await Inventory.findOne({
          shop: shop._id,
          product: product._id
        });

        if (!existingInventory) {
          // Create missing inventory entry
          await Inventory.create({
            shop: shop._id,
            product: product._id,
            quantity: 0,
            minStockLevel: 10,
            maxStockLevel: 1000
          });
          createdCount++;
        }
      }
    }

    return {
      created: createdCount,
      checked: checkedCount,
      message: createdCount > 0
        ? `Created ${createdCount} missing inventory entries`
        : 'All inventory entries are complete'
    };
  } catch (error) {
    console.error('Error ensuring inventory completeness:', error);
    throw error;
  }
};

/**
 * Removes inventory entries for inactive shops or products
 */
export const cleanupInactiveInventory = async (): Promise<{
  removed: number;
  message: string;
}> => {
  try {
    // Get IDs of active shops and products
    const [activeShopIds, activeProductIds] = await Promise.all([
      Shop.find({ isActive: true }, '_id').lean().then(shops => shops.map(s => s._id)),
      Product.find({ isActive: true }, '_id').lean().then(products => products.map(p => p._id))
    ]);

    // Remove inventory entries for inactive shops or products
    const result = await Inventory.deleteMany({
      $or: [
        { shop: { $nin: activeShopIds } },
        { product: { $nin: activeProductIds } }
      ]
    });

    return {
      removed: result.deletedCount || 0,
      message: `Removed ${result.deletedCount || 0} inventory entries for inactive shops/products`
    };
  } catch (error) {
    console.error('Error cleaning up inactive inventory:', error);
    throw error;
  }
};

/**
 * Full inventory sync - ensures completeness and cleans up inactive entries
 */
export async function syncInventorySystem(): Promise<{
  created: number;
  removed: number;
  checked: number;
  message: string;
}> {
  try {
    const [completenessResult, cleanupResult] = await Promise.all([
      ensureInventoryCompleteness(),
      cleanupInactiveInventory()
    ]);

    return {
      created: completenessResult.created,
      removed: cleanupResult.removed,
      checked: completenessResult.checked,
      message: `Sync complete: ${completenessResult.created} created, ${cleanupResult.removed} removed`
    };
  } catch (error) {
    console.error('Error syncing inventory system:', error);
    throw error;
  }
}