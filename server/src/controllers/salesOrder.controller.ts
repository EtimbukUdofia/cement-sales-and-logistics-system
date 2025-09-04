import mongoose from "mongoose";
import type { Response } from "express";
import type { AuthRequest } from "../interfaces/interface.js";
import SalesOrder from "../models/SalesOrder.js";
import Inventory from "../models/Inventory.js";
import { updateCustomerStats } from "./customer.controller.js";

// Helper function to reduce inventory quantities
const reduceInventoryQuantities = async (shopId: string, items: Array<{ product: string, quantity: number }>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const inventoryUpdates = [];
    const insufficientStockItems = [];

    // Check stock availability and prepare updates
    for (const item of items) {
      const inventory = await Inventory.findOne({
        product: item.product,
        shop: shopId
      }).session(session);

      if (!inventory) {
        throw new Error(`No inventory record found for product ${item.product} in shop ${shopId}`);
      }

      if (inventory.quantity < item.quantity) {
        insufficientStockItems.push({
          product: item.product,
          available: inventory.quantity,
          requested: item.quantity
        });
        continue;
      }

      inventoryUpdates.push({
        inventoryId: inventory._id,
        newQuantity: inventory.quantity - item.quantity
      });
    }

    // If any items have insufficient stock, abort the transaction
    if (insufficientStockItems.length > 0) {
      await session.abortTransaction();
      return {
        success: false,
        error: 'Insufficient stock',
        details: insufficientStockItems
      };
    }

    // Update all inventory quantities
    for (const update of inventoryUpdates) {
      await Inventory.findByIdAndUpdate(
        update.inventoryId,
        { quantity: update.newQuantity },
        { session }
      );
    }

    await session.commitTransaction();
    return { success: true };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

// Helper function to restore inventory quantities when order is cancelled
const restoreInventoryQuantities = async (shopId: string, items: Array<{ product: string, quantity: number }>) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Restore inventory quantities
    for (const item of items) {
      await Inventory.findOneAndUpdate(
        {
          product: item.product,
          shop: shopId
        },
        {
          $inc: { quantity: item.quantity }
        },
        { session, upsert: false }
      );
    }

    await session.commitTransaction();
    return { success: true };

  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

//  get all sales orders
export const getAllSalesOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const salesOrders = await SalesOrder.find().populate('customer').populate('shop').populate('items.product').lean();
    res.status(200).json({ success: true, salesOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching sales orders' });
  }
};

// get sales order by id
export const getSalesOrderById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  if (!id) {
    res.status(400).json({ success: false, message: 'Sales order id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid sales order id' });
    return;
  }

  try {
    const salesOrder = await SalesOrder.findById(id)
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .lean();
    if (!salesOrder) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    res.status(200).json({ success: true, salesOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching sales order' });
  }
};

// create a sales order
export const createSalesOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderNumber, customer, shop, items, paymentMethod, salesPerson } = req.body;

  if (!orderNumber || typeof orderNumber !== 'string' || orderNumber.trim() === '') {
    res.status(400).json({ success: false, message: 'orderNumber is required and must be a non-empty string' });
    return;
  }

  if (!customer) {
    res.status(400).json({ success: false, message: 'customer id is required' });
    return;
  }

  if (!shop) {
    res.status(400).json({ success: false, message: 'shop id is required' });
    return;
  }

  if (!Array.isArray(items)) {
    res.status(400).json({ success: false, message: 'items is required and must be an array' });
    return;
  }

  if (items.length === 0) {
    res.status(400).json({ success: false, message: 'items must contain at least one item' });
    return;
  }

  if (!paymentMethod || typeof paymentMethod !== 'string' || paymentMethod.trim() === '') {
    res.status(400).json({ success: false, message: 'paymentMethod is required and must be a non-empty string' });
    return;
  }

  if (!salesPerson) {
    res.status(400).json({ success: false, message: 'salesPerson is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(customer) || !mongoose.Types.ObjectId.isValid(shop)) {
    res.status(400).json({ success: false, message: 'Invalid customer or shop id' });
    return;
  }

  // validate items and compute total
  let computedTotal = 0;
  for (const item of items) {
    if (!item || !item.product || !mongoose.Types.ObjectId.isValid(String(item.product))) {
      res.status(400).json({ success: false, message: 'Each item must include a valid product id' });
      return;
    }
    if (typeof item.quantity !== 'number' || item.quantity <= 0) {
      res.status(400).json({ success: false, message: 'Each item must include a valid quantity > 0' });
      return;
    }
    if (typeof item.unitPrice !== 'number' || item.unitPrice < 0) {
      res.status(400).json({ success: false, message: 'Each item must include a valid price >= 0' });
      return;
    }
    computedTotal += item.quantity * item.unitPrice;
  }

  // If client provided totalAmount, prefer computed total to avoid tampering
  const finalTotal = Number(computedTotal.toFixed(2));

  // i can check for tmpering and log by comparing cmoputed total and totalAmount from the client and then log the suspicious activity

  try {
    // Check and reduce inventory before creating the sales order
    const inventoryResult = await reduceInventoryQuantities(shop, items);

    if (!inventoryResult.success) {
      if (inventoryResult.error === 'Insufficient stock') {
        res.status(400).json({
          success: false,
          message: 'Insufficient stock for some items',
          insufficientStockItems: inventoryResult.details
        });
        return;
      } else {
        throw new Error(inventoryResult.error || 'Failed to update inventory');
      }
    }

    // Create the sales order after successful inventory reduction
    const newSalesOrder = new SalesOrder({ ...req.body, status: 'Pending', totalAmount: finalTotal, salesPerson: req.userId });
    const result = await newSalesOrder.save();

    // Update customer statistics
    try {
      await updateCustomerStats(customer, finalTotal, true);
    } catch (statsError) {
      // Don't fail the order creation if stats update fails
    }

    // populate before returning
    const populated = await SalesOrder.findById(result._id)
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .lean();

    res.status(201).json({ success: true, message: 'Sales order created successfully and inventory updated', salesOrder: populated });
  } catch (error) {
    const errAny = error as any;
    if (errAny.code === 11000 || errAny.codeName === 'DuplicateKey') {
      res.status(400).json({ success: false, message: 'Duplicate order number. A sales order with this order number already exists.' });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error creating sales order' });
  }
};

// update sales order status (e.g., Pending, Completed, Cancelled, Delivered)
export const updateSalesOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['Pending', 'Completed', 'Cancelled', 'Delivered'];

  if (!id) {
    res.status(400).json({ success: false, message: 'Sales order id is required' });
    return;
  }

  if (!status || typeof status !== 'string' || !allowedStatuses.includes(status)) {
    res.status(400).json({ success: false, message: `Invalid status. Allowed: ${allowedStatuses.join(', ')}` });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid sales order id' });
    return;
  }

  try {
    // Get the current sales order to check status changes
    const currentOrder = await SalesOrder.findById(id).lean();
    if (!currentOrder) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    // Check if order is being cancelled and was previously not cancelled
    const isCancelling = status === 'Cancelled' && currentOrder.status !== 'Cancelled';

    // If cancelling the order, restore inventory
    if (isCancelling) {
      try {
        const itemsForInventory = Array.from(currentOrder.items).map(item => ({
          product: item.product.toString(),
          quantity: item.quantity
        }));
        await restoreInventoryQuantities(currentOrder.shop.toString(), itemsForInventory);
      } catch (inventoryError) {
        res.status(500).json({
          success: false,
          message: 'Failed to restore inventory when cancelling order'
        });
        return;
      }
    }

    const update: any = { status };
    // set deliveredDate when status is Delivered, otherwise clear it
    update.deliveredDate = status === 'Delivered' ? new Date() : null;

    const updated = await SalesOrder.findByIdAndUpdate(id, update, { new: true })
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .lean();

    if (!updated) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    const message = isCancelling
      ? 'Sales order cancelled and inventory restored successfully'
      : 'Sales order status updated successfully';

    res.status(200).json({ success: true, message, salesOrder: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating sales order status' });
  }
};

// delete a sales order
export const deleteSalesOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Sales order id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid sales order id' });
    return;
  }

  try {
    // Get the sales order before deleting to restore inventory if needed
    const salesOrder = await SalesOrder.findById(id).lean();

    if (!salesOrder) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    // Restore inventory if the order wasn't already cancelled
    if (salesOrder.status !== 'Cancelled') {
      try {
        const itemsForInventory = Array.from(salesOrder.items).map(item => ({
          product: item.product.toString(),
          quantity: item.quantity
        }));
        await restoreInventoryQuantities(salesOrder.shop.toString(), itemsForInventory);
      } catch (inventoryError) {
        res.status(500).json({
          success: false,
          message: 'Failed to restore inventory when deleting order'
        });
        return;
      }
    }

    // Delete the sales order
    await SalesOrder.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Sales order deleted successfully and inventory restored',
      salesOrder: salesOrder
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting sales order' });
  }
};

// get sales orders for a specific customer
export const getSalesOrdersByCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { customerId } = req.params;

  if (!customerId) {
    res.status(400).json({ success: false, message: 'Customer id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(customerId)) {
    res.status(400).json({ success: false, message: 'Invalid customer id' });
    return;
  }

  try {
    const salesOrders = await SalesOrder.find({ customer: customerId })
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .lean();

    res.status(200).json({ success: true, salesOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching sales orders for customer' });
  }
};

// get sales orders for a specific shop
export const getSalesOrdersByShop = async (req: AuthRequest, res: Response): Promise<void> => {
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
    const salesOrders = await SalesOrder.find({ shop: shopId })
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .lean();

    res.status(200).json({ success: true, salesOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching sales orders for shop' });
  }
};