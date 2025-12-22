import mongoose from "mongoose";
import type { Response } from "express";
import type { AuthRequest } from "../interfaces/interface.js";
import SalesOrder from "../models/SalesOrder.js";
import Inventory from "../models/Inventory.js";
import Customer from "../models/Customer.js";
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
  const { orderNumber, customer, shop, items, paymentMethod, salesPerson, isDelivery, onloadingCost, deliveryCost, offloadingCost } = req.body;

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
  let totalBags = 0;
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
    totalBags += item.quantity; // Sum up total bags
  }

  // Validate additional costs if delivery is selected
  const deliveryData = {
    isDelivery: isDelivery || false,
    onloadingCost: 0,
    deliveryCost: 0,
    offloadingCost: 0
  };

  if (isDelivery) {
    // Validate additional costs are non-negative numbers
    if (onloadingCost !== undefined && (typeof onloadingCost !== 'number' || onloadingCost < 0)) {
      res.status(400).json({ success: false, message: 'onloadingCost must be a non-negative number' });
      return;
    }
    if (deliveryCost !== undefined && (typeof deliveryCost !== 'number' || deliveryCost < 0)) {
      res.status(400).json({ success: false, message: 'deliveryCost must be a non-negative number' });
      return;
    }
    if (offloadingCost !== undefined && (typeof offloadingCost !== 'number' || offloadingCost < 0)) {
      res.status(400).json({ success: false, message: 'offloadingCost must be a non-negative number' });
      return;
    }

    // Calculate costs per bag
    deliveryData.onloadingCost = (onloadingCost || 0) * totalBags;
    deliveryData.deliveryCost = (deliveryCost || 0) * totalBags;
    deliveryData.offloadingCost = (offloadingCost || 0) * totalBags;

    // Add additional costs to total (already multiplied by totalBags)
    computedTotal += deliveryData.onloadingCost + deliveryData.deliveryCost + deliveryData.offloadingCost;
  }

  // If client provided totalAmount, prefer computed total to avoid tampering
  const finalTotal = Number(computedTotal.toFixed(2));

  // i can check for tmpering and log by comparing cmoputed total and totalAmount from the client and then log the suspicious activity

  try {
    // Always reduce inventory at order creation (customer has paid, cement belongs to them)
    const initialStatus = req.body.status || 'Not Collected';

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

    // Create the sales order with collectedQuantity initialized
    const itemsWithCollection = items.map(item => ({
      ...item,
      collectedQuantity: initialStatus === 'Collected' ? item.quantity : 0
    }));

    const newSalesOrder = new SalesOrder({
      ...req.body,
      items: itemsWithCollection,
      status: initialStatus,
      totalAmount: finalTotal,
      salesPerson: req.userId,
      isDelivery: deliveryData.isDelivery,
      onloadingCost: deliveryData.onloadingCost,
      deliveryCost: deliveryData.deliveryCost,
      offloadingCost: deliveryData.offloadingCost,
      collectedDate: initialStatus === 'Collected' ? new Date() : null
    });
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

// update sales order status (e.g., Collected, Not Collected, Pending Correction)
export const updateSalesOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  const allowedStatuses = ['Collected', 'Not Collected', 'Pending Correction'];

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

    // Update collected quantities and status
    const update: any = { status };

    if (status === 'Collected') {
      // Mark all items as fully collected
      update.collectedDate = new Date();

      // Update each item's collectedQuantity to match quantity
      const updatedItems = currentOrder.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        collectedQuantity: item.quantity
      }));
      update.items = updatedItems;
    } else {
      update.collectedDate = null;
    }

    const updated = await SalesOrder.findByIdAndUpdate(id, update, { new: true })
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .lean();

    if (!updated) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Sales order status updated successfully', salesOrder: updated });
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

    // Restore inventory if the order was collected
    if (salesOrder.status === 'Collected') {
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

// Flag an order for correction
export const flagOrderForCorrection = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { correctionNotes } = req.body;

  if (!id) {
    res.status(400).json({ success: false, message: 'Sales order id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid sales order id' });
    return;
  }

  if (!correctionNotes || typeof correctionNotes !== 'string' || correctionNotes.trim() === '') {
    res.status(400).json({ success: false, message: 'Correction notes are required' });
    return;
  }

  try {
    const updated = await SalesOrder.findByIdAndUpdate(
      id,
      {
        status: 'Pending Correction',
        needsCorrection: true,
        correctionNotes: correctionNotes.trim(),
        correctionRequestedAt: new Date(),
        correctionRequestedBy: req.userId
      },
      { new: true }
    )
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .populate('correctionRequestedBy', 'username email')
      .lean();

    if (!updated) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order flagged for correction successfully',
      salesOrder: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error flagging order for correction' });
  }
};

