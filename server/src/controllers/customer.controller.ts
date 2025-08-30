import mongoose from "mongoose";
import type { Response } from "express";
import type { AuthRequest } from "../interfaces/interface.ts";
import Customer from "../models/Customer.ts";
import { z } from "zod";
import SalesOrder from "../models/SalesOrder.ts";

const createCustomerSchema = z.object({
  name: z.string().min(1, 'Name is required').transform((s) => s.trim()),
  email: z.string().email('Invalid email address').optional().transform((s) => s?.trim().toLowerCase() || undefined),
  phone: z.string().min(1, 'Phone is required').transform((s) => s.trim()),
  address: z.string().optional().transform((s) => s?.trim() || ''),
  isActive: z.boolean().optional().default(true),
});

// get all customers
export const getAllCustomers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const customers = await Customer.find().lean();
    res.status(200).json({ success: true, customers });
  } catch (error) {
    console.error('Get All Customers Error:', (error as Error).message);
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
    console.error('Get Customer By ID Error:', (error as Error).message);
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

    const { email, phone } = parsed.data;

    // check for existing customer by email or phone
    const existingCustomer = await Customer.findOne({
      $or: [{ email }, { phone }]
    }).lean();

    if (existingCustomer) {
      if (email && existingCustomer.email === email) {
        res.status(409).json({ success: false, message: 'Customer with this email already exists' });
        return;
      }
      if (phone && existingCustomer.phone === phone) {
        res.status(409).json({ success: false, message: 'Customer with this phone already exists' });
        return;
      }
      res.status(409).json({ success: false, message: 'Customer with this email or phone already exists' });
      return;
    }

    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json({ success: true, customer: savedCustomer });
  } catch (error) {
    console.error('Create Customer Error:', (error as Error).message);

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
    console.error('Update Customer Error:', (error as Error).message);

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
    console.error('Delete Customer Error:', (error as Error).message);
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
    console.error('Get Orders By Customer Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error fetching orders for customer' });
  }
};