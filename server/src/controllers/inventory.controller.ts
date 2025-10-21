import type { Response } from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../interfaces/interface.js';
import Inventory from '../models/Inventory.js';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import InventoryHistory from '../models/InventoryHistory.js';
import { syncInventorySystem } from '../utils/inventoryUtils.js';

// get inventory summary for all shops (includes shops with no inventory)
export const getInventorySummary = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get all active shops first
    const allShops = await Shop.find({ isActive: true }, '_id name address').lean();

    // Get inventory summary for shops that have inventory
    const inventorySummary = await Inventory.aggregate([
      // First, lookup product details to get price
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      // Group by shop and calculate totals
      {
        $group: {
          _id: '$shop',
          totalItems: { $sum: { $ifNull: ['$quantity', 0] } },
          totalValue: {
            $sum: {
              $multiply: [
                { $ifNull: ['$quantity', 0] },
                { $ifNull: ['$productDetails.price', 0] },
              ],
            },
          },
          lowStockCount: {
            $sum: {
              $cond: [
                { $lt: ['$quantity', '$minStockLevel'] },
                1,
                0
              ]
            }
          },
        },
      },
      // Lookup shop details
      {
        $lookup: {
          from: 'shops',
          localField: '_id',
          foreignField: '_id',
          as: 'shopDetails',
        },
      },
      { $unwind: { path: '$shopDetails', preserveNullAndEmptyArrays: true } },
      // Project final structure
      {
        $project: {
          shopId: '$_id',
          shopName: '$shopDetails.name',
          shopLocation: '$shopDetails.address',
          totalItems: 1,
          totalValue: 1,
          lowStockCount: 1,
        },
      }
    ]);

    // Create a map of shops with inventory data
    const shopInventoryMap = new Map(
      inventorySummary.map(item => [item.shopId.toString(), item])
    );

    // Include all shops, even those without inventory
    const completeInventorySummary = allShops.map(shop => {
      const existingData = shopInventoryMap.get(shop._id.toString());
      return existingData || {
        shopId: shop._id,
        shopName: shop.name,
        shopLocation: shop.address,
        totalItems: 0,
        totalValue: 0,
        lowStockCount: 0,
      };
    });

    // Sort by shop name
    completeInventorySummary.sort((a, b) => a.shopName.localeCompare(b.shopName));

    res.status(200).json({ success: true, data: completeInventorySummary });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching inventory summary' });
  }
};

