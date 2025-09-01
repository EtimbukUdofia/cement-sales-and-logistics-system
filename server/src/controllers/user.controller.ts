import type { Response } from 'express';
import mongoose from "mongoose";
import type { AuthRequest } from '../interfaces/interface.ts';
import User from '../models/User.ts';
import bcrypt from 'bcryptjs';

// Add a new User. This is for the admin to add a new sales person or admin
const addUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, email, password, role, shopId } = req.body ?? {};

  if (shopId && !mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Invalid shop id' });
    return;
  }

  // roles === salesperson must also provide shopid
  if (role === 'salesPerson' && !shopId) {
    res.status(400).json({ success: false, message: 'shopId is required for salesPerson role' });
    return;
  }

  try {
    if (!username || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username: String(username).trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role,
      shopId: shopId || undefined
    });

    const result = await newUser.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: {
        ...newUser.toObject(),
        password: undefined
      }
    });

    console.log('User created:', result._id);
  } catch (error) {
    console.error('User Creation Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error during user creation' });
  }
};

// Get all Users
const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password -__v');
    res.status(200).json({ success: true, users });
  } catch (error) {
    console.error('Get All Users Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error fetching users' });
  }
};

//  Get a single User by ID
const getUserById = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ success: false, message: 'User id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid user id' });
    return;
  }

  try {
    const user = await User.findById(id).select('-password');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, user });
  } catch (error) {
    console.error('Get User By ID Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error fetching user' });
  }
};

// Get all salesPersons
const getAllSalesPersons = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const salesPersons = await User.find({ role: 'salesPerson' }).select('-password -__v');
    res.status(200).json({ success: true, salesPersons });
  } catch (error) {
    console.error('Get All SalesPersons Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error fetching sales persons' });
  }
};

// Update an existing User
const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id;
  const { username, email, role, password, shopId } = req.body ?? {};

  if (!id) {
    res.status(400).json({ success: false, message: 'User id is required' });
    return;
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid user id' });
    return;
  }

  if (shopId && !mongoose.Types.ObjectId.isValid(shopId)) {
    res.status(400).json({ success: false, message: 'Invalid shop id' });
    return;
  }

  try {
    // if shopid check if that shop exists
    if (shopId) {
      const existingShop = await mongoose.model('Shop').findById(shopId).lean();
      if (!existingShop) {
        res.status(404).json({ success: false, message: 'Shop not found' });
        return;
      }
    }
    
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const normalizedEmail = email ? String(email).trim().toLowerCase() : undefined;

    if (normalizedEmail && normalizedEmail !== user.email) {
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing && existing._id.toString() !== id) {
        res.status(400).json({ success: false, message: 'Email already in use' });
        return;
      }
    }
    
    if (role && role === 'salesPerson' && !shopId) {
      res.status(400).json({ success: false, message: 'shopId is required for salesPerson role' });
      return;
    }

    user.username = username || user.username;
    user.email = normalizedEmail || user.email;
    user.role = role || user.role;
    user.shopId = shopId !== undefined ? shopId : user.shopId;

    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        ...updatedUser.toObject(),
        password: undefined
      }
    });

    console.log(`User ${updatedUser._id} updated`);
  } catch (error) {
    console.error('Update User Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error updating user' });
  }
};

// Delete a User
const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  const id = req.params.id;

  if (!id) {
    res.status(400).json({ success: false, message: 'User id is required' });
    return;
  }
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(400).json({ success: false, message: 'Invalid user id' });
    return;
  }

  try {
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'User deleted successfully' });
    console.log(`User ${id} deleted`);
  } catch (error) {
    console.error('Delete User Error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error deleting user' });
  }
};

export {
  addUser,
  getAllUsers,
  getUserById,
  getAllSalesPersons,
  updateUser,
  deleteUser
};