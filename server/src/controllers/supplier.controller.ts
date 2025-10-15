import type { Response } from 'express';
import mongoose from "mongoose";
import type { AuthRequest } from '../interfaces/interface.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import { z } from 'zod';
import { escapeRegExp } from '../utils.js';

const createSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required').transform((s) => s.trim()),
  address: z.string().optional().transform((s) => s?.trim() || ''),
  contactPerson: z.string().optional().transform((s) => s?.trim() || ''),
  phone: z.string().min(1, 'Phone is required').transform((s) => s.trim()),
  email: z.string().email('Invalid email format').optional().transform((s) => s?.trim() || ''),
  products: z.array(z.string()).optional(),
  isActive: z.boolean().optional().default(true),
});

const updateSupplierSchema = z.object({
  name: z.string().min(1, 'Name is required').transform((s) => s.trim()).optional(),
  address: z.string().optional().transform((s) => s?.trim() || ''),
  contactPerson: z.string().optional().transform((s) => s?.trim() || ''),
  phone: z.string().min(1, 'Phone is required').transform((s) => s.trim()).optional(),
  email: z.string().email('Invalid email format').optional().transform((s) => s?.trim() || ''),
  products: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// Create a new supplier
export const createSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.format() });
      return;
    }

    const { name, address, contactPerson, phone, email, products, isActive } = parsed.data;

    // Check if supplier with same name already exists
    const existingSupplier = await Supplier.findOne({
      name: { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') }
    });

    if (existingSupplier) {
      res.status(400).json({
        success: false,
        message: 'A supplier with this name already exists'
      });
      return;
    }

    // Validate product IDs if provided
    if (products && products.length > 0) {
      const validProducts = await Product.find({ _id: { $in: products } });
      if (validProducts.length !== products.length) {
        res.status(400).json({
          success: false,
          message: 'One or more product IDs are invalid'
        });
        return;
      }
    }

    const supplier = new Supplier({
      name,
      address,
      contactPerson,
      phone,
      email,
      products: products || [],
      isActive,
    });

    await supplier.save();

    // Populate the supplier with product details
    const populatedSupplier = await Supplier.findById(supplier._id).populate('products');

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: populatedSupplier
    });
  } catch (error) {
    console.error('Create supplier error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all suppliers
export const getSuppliers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, isActive } = req.query;

    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: escapeRegExp(search as string), $options: 'i' } },
        { contactPerson: { $regex: escapeRegExp(search as string), $options: 'i' } },
        { address: { $regex: escapeRegExp(search as string), $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const suppliers = await Supplier.find(filter)
      .populate('products')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: suppliers
    });
  } catch (error) {
    console.error('Get suppliers error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get supplier by ID
export const getSupplierById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid supplier ID' });
      return;
    }

    const supplier = await Supplier.findById(id).populate('products');

    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: supplier
    });
  } catch (error) {
    console.error('Get supplier by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update supplier
export const updateSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid supplier ID' });
      return;
    }

    const parsed = updateSupplierSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.format() });
      return;
    }

    const updateData = parsed.data;

    // Check for duplicate name if name is being updated
    if (updateData.name) {
      const existingSupplier = await Supplier.findOne({
        name: { $regex: new RegExp(`^${escapeRegExp(updateData.name)}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingSupplier) {
        res.status(400).json({
          success: false,
          message: 'A supplier with this name already exists'
        });
        return;
      }
    }

    // Validate product IDs if provided
    if (updateData.products && updateData.products.length > 0) {
      const validProducts = await Product.find({ _id: { $in: updateData.products } });
      if (validProducts.length !== updateData.products.length) {
        res.status(400).json({
          success: false,
          message: 'One or more product IDs are invalid'
        });
        return;
      }
    }

    const supplier = await Supplier.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('products');

    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });
  } catch (error) {
    console.error('Update supplier error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete supplier
export const deleteSupplier = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid supplier ID' });
      return;
    }

    const supplier = await Supplier.findByIdAndDelete(id);

    if (!supplier) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Supplier deleted successfully'
    });
  } catch (error) {
    console.error('Delete supplier error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};