// get inventory details for a specific shop with role-based access
export const getInventoryByShop = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shopId } = req.params;
  const { user } = req;

  if (!shopId) {
    res.status(400).json({ success: false, message: 'Shop id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Invalid shop id' });
    return;
  }

  // Role-based access control
  if (user?.role === 'salesPerson' && user?.shopId && user.shopId !== shopId) {
    res.status(403).json({ success: false, message: 'Access denied. You can only view inventory for your assigned shop' });
    return;
  }

  try {
    const existingShop = await Shop.findById(shopId).lean();
    if (!existingShop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    const inventoryItems = await Inventory.find({ shop: shopId })
      .populate('product', 'name variant brand size price imageUrl')
      .populate('shop', 'name address')
      .sort({ 'product.name': 1 })
      .lean();

    res.status(200).json({ success: true, data: inventoryItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching inventory for shop' });
  }
};

// get inventory details for a specific product
export const getInventoryByProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId } = req.params;
  if (!productId) {
    res.status(400).json({ success: false, message: 'Product id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ success: false, message: 'Invalid product id' });
    return;
  }

  try {
    const existingProduct = await Product.findById(productId).lean().exec();
    if (!existingProduct) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }
    const inventoryItems = await Inventory.find({ product: productId })
      .populate('shop', 'name address')
      .lean()
      .exec();
    res.status(200).json({ success: true, inventoryItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching inventory for product' });
  }
};

//  adjust inventory levels manually (admin action)
export const adjustInventoryLevel = async (req: AuthRequest, res: Response): Promise<void> => {
  const { inventoryId } = req.params;
  const { newQuantity } = req.body;
  if (!inventoryId || typeof newQuantity !== 'number' || newQuantity < 0) {
    res.status(400).json({ success: false, message: 'Valid inventory id and newQuantity are required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
    res.status(400).json({ success: false, message: 'Invalid inventory id' });
    return;
  }

  try {
    const inventoryItem = await Inventory.findById(inventoryId);
    if (!inventoryItem) {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }
    inventoryItem.quantity = newQuantity;
    await inventoryItem.save();
    res.status(200).json({ success: true, message: 'Inventory level adjusted successfully', inventoryItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adjusting inventory level' });
  }
};

// add stock to inventory after receiving new products
export const restockInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { productId, shopId, quantity } = req.body;
  if (!productId || !shopId || typeof quantity !== 'number' || quantity <= 0) {
    res.status(400).json({ success: false, message: 'productId, shopId and positive quantity are required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(productId) || !mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Invalid productId or shopId' });
    return;
  }

  try {
    let inventoryItem = await Inventory.findOne({ product: productId, shop: shopId });
    if (inventoryItem) {
      // If item exists, increase quantity
      inventoryItem.quantity += quantity;
      inventoryItem.lastRestocked = new Date();
    } else {
      // If not, create new inventory record
      inventoryItem = new Inventory({
        product: productId,
        shop: shopId,
        quantity,
        lastRestocked: new Date(),
      });
    }
    await inventoryItem.save();
    res.status(200).json({ success: true, message: 'Stock added to inventory successfully', inventoryItem });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error adding stock to inventory' });
  }
};

export const getLowStockProducts = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const lowStockItems = await Inventory.aggregate([
      // Ensure minStockLevel has a sensible default
      { $addFields: { _minStockLevel: { $ifNull: ['$minStockLevel', 0] } } },
      // Match items where quantity < minStockLevel (with default applied)
      { $match: { $expr: { $lt: ['$quantity', '$_minStockLevel'] } } },
      // Lookup product details
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      // Lookup shop details
      {
        $lookup: {
          from: 'shops',
          localField: 'shop',
          foreignField: '_id',
          as: 'shopDetails',
        },
      },
      { $unwind: { path: '$shopDetails', preserveNullAndEmptyArrays: true } },
      // Project useful fields
      {
        $project: {
          quantity: 1,
          minStockLevel: '$_minStockLevel',
          product: {
            name: '$productDetails.name',
            brand: '$productDetails.brand',
            size: '$productDetails.size',
            price: '$productDetails.price',
          },
          shop: {
            name: '$shopDetails.name',
            location: '$shopDetails.address',
          },
        },
      },
    ]).exec();

    res.status(200).json({ success: true, lowStockItems });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching low stock products' });
  }
};

// Get all inventory items across all shops (admin only) or for user's shop (salesPerson)
export const getAllInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { user } = req;
    let query: any = {};

    // Role-based filtering: salesPerson can only see their shop's inventory
    if (user?.role === 'salesPerson') {
      if (!user.shopId) {
        res.status(400).json({ success: false, message: 'Sales person must be assigned to a shop' });
        return;
      }
      query.shop = user.shopId;
    }
    // Admin can see all inventory (no filter applied)

    const inventory = await Inventory.find(query)
      .populate('product', 'name variant brand size price imageUrl')
      .populate('shop', 'name address')
      .sort({ 'shop.name': 1, 'product.name': 1 })
      .lean();

    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching inventory' });
  }
};

// Get inventory statistics with optional shop filter
export const getInventoryStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { shop } = req.query;
    const { user } = req;

    // Build query based on user role and shop filter
    let matchQuery: any = {};

    // If user is a sales person, only show stats for their shop
    if (user?.role === 'salesPerson' && user?.shopId) {
      matchQuery.shop = new mongoose.Types.ObjectId(user.shopId);
    } else if (shop && mongoose.Types.ObjectId.isValid(shop as string)) {
      // If shop filter is provided and valid
      matchQuery.shop = new mongoose.Types.ObjectId(shop as string);
    }

    const stats = await Inventory.aggregate([
      { $match: matchQuery },
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails',
        },
      },
      { $unwind: { path: '$productDetails', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: {
            $sum: {
              $multiply: [
                { $ifNull: ['$quantity', 0] },
                { $ifNull: ['$productDetails.price', 0] },
              ],
            },
          },
          lowStockItems: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $gt: ['$quantity', 0] },
                    { $lte: ['$quantity', '$minStockLevel'] }
                  ]
                },
                1,
                0
              ]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [
                { $eq: ['$quantity', 0] },
                1,
                0
              ]
            }
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalProducts: 1,
          totalQuantity: 1,
          totalValue: 1,
          lowStockItems: 1,
          outOfStockItems: 1,
        },
      },
    ]);

    const result = stats[0] || {
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0,
    };

    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching inventory stats' });
  }
};

