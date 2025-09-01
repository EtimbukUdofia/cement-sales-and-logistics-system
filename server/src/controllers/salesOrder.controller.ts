import mongoose from "mongoose";
import type { Response } from "express";
import type { AuthRequest } from "../interfaces/interface.ts";
import SalesOrder from "../models/SalesOrder.ts";

//  get all sales orders
export const getAllSalesOrders = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const salesOrders = await SalesOrder.find().populate('customer').populate('shop').populate('items.product').lean();
    res.status(200).json({ success: true, salesOrders });
  } catch (error) {
    console.error('Get All Sales Orders Error:', (error as Error).message);
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
    console.error('Get Sales Order By ID Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error fetching sales order' });
  }
};

// create a sales order
export const createSalesOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  const { orderNumber, customer, shop, items, paymentMethod, salesPerson } = req.body;

  if (!orderNumber || !customer || !shop || !Array.isArray(items) || items.length === 0 || !paymentMethod || !salesPerson) {
    res.status(400).json({ success: false, message: 'Missing required fields' });
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
    if (typeof item.price !== 'number' || item.unitPrice < 0) {
      res.status(400).json({ success: false, message: 'Each item must include a valid price >= 0' });
      return;
    }
    computedTotal += item.quantity * item.unitPrice;
  }

  // If client provided totalAmount, prefer computed total to avoid tampering
  const finalTotal = Number(computedTotal.toFixed(2));

  try {
    const newSalesOrder = new SalesOrder({...req.body, status: 'Pending', totalAmount: finalTotal, salesPerson: req.userId });
    const result = await newSalesOrder.save();

    // populate before returning
    const populated = await SalesOrder.findById(result._id)
      .populate('customer')
      .populate('shop')
      .populate('items.product')
      .lean();

    res.status(201).json({ success: true, message: 'Sales order created successfully', salesOrder: populated });
  } catch (error) {
    console.error('Create Sales Order Error:', (error as Error).message);
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

    res.status(200).json({ success: true, message: 'Sales order status updated successfully', salesOrder: updated });
  } catch (error) {
    console.error('Update Sales Order Status Error:', (error as Error).message);
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
    const deletedSalesOrder = await SalesOrder.findByIdAndDelete(id).lean();

    if (!deletedSalesOrder) {
      res.status(404).json({ success: false, message: 'Sales order not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Sales order deleted successfully', salesOrder: deletedSalesOrder });
  } catch (error) {
    console.error('Delete Sales Order Error:', (error as Error).message);
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
    console.error('Get Sales Orders By Customer Error:', (error as Error).message);
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
    console.error('Get Sales Orders By Shop Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error fetching sales orders for shop' });
  }
};