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

// get inventory details for a specific shop
export const getInventoryByShop = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shopId } = req.params;
  if (!shopId) {
    res.status(400).json({ success: false, message: 'Shop id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Invalid shop id' });
    return;
  }

  try {
    const existingShop = await Shop.findById(shopId).lean();
    if (!existingShop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }
    const inventoryItems = await Inventory.find({ shop: shopId })
      .populate('product', 'name brand size price')
      .lean();
    res.status(200).json({ success: true, inventoryItems });
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