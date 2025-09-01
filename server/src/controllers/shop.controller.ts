import type { Response } from 'express';
import mongoose from 'mongoose';
import type { AuthRequest } from '../interfaces/interface.ts';
import Shop from '../models/Shop.ts';
import User from '../models/User.ts';

// get all shops
export const getAllShops = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shops = await Shop.find().populate('manager', 'username email').lean();
    res.status(200).json({ success: true, shops });
  } catch (error) {
    console.error('Get All Shops Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error fetching shops' });
  }
};

// get shop by id
export const getShopById = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Shop id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid shop id' });
    return;
  }

  try {
    const shop = await Shop.findById(id).populate('manager', 'username email').lean();
    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }
    res.status(200).json({ success: true, shop });
  } catch (error) {
    console.error('Get Shop By ID Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error fetching shop' });
  }
};

// create new shop
export const createShop = async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, address, manager, phone, email } = req.body;

  if (!name || !phone || !address) {
    res.status(400).json({ success: false, message: 'Name, address and phone are required' });
    return;
  }

  if (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Invalid email format' });
      return;
    }
  }

  if (manager !== undefined && manager !== null && !mongoose.Types.ObjectId.isValid(manager)) {
    res.status(400).json({ success: false, message: 'Invalid manager id' });
    return;
  }

  try {
    if (manager) {
      const existingManager = await User.findById(manager).lean();
      if (!existingManager) {
        res.status(404).json({ success: false, message: 'Manager user not found' });
        return;
      }
    }

    const shopData: Partial<typeof Shop.prototype> = {
      name,
      address,
      manager: manager ?? null,
      phone,
      email: email ?? null,
    };

    const newShop = new Shop(shopData);
    await newShop.save();
    await newShop.populate('manager', 'username email');
    res.status(201).json({ success: true, shop: newShop });
  } catch (err) {
    console.error('Create Shop Error:', (err as Error).message);

    const errAny = err as any;
    if (errAny.code === 11000 || errAny.codeName === 'DuplicateKey' || errAny.keyValue) {
      res.status(409).json({ success: false, message: 'Shop with this name or phone already exists' });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error creating shop' });
  }
};

// update existing shop
export const updateShop = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, address, manager, phone, email, isActive } = req.body;

  if (!id) {
    res.status(400).json({ success: false, message: 'Shop id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid shop id' });
    return;
  }

  // validate manager only when provided and not explicitly null/empty (allow unassign via null)
  if (manager !== undefined && manager !== null && manager !== '' && !mongoose.Types.ObjectId.isValid(manager)) {
    res.status(400).json({ success: false, message: 'Invalid manager id' });
    return;
  }

  if (email !== undefined && email !== null) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email !== '' && !emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Invalid email format' });
      return;
    }
  }

  try {
    const shop = await Shop.findById(id);
    if (!shop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }

    if (manager !== undefined && manager !== null && manager !== '') {
      const existingManager = await User.findById(manager).lean();
      if (!existingManager) {
        res.status(404).json({ success: false, message: 'Manager user not found' });
        return;
      }
      // optional role check:
      // if (existingManager.role !== 'manager') {
      //   res.status(400).json({ success: false, message: 'Assigned user is not a manager' });
      //   return;
      // }
    }

    // update fields if provided
    if (name !== undefined) shop.name = name;
    if (address !== undefined) shop.address = address;
    if (manager !== undefined) shop.manager = manager; // allow unassigning manager by passing null
    if (phone !== undefined) shop.phone = phone;
    if (email !== undefined) shop.email = email;
    if (isActive !== undefined) shop.isActive = isActive;

    const updatedShop = await shop.save();
    await updatedShop.populate('manager', 'username email');
    res.status(200).json({ success: true, shop: updatedShop });
  } catch (err) {
    console.error('Update Shop Error:', (err as Error).message);
    const errAny = err as any;
    if (errAny.code === 11000 || errAny.codeName === 'DuplicateKey' || errAny.keyValue) {
      res.status(409).json({ success: false, message: 'Shop with this name or phone already exists' });
      return;
    }
    res.status(500).json({ success: false, message: 'Server error updating shop' });
  }
};

// delete shop
export const deleteShop = async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params;

  if (!id) {
    res.status(400).json({ success: false, message: 'Shop id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid shop id' });
    return;
  }

  try {
    const deletedShop = await Shop.findByIdAndDelete(id).lean();
    if (!deletedShop) {
      res.status(404).json({ success: false, message: 'Shop not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Shop deleted successfully', shop: deletedShop });
  } catch (error) {
    console.error('Delete Shop Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error deleting shop' });
  }
};