// Get all orders needing correction (Admin)
export const getOrdersNeedingCorrection = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await SalesOrder.find({ needsCorrection: true, status: 'Pending Correction' })
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .populate('salesPerson', 'username email')
      .populate('correctionRequestedBy', 'username email')
      .sort({ correctionRequestedAt: -1 })
      .lean();

    res.status(200).json({ success: true, orders, totalCount: orders.length });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching orders needing correction' });
  }
};

// Get not collected orders (Sales Person)
export const getNotCollectedOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Optionally filter by shop if provided
    const filter: any = { status: 'Not Collected' };

    // If sales person, filter by their shop
    if (req.query.shopId) {
      filter.shop = req.query.shopId;
    }

    const orders = await SalesOrder.find(filter)
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .populate('salesPerson', 'username email')
      .sort({ orderDate: -1 })
      .lean();

    // Calculate total cement not collected (remaining quantities only)
    let totalBags = 0;
    let totalValue = 0;

    for (const order of orders) {
      // Calculate remaining bags (ordered - collected)
      const orderBags = order.items.reduce((sum: number, item: any) => {
        const remaining = item.quantity - (item.collectedQuantity || 0);
        return sum + remaining;
      }, 0);

      // Calculate remaining value proportionally
      const orderRemainingValue = order.items.reduce((sum: number, item: any) => {
        const remaining = item.quantity - (item.collectedQuantity || 0);
        const proportionalValue = (remaining / item.quantity) * item.totalPrice;
        return sum + proportionalValue;
      }, 0);

      // Add delivery costs if it's a delivery order
      const deliveryCosts = order.isDelivery
        ? (order.onloadingCost || 0) + (order.deliveryCost || 0) + (order.offloadingCost || 0)
        : 0;

      totalBags += orderBags;
      totalValue += orderRemainingValue + deliveryCosts;
    }

    res.status(200).json({
      success: true,
      orders,
      totalCount: orders.length,
      totalBags,
      totalValue
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching not collected orders' });
  }
};

