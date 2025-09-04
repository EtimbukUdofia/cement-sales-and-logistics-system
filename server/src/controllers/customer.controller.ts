import mongoose from "mongoose";
import type { Response } from "express";
import type { AuthRequest } from "../interfaces/interface.js";
import Customer from "../models/Customer.js";
import { z } from "zod";
import SalesOrder from "../models/SalesOrder.js";

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').transform((s) => s.trim()),
  email: z.email('Invalid email address').optional().transform((s) => s?.trim().toLowerCase() || undefined),
  phone: z.string().min(1, 'Phone is required').transform((s) => s.trim()),
  address: z.string().optional().transform((s) => s?.trim() || ''),
  company: z.string().optional().transform((s) => s?.trim() || undefined),
  customerType: z.enum(['individual', 'business', 'contractor']).optional().default('individual'),
  preferredDeliveryAddress: z.string().optional().transform((s) => s?.trim() || undefined),
  preferredPaymentMethod: z.enum(['cash', 'pos', 'transfer']).optional(),
  isActive: z.boolean().optional().default(true),
});

// Fast customer search for checkout suggestions
export const searchCustomers = async (req: AuthRequest, res: Response): Promise<void> => {
  const { q, limit = 10 } = req.query;

  if (!q || typeof q !== 'string' || q.trim().length < 2) {
    res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    return;
  }

  try {
    const searchTerm = q.trim();
    const searchLimit = Math.min(parseInt(String(limit)), 20); // Max 20 results

    // Multi-field search with prioritization
    const customers = await Customer.aggregate([
      {
        $match: {
          isActive: true,
          $or: [
            { name: { $regex: searchTerm, $options: 'i' } },
            { phone: { $regex: searchTerm.replace(/\D/g, ''), $options: 'i' } },
            { email: { $regex: searchTerm, $options: 'i' } },
            { company: { $regex: searchTerm, $options: 'i' } },
            { searchKeywords: { $in: [new RegExp(searchTerm, 'i')] } }
          ]
        }
      },
      {
        $addFields: {
          // Prioritize recent customers and exact matches
          score: {
            $add: [
              { $cond: [{ $eq: [{ $toLower: '$name' }, searchTerm.toLowerCase()] }, 100, 0] },
              { $cond: [{ $eq: ['$phone', searchTerm] }, 100, 0] },
              { $cond: [{ $regexMatch: { input: '$name', regex: `^${searchTerm}`, options: 'i' } }, 50, 0] },
              { $cond: [{ $regexMatch: { input: '$phone', regex: `^${searchTerm}` } }, 50, 0] },
              { $cond: [{ $ne: ['$lastOrderDate', null] }, 20, 0] },
              { $cond: [{ $gte: ['$totalOrders', 1] }, 10, 0] }
            ]
          }
        }
      },
      { $sort: { score: -1, lastOrderDate: -1, totalOrders: -1 } },
      { $limit: searchLimit },
      {
        $project: {
          name: 1,
          phone: 1,
          email: 1,
          address: 1,
          company: 1,
          customerType: 1,
          preferredDeliveryAddress: 1,
          preferredPaymentMethod: 1,
          totalOrders: 1,
          totalSpent: 1,
          lastOrderDate: 1,
          score: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      customers,
      searchTerm,
      count: customers.length
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error searching customers' });
  }
};

// get all customers
export const getAllCustomers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find().lean();
    res.status(200).json({ success: true, customers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching customers' });
  }
};

// get customer by id
export const getCustomerById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Customer id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid customer id' });
    return;
  }

  try {
    const customer = await Customer.findById(id).lean();
    if (!customer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }
    res.status(200).json({ success: true, customer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching customer' });
  }
};

// create new customer
export const createCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = createCustomerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: z.treeifyError(parsed.error) });
      return;
    }

    // const { email, phone } = parsed.data;

    // let existingCustomer;
    // if (email === undefined) {
    //   existingCustomer = await Customer.findOne({ phone }).lean();
    // } else {
    //   existingCustomer = await Customer.findOne({
    //     $or: [{ email }, { phone }]
    //   }).lean();
    // }

    // if (existingCustomer) {
    //   if (email && existingCustomer.email === email) {
    //     res.status(409).json({ success: false, message: 'Customer with this email already exists' });
    //     return;
    //   }
    //   if (phone && existingCustomer.phone === phone) {
    //     res.status(409).json({ success: false, message: 'Customer with this phone already exists' });
    //     return;
    //   }
    //   res.status(409).json({ success: false, message: 'Customer with this email or phone already exists' });
    //   return;
    // }

    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json({ success: true, customer: savedCustomer });
  } catch (error) {

    // handle duplicate key (race condition) if unique index exists on email/phone
    const errAny = error as any;
    if (errAny?.code === 11000 || errAny?.codeName === 'DuplicateKey') {
      res.status(409).json({ success: false, message: 'Customer with this email or phone already exists' });
      return;
    }

    res.status(500).json({ success: false, message: 'Server error creating customer' });
  }
};

// update existing customer
export const updateCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Customer id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid customer id' });
    return;
  }

  try {
    const parsed = createCustomerSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, errors: z.treeifyError(parsed.error) });
      return;
    }

    const { email, phone } = parsed.data;

    // check for existing customer by email or phone
    if (email || phone) {
      const existingCustomer = await Customer.findOne({
        $or: [{ email }, { phone }],
        _id: { $ne: id } // exclude current customer
      }).lean();

      if (existingCustomer) {
        if (email && existingCustomer.email === email) {
          res.status(409).json({ success: false, message: 'Another customer with this email already exists' });
          return;
        }
        if (phone && existingCustomer.phone === phone) {
          res.status(409).json({ success: false, message: 'Another customer with this phone already exists' });
          return;
        }
        res.status(409).json({ success: false, message: 'Another customer with this email or phone already exists' });
        return;
      }
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(id, parsed.data, { new: true }).lean();
    if (!updatedCustomer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Customer updated successfully', customer: updatedCustomer });
  } catch (error) {

    // handle duplicate
    const errAny = error as any;
    if (errAny?.code === 11000 || errAny?.codeName === 'DuplicateKey') {
      res.status(409).json({ success: false, message: 'Another customer with this email or phone already exists' });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error updating customer' });
  }
};

// delete a customer
export const deleteCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Customer id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid customer id' });
    return;
  }

  try {
    const deletedCustomer = await Customer.findByIdAndDelete(id).lean();
    if (!deletedCustomer) {
      res.status(404).json({ success: false, message: 'Customer not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Customer deleted successfully', customer: deletedCustomer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error deleting customer' });
  }
};

//  get orders for a customer
export const getOrdersByCustomer = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Customer id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid customer id' });
    return;
  }

  const castedId = new mongoose.Types.ObjectId(id);

  try {
    const orders = await SalesOrder.find({ customer: castedId }).lean();
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching orders for customer' });
  }
};

// Helper function to update customer statistics (to be called from sales order controller)
export const updateCustomerStats = async (customerId: string, orderAmount: number, isNewOrder: boolean = true): Promise<void> => {
  try {
    const multiplier = isNewOrder ? 1 : -1;

    await Customer.findByIdAndUpdate(
      customerId,
      {
        $inc: {
          totalOrders: multiplier,
          totalSpent: orderAmount * multiplier
        },
        ...(isNewOrder && { lastOrderDate: new Date() })
      }
    );
  } catch (error) {
  }
};