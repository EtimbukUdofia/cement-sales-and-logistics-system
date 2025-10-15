import type { Response } from 'express';
import mongoose from "mongoose";
import type { AuthRequest } from '../interfaces/interface.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import { z } from 'zod';

const createPurchaseOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required').transform((s) => s.trim()),
  product: z.string().min(1, 'Product is required'),
  supplier: z.string().min(1, 'Supplier is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().positive('Unit price must be positive'),
  expectedDeliveryDate: z.string().optional().transform((s) => s ? new Date(s) : undefined),
  notes: z.string().optional().transform((s) => s?.trim() || ''),
});

const updatePurchaseOrderSchema = z.object({
  orderNumber: z.string().min(1, 'Order number is required').transform((s) => s.trim()).optional(),
  product: z.string().min(1, 'Product is required').optional(),
  supplier: z.string().min(1, 'Supplier is required').optional(),
  quantity: z.number().positive('Quantity must be positive').optional(),
  unitPrice: z.number().positive('Unit price must be positive').optional(),
  expectedDeliveryDate: z.string().optional().transform((s) => s ? new Date(s) : undefined),
  status: z.enum(['Pending', 'Approved', 'Delivered', 'Cancelled']).optional(),
  receivedDate: z.string().optional().transform((s) => s ? new Date(s) : undefined),
  notes: z.string().optional().transform((s) => s?.trim() || ''),
});

// Create a new purchase order
export const createPurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createPurchaseOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.format() });
      return;
    }

    const { orderNumber, product, supplier, quantity, unitPrice, expectedDeliveryDate, notes } = parsed.data;

    // Check if purchase order with same order number already exists
    const existingOrder = await PurchaseOrder.findOne({ orderNumber });
    if (existingOrder) {
      res.status(400).json({
        success: false,
        message: 'A purchase order with this order number already exists'
      });
      return;
    }

    // Validate product ID
    if (!mongoose.Types.ObjectId.isValid(product)) {
      res.status(400).json({ success: false, message: 'Invalid product ID' });
      return;
    }
    const productExists = await Product.findById(product);
    if (!productExists) {
      res.status(404).json({ success: false, message: 'Product not found' });
      return;
    }

    // Validate supplier ID
    if (!mongoose.Types.ObjectId.isValid(supplier)) {
      res.status(400).json({ success: false, message: 'Invalid supplier ID' });
      return;
    }
    const supplierExists = await Supplier.findById(supplier);
    if (!supplierExists) {
      res.status(404).json({ success: false, message: 'Supplier not found' });
      return;
    }

    // Calculate total price
    const totalPrice = quantity * unitPrice;

    const purchaseOrder = new PurchaseOrder({
      orderNumber,
      product,
      supplier,
      quantity,
      unitPrice,
      totalPrice,
      expectedDeliveryDate,
      notes,
      createdBy: req.userId,
    });

    await purchaseOrder.save();

    // Populate the purchase order with related data
    const populatedOrder = await PurchaseOrder.findById(purchaseOrder._id)
      .populate('product')
      .populate('supplier')
      .populate('createdBy', 'username email');

    res.status(201).json({
      success: true,
      message: 'Purchase order created successfully',
      data: populatedOrder
    });
  } catch (error) {
    console.error('Create purchase order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get all purchase orders
export const getPurchaseOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, supplier, product, page = '1', limit = '10' } = req.query;

    const filter: any = {};

    if (status) {
      filter.status = status;
    }

    if (supplier) {
      filter.supplier = supplier;
    }

    if (product) {
      filter.product = product;
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const orders = await PurchaseOrder.find(filter)
      .populate('product')
      .populate('supplier')
      .populate('createdBy', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await PurchaseOrder.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get purchase orders error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get purchase order by ID
export const getPurchaseOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid purchase order ID' });
      return;
    }

    const order = await PurchaseOrder.findById(id)
      .populate('product')
      .populate('supplier')
      .populate('createdBy', 'username email');

    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get purchase order by ID error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Update purchase order
export const updatePurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid purchase order ID' });
      return;
    }

    const parsed = updatePurchaseOrderSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, message: 'Validation failed', errors: parsed.error.format() });
      return;
    }

    const updateData = parsed.data;

    // Check for duplicate order number if it's being updated
    if (updateData.orderNumber) {
      const existingOrder = await PurchaseOrder.findOne({
        orderNumber: updateData.orderNumber,
        _id: { $ne: id }
      });

      if (existingOrder) {
        res.status(400).json({
          success: false,
          message: 'A purchase order with this order number already exists'
        });
        return;
      }
    }

    // Validate product ID if being updated
    if (updateData.product) {
      if (!mongoose.Types.ObjectId.isValid(updateData.product)) {
        res.status(400).json({ success: false, message: 'Invalid product ID' });
        return;
      }
      const productExists = await Product.findById(updateData.product);
      if (!productExists) {
        res.status(404).json({ success: false, message: 'Product not found' });
        return;
      }
    }

    // Validate supplier ID if being updated
    if (updateData.supplier) {
      if (!mongoose.Types.ObjectId.isValid(updateData.supplier)) {
        res.status(400).json({ success: false, message: 'Invalid supplier ID' });
        return;
      }
      const supplierExists = await Supplier.findById(updateData.supplier);
      if (!supplierExists) {
        res.status(404).json({ success: false, message: 'Supplier not found' });
        return;
      }
    }

    // Get current order to calculate total price if needed
    const currentOrder = await PurchaseOrder.findById(id);
    if (!currentOrder) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }

    // Recalculate total price if quantity or unit price is being updated
    if (updateData.quantity !== undefined || updateData.unitPrice !== undefined) {
      const newQuantity = updateData.quantity ?? currentOrder.quantity;
      const newUnitPrice = updateData.unitPrice ?? currentOrder.unitPrice;
      (updateData as any).totalPrice = newQuantity * newUnitPrice;
    }

    const order = await PurchaseOrder.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate('product')
      .populate('supplier')
      .populate('createdBy', 'username email');

    res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully',
      data: order
    });
  } catch (error) {
    console.error('Update purchase order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Delete purchase order
export const deletePurchaseOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ success: false, message: 'Invalid purchase order ID' });
      return;
    }

    const order = await PurchaseOrder.findByIdAndDelete(id);

    if (!order) {
      res.status(404).json({ success: false, message: 'Purchase order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Purchase order deleted successfully'
    });
  } catch (error) {
    console.error('Delete purchase order error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Get purchase order statistics
export const getPurchaseOrderStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [
      totalOrders,
      pendingOrders,
      approvedOrders,
      deliveredOrders,
      cancelledOrders,
      totalValue
    ] = await Promise.all([
      PurchaseOrder.countDocuments(),
      PurchaseOrder.countDocuments({ status: 'Pending' }),
      PurchaseOrder.countDocuments({ status: 'Approved' }),
      PurchaseOrder.countDocuments({ status: 'Delivered' }),
      PurchaseOrder.countDocuments({ status: 'Cancelled' }),
      PurchaseOrder.aggregate([
        { $group: { _id: null, total: { $sum: '$totalPrice' } } }
      ])
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOrders,
        pendingOrders,
        approvedOrders,
        deliveredOrders,
        cancelledOrders,
        totalValue: totalValue[0]?.total || 0
      }
    });
  } catch (error) {
    console.error('Get purchase order stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};