// Resolve correction (Admin can edit and mark as resolved)
export const resolveOrderCorrection = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status, items, customerName, customerPhone, customerEmail, ...updateData } = req.body;

  if (!id) {
    res.status(400).json({ success: false, message: 'Sales order id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid sales order id' });
    return;
  }

  try {
    const currentOrder = await SalesOrder.findById(id).lean();
    if (!currentOrder) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    // Update customer details if provided
    const customerUpdate: { name?: string; phone?: string; email?: string } = {};
    
    if (customerName && typeof customerName === 'string' && customerName.trim()) {
      customerUpdate.name = customerName.trim();
    }
    if (customerPhone && typeof customerPhone === 'string' && customerPhone.trim()) {
      customerUpdate.phone = customerPhone.trim();
    }
    if (customerEmail !== undefined) {
      if (typeof customerEmail === 'string' && customerEmail.trim()) {
        customerUpdate.email = customerEmail.trim();
      }
    }

    if (Object.keys(customerUpdate).length > 0) {
      const updatedCustomer = await Customer.findByIdAndUpdate(
        currentOrder.customer,
        customerUpdate,
        { new: true }
      );
      console.log('Customer updated:', updatedCustomer);
    }

    // If items were changed and order was previously collected, adjust inventory
    if (items && currentOrder.status === 'Collected') {
      const oldItems = currentOrder.items;

      // First, restore old inventory (add back what was deducted)
      for (const oldItem of oldItems) {
        await Inventory.findOneAndUpdate(
          {
            product: oldItem.product,
            shop: currentOrder.shop
          },
          {
            $inc: { quantity: oldItem.quantity }
          }
        );
      }

      // Then, deduct new inventory (if still collected)
      const newStatus = status || currentOrder.status;
      if (newStatus === 'Collected') {
        for (const newItem of items) {
          const inventory = await Inventory.findOne({
            product: newItem.product,
            shop: currentOrder.shop
          });

          if (!inventory || inventory.quantity < newItem.quantity) {
            res.status(400).json({
              success: false,
              message: `Insufficient inventory for updated product`
            });
            return;
          }

          await Inventory.findOneAndUpdate(
            {
              product: newItem.product,
              shop: currentOrder.shop
            },
            {
              $inc: { quantity: -newItem.quantity }
            }
          );
        }
      }
    }

    // Clear correction flags and update
    const update: any = {
      ...updateData,
      needsCorrection: false,
      correctionNotes: null,
      status: status || 'Not Collected' // Default to Not Collected after correction
    };

    // Include items if provided
    if (items) {
      update.items = items;

      // Recalculate totalAmount if items changed
      if (!updateData.totalAmount) {
        const itemsTotal = items.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);
        const deliveryCosts = (currentOrder.onloadingCost || 0) + (currentOrder.deliveryCost || 0) + (currentOrder.offloadingCost || 0);
        update.totalAmount = itemsTotal + deliveryCosts;
      }
    }

    const updated = await SalesOrder.findByIdAndUpdate(id, update, { new: true })
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .populate('salesPerson', 'username email')
      .lean();

    if (!updated) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Order correction resolved successfully',
      salesOrder: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error resolving order correction' });
  }
};

// Record partial collection of cement
export const recordPartialCollection = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { collections } = req.body; // Array of { productId, quantityCollected }

  if (!id) {
    res.status(400).json({ success: false, message: 'Sales order id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid sales order id' });
    return;
  }

  if (!Array.isArray(collections) || collections.length === 0) {
    res.status(400).json({ success: false, message: 'Collections array is required' });
    return;
  }

  try {
    const order = await SalesOrder.findById(id);
    if (!order) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    if (order.status === 'Collected') {
      res.status(400).json({ success: false, message: 'Order is already fully collected' });
      return;
    }

    // Update collected quantities for each item
    let allFullyCollected = true;
    const updatedItems = order.items.map((item: any) => {
      const collection = collections.find(c => c.productId === item.product.toString());

      if (collection) {
        const currentCollected = item.collectedQuantity || 0;
        const newCollected = Math.min(currentCollected + collection.quantityCollected, item.quantity);

        if (newCollected < item.quantity) {
          allFullyCollected = false;
        }

        return {
          ...item.toObject(),
          collectedQuantity: newCollected
        };
      }

      if ((item.collectedQuantity || 0) < item.quantity) {
        allFullyCollected = false;
      }

      return item.toObject();
    });

    // Update order with new collected quantities
    const update: any = {
      items: updatedItems
    };

    // If all items are fully collected, update status
    if (allFullyCollected) {
      update.status = 'Collected';
      update.collectedDate = new Date();
    }

    const updated = await SalesOrder.findByIdAndUpdate(id, update, { new: true })
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .populate('salesPerson', 'username email')
      .lean();

    if (!updated) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }

    res.status(200).json({
      success: true,
      message: allFullyCollected ? 'All items collected successfully' : 'Partial collection recorded successfully',
      salesOrder: updated
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error recording partial collection' });
  }
};