// Update inventory stock quantity
export const updateInventoryStock = async (req: AuthRequest, res: Response): Promise<void> => {
  const { inventoryId } = req.params;
  const { quantity } = req.body;

  if (!inventoryId || typeof quantity !== 'number' || quantity < 0) {
    res.status(400).json({ success: false, message: 'Valid inventory ID and quantity are required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(inventoryId)) {
    res.status(400).json({ success: false, message: 'Invalid inventory ID' });
    return;
  }

  try {
    const inventoryItem = await Inventory.findById(inventoryId);
    if (!inventoryItem) {
      res.status(404).json({ success: false, message: 'Inventory item not found' });
      return;
    }

    inventoryItem.quantity = quantity;
    if (quantity > 0) {
      inventoryItem.lastRestocked = new Date();
    }

    await inventoryItem.save();

    const updatedItem = await Inventory.findById(inventoryId)
      .populate('product', 'name variant brand size price imageUrl')
      .populate('shop', 'name address')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: updatedItem
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating inventory' });
  }
};

// Admin: Get shop details for inventory management
export const getShopDetailsForInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shopId } = req.params;

  if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Valid shop ID is required' });
    return;
  }

  try {
    const shop = await Shop.findById(shopId)
      .populate('manager', 'username email')
      .lean();

    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    res.status(200).json({
      success: true,
      shop
    });
  } catch (error) {
    console.error('Error fetching shop details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching shop details' });
  }
};

// Initialize inventory for a new shop (create entries for all active products)
export const initializeShopInventory = async (shopId: string): Promise<void> => {
  try {
    // Check if shop already has inventory
    const existingInventory = await Inventory.findOne({ shop: shopId });
    if (existingInventory) {
      return; // Shop already has inventory, no need to initialize
    }

    // Get all active products
    const activeProducts = await Product.find({ isActive: true }).lean();

    if (activeProducts.length === 0) {
      return; // No products to initialize
    }

    // Create inventory entries for all products with 0 quantity
    const inventoryEntries = activeProducts.map(product => ({
      product: product._id,
      shop: shopId,
      quantity: 0,
      minStockLevel: 10, // Default minimum stock level
      maxStockLevel: 1000, // Default maximum stock level
    }));

    await Inventory.insertMany(inventoryEntries);
    console.log(`Initialized inventory for shop ${shopId} with ${activeProducts.length} products`);
  } catch (error) {
    console.error('Error initializing shop inventory:', error);
    // Don't throw error, just log it as this is not critical for shop creation
  }
};

// Initialize inventory for a new product (create entries for all active shops)
export const initializeProductInventory = async (productId: string): Promise<void> => {
  try {
    // Check if product already has inventory entries
    const existingInventory = await Inventory.findOne({ product: productId });
    if (existingInventory) {
      return; // Product already has inventory, no need to initialize
    }

    // Get all active shops
    const activeShops = await Shop.find({ isActive: true }).lean();

    if (activeShops.length === 0) {
      return; // No shops to initialize
    }

    // Create inventory entries for all shops with 0 quantity
    const inventoryEntries = activeShops.map(shop => ({
      product: productId,
      shop: shop._id,
      quantity: 0,
      minStockLevel: 10, // Default minimum stock level
      maxStockLevel: 1000, // Default maximum stock level
    }));

    await Inventory.insertMany(inventoryEntries);
    console.log(`Initialized inventory for product ${productId} across ${activeShops.length} shops`);
  } catch (error) {
    console.error('Error initializing product inventory:', error);
    // Don't throw error, just log it as this is not critical for product creation
  }
};

