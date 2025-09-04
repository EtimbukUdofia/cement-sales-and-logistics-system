import type { Response } from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../interfaces/interface.ts';
import Inventory from '../models/Inventory.ts';
import Product from '../models/Product.ts';
import Shop from '../models/Shop.ts';

// get inventory summary for all shops
export const getInventorySummary = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
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
          shopLocation: '$shopDetails.location',
          totalItems: 1,
          totalValue: 1,
          lowStockCount: 1,
        },
      },
      // Sort by shop name
      { $sort: { shopName: 1 } }
    ]);
    res.status(200).json({ success: true, inventorySummary });
  } catch (error) {
    console.error('Get Inventory Summary Error:', (error as Error).message);
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
      .populate('shop', 'name location')
      .sort({ 'product.name': 1 })
      .lean();

    res.status(200).json({ success: true, data: inventoryItems });
  } catch (error) {
    console.error('Get Inventory By Shop Error:', (error as Error).message);
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
      .populate('shop', 'name address location')
      .lean()
      .exec();
    res.status(200).json({ success: true, inventoryItems });
  } catch (error) {
    console.error('Get Inventory By Product Error:', (error as Error).message);
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
    console.error('Adjust Inventory Level Error:', (error as Error).message);
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
    console.error('Add Stock To Inventory Error:', (error as Error).message);
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
            location: '$shopDetails.location',
          },
        },
      },
    ]).exec();

    res.status(200).json({ success: true, lowStockItems });
  } catch (error) {
    console.error('Get Low Stock Products Error:', (error as Error).message);
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
      .populate('shop', 'name location')
      .sort({ 'shop.name': 1, 'product.name': 1 })
      .lean();

    res.status(200).json({ success: true, data: inventory });
  } catch (error) {
    console.error('Get All Inventory Error:', (error as Error).message);
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
    console.error('Get Inventory Stats Error:', (error as Error).message);
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
      .populate('shop', 'name location')
      .lean();

    res.status(200).json({
      success: true,
      message: 'Inventory updated successfully',
      data: updatedItem
    });
  } catch (error) {
    console.error('Update Inventory Stock Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error updating inventory' });
  }
};