import type { Response } from 'express';
import mongoose from "mongoose";
import type { AuthRequest } from '../interfaces/interface.js';
import Product from '../models/Product.js';
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

    const { name, brand, price, size, variant, imageUrl, description, isActive } = parsed.data;

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
    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
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