// Admin: Get inventory for a specific shop with all products
export const getShopInventoryForAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shopId } = req.params;

  if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Valid shop ID is required' });
    return;
  }

  try {
    // Verify shop exists
    const shop = await Shop.findById(shopId).lean();
    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    // Get all products and their inventory for this shop
    const inventory = await Inventory.find({ shop: shopId })
      .populate('product', 'name brand type unitPrice imageUrl')
      .lean();

    // If no inventory exists, create entries with 0 quantity for all products
    if (inventory.length === 0) {
      const allProducts = await Product.find({ isActive: true }).lean();
      const inventoryPromises = allProducts.map(product =>
        new Inventory({
          product: product._id,
          shop: shopId,
          quantity: 0,
          minStockLevel: 10,
          maxStockLevel: 1000
        }).save()
      );

      await Promise.all(inventoryPromises);

      // Fetch the newly created inventory
      const newInventory = await Inventory.find({ shop: shopId })
        .populate('product', 'name brand type unitPrice imageUrl')
        .lean();

      res.status(200).json({
        success: true,
        inventory: newInventory
      });
      return;
    }

    res.status(200).json({
      success: true,
      inventory
    });
  } catch (error) {
    console.error('Error fetching shop inventory:', error);
    res.status(500).json({ success: false, message: 'Server error fetching inventory' });
  }
};

// Admin: Update inventory quantity with history tracking
export const updateShopInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shopId } = req.params;
  const { productId, newQuantity, changeType, reason } = req.body;
  const { user } = req;

  if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Valid shop ID is required' });
    return;
  }

  if (!productId || !mongoose.Types.ObjectId.isValid(productId)) {
    res.status(400).json({ success: false, message: 'Valid product ID is required' });
    return;
  }

  if (typeof newQuantity !== 'number' || newQuantity < 0) {
    res.status(400).json({ success: false, message: 'New quantity must be a non-negative number' });
    return;
  }

  if (!changeType || !['increase', 'decrease', 'restock', 'adjustment'].includes(changeType)) {
    res.status(400).json({ success: false, message: 'Valid change type is required' });
    return;
  }

  try {
    // Find or create inventory item
    let inventoryItem = await Inventory.findOne({
      product: productId,
      shop: shopId
    });

    const previousQuantity = inventoryItem ? inventoryItem.quantity : 0;
    const changeAmount = newQuantity - previousQuantity;

    if (!inventoryItem) {
      // Create new inventory item
      inventoryItem = new Inventory({
        product: productId,
        shop: shopId,
        quantity: newQuantity,
        minStockLevel: 10,
        maxStockLevel: 1000,
        lastRestocked: newQuantity > 0 ? new Date() : undefined
      });
    } else {
      // Update existing item
      inventoryItem.quantity = newQuantity;
      if (newQuantity > previousQuantity) {
        inventoryItem.lastRestocked = new Date();
      }
    }

    await inventoryItem.save();

    // Create history record
    const historyRecord = new InventoryHistory({
      inventory: inventoryItem._id,
      product: productId,
      shop: shopId,
      previousQuantity,
      newQuantity,
      changeAmount,
      changeType,
      reason: reason || `Admin ${changeType}`,
      updatedBy: user?.id
    });

    await historyRecord.save();

    // Return updated inventory with product details
    const updatedInventory = await Inventory.findById(inventoryItem._id)
      .populate('product', 'name brand type unitPrice imageUrl')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      inventory: updatedInventory
    });
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ success: false, message: 'Server error updating inventory' });
  }
};

// Admin: Get inventory update history for a shop
export const getShopInventoryHistory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shopId } = req.params;
  const { page = 1, limit = 50 } = req.query;

  if (!shopId || !mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Valid shop ID is required' });
    return;
  }

  try {
    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 50;
    const skip = (pageNum - 1) * limitNum;

    // Verify shop exists
    const shop = await Shop.findById(shopId).lean();
    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    const history = await InventoryHistory.find({ shop: shopId })
      .populate('product', 'name brand type')
      .populate('updatedBy', 'username')
      .sort({ createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();

    const totalRecords = await InventoryHistory.countDocuments({ shop: shopId });

    res.status(200).json({
      success: true,
      history,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalRecords / limitNum),
        totalRecords,
        limit: limitNum
      }
    });
  } catch (error) {
    console.error('Error fetching inventory history:', error);
    res.status(500).json({ success: false, message: 'Server error fetching inventory history' });
  }
};

// Admin: Sync inventory system - ensures all shops have entries for all products
export const syncInventory = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const result = await syncInventorySystem();

    res.status(200).json({
      success: true,
      message: 'Inventory sync completed successfully',
      data: result
    });
  } catch (error) {
    console.error('Error syncing inventory:', error);
    res.status(500).json({
      success: false,
      message: 'Server error syncing inventory system'
    });
  }
};