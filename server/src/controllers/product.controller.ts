import type { Response } from 'express';
import mongoose from "mongoose";
import type { AuthRequest } from '../interfaces/interface.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import InventoryHistory from '../models/InventoryHistory.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import SalesOrder from '../models/SalesOrder.js';
import { z } from 'zod';
import { escapeRegExp } from '../utils.js';
import { initializeProductInventory } from './inventory.controller.js';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required').transform((s) => s.trim()),
  variant: z.string().optional().transform((s) => s?.trim() || ''),
  brand: z.string().min(1, 'Brand is required').transform((s) => s.trim()),
  size: z.preprocess((v) => Number(v), z.number().positive('Size must be a positive number')),
  price: z.preprocess((v) => Number(v), z.number().positive('Price must be a positive number')),
  imageUrl: z.string().optional().transform((s) => s?.trim() || ''),
  description: z.string().optional().transform((s) => s?.trim() || ''),
  isActive: z.boolean().optional().default(true),
});

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: z.treeifyError(parsed.error) });
      return;
    }

    const { name, brand, variant } = parsed.data;

    const existingProduct = await Product.findOne({ name, brand, variant });
    if (existingProduct) {
      res.status(409).json({ success: false, message: 'Product with the same name and brand already exists' });
      return;
    }

    const newProduct = new Product(parsed.data);
    const result = await newProduct.save();

    // Initialize inventory for the new product (create entries for all active shops)
    await initializeProductInventory(result._id.toString());

    res.status(201).json({ success: true, message: 'Product created successfully', product: result });
  } catch (error) {
    const errAny = error as any;
    if (errAny?.code === 11000 || errAny?.codeName === 'DuplicateKey') {
      const conflictFields = errAny.keyValue ? Object.keys(errAny.keyValue) : ['unknown'];
      const detail = errAny.keyValue ?? { message: errAny.message };
      res.status(409).json({
        success: false,
        message: `Duplicate ${conflictFields.join(', ')} value(s)`,
        detail
      });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error during product creation' });
  }
};

export const getProducts = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const products = await Product.find();
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching products' });
  }
};

export const getProductsWithInventory = async (req: AuthRequest, res: Response): Promise<void> => {
  const { shopId } = req.params;

  if (!shopId) {
    res.status(400).json({ success: false, message: 'Shop ID is required' });
    return;
  }

  // check if valid mongoose id
  if (!mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Invalid shop ID' });
    return;
  }

  try {
    const productsWithInventory = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $lookup: {
          from: 'inventories',
          let: { productId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$product', '$$productId'] },
                    { $eq: ['$shop', new mongoose.Types.ObjectId(shopId)] }
                  ]
                }
              }
            }
          ],
          as: 'inventory'
        }
      },
      {
        $addFields: {
          availableStock: {
            $ifNull: [{ $arrayElemAt: ['$inventory.quantity', 0] }, 0]
          }
        }
      },
      {
        $project: {
          id: '$_id',
          name: 1,
          variant: 1,
          brand: 1,
          size: 1,
          price: 1,
          imageUrl: 1,
          description: 1,
          availableStock: 1,
          _id: 0
        }
      },
      { $sort: { brand: 1, name: 1 } }
    ]);

    res.status(200).json({
      success: true,
      products: productsWithInventory,
      shopId
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching products with inventory' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Product id is required' });
    return;
  }

  // check if valid mongoose id
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid product id' });
    return;
  }

  try {
    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching product' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Product id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid product id' });
    return;
  }

  try {
    const parsed = createProductSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: z.treeifyError(parsed.error) });
      return;
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, parsed.data, { new: true });
    if (!updatedProduct) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    const errAny = error as any;
    if (errAny?.code === 11000 || errAny?.codeName === 'DuplicateKey') {
      const conflictFields = errAny.keyValue ? Object.keys(errAny.keyValue) : ['unknown'];
      const detail = errAny.keyValue ?? { message: errAny.message };
      res.status(409).json({
        success: false,
        message: `Duplicate ${conflictFields.join(', ')} value(s)`,
        detail
      });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error updating product' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Product id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid product id' });
    return;
  }

  try {
    // First, check if the product exists
    const productToDelete = await Product.findById(id);
    if (!productToDelete) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Check for active references that might prevent deletion
    const [activePurchaseOrders, activeSalesOrders] = await Promise.all([
      PurchaseOrder.countDocuments({
        'items.product': id,
        status: { $in: ['pending', 'approved', 'processing'] }
      }),
      SalesOrder.countDocuments({
        'items.product': id,
        status: { $in: ['pending', 'confirmed', 'processing'] }
      })
    ]);

    // If there are active orders, warn but still allow deletion
    const warnings = [];
    if (activePurchaseOrders > 0) {
      warnings.push(`${activePurchaseOrders} active purchase order(s) reference this product`);
    }
    if (activeSalesOrders > 0) {
      warnings.push(`${activeSalesOrders} active sales order(s) reference this product`);
    }

    // Start a transaction to ensure all deletions happen atomically
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Delete all inventory history records for this product
      const historyDeleteResult = await InventoryHistory.deleteMany(
        { product: id },
        { session }
      );

      // Delete all inventory records for this product
      const inventoryDeleteResult = await Inventory.deleteMany(
        { product: id },
        { session }
      );

      // Finally, delete the product itself
      const deletedProduct = await Product.findByIdAndDelete(id, { session });

      // Commit the transaction
      await session.commitTransaction();

      console.log(`Product deletion completed:
        - Product: ${deletedProduct?.name}
        - Inventory records deleted: ${inventoryDeleteResult.deletedCount}
        - History records deleted: ${historyDeleteResult.deletedCount}`);

      const response: any = {
        success: true,
        message: 'Product and related inventory data deleted successfully',
        product: deletedProduct,
        deletedCounts: {
          inventoryRecords: inventoryDeleteResult.deletedCount,
          historyRecords: historyDeleteResult.deletedCount
        }
      };

      // Include warnings if any
      if (warnings.length > 0) {
        response.warnings = warnings;
      }

      res.status(200).json(response);
    } catch (transactionError) {
      // Rollback the transaction on error
      await session.abortTransaction();
      throw transactionError;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.error('Error deleting product and related data:', error);
    res.status(500).json({ success: false, message: 'Server error deleting product' });
  }
};

// Get distinct product brands
export const getDistinctBrands = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const brands = (await Product.distinct('brand')).filter(Boolean).sort();
    res.status(200).json({ success: true, brands });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching brands' });
  }
};

//  Get products by brand
export const getProductsByBrand = async (req: AuthRequest, res: Response): Promise<void> => {
  const rawBrand = req.params.brand;

  if (!rawBrand || !rawBrand.trim()) {
    res.status(400).json({ success: false, message: 'Brand is required' });
    return;
  }

  const brand = rawBrand.trim();
  try {
    // case-insensitive exact match (safe)
    const regex = new RegExp(`^${escapeRegExp(brand)}$`, 'i');
    const products = await Product.find({ brand: regex });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching products by brand' });
  }
};