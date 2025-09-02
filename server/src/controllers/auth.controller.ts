import { type Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.ts";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.ts";
import type { AuthRequest } from "../interfaces/interface.ts";

export const signup = async (req: AuthRequest, res: Response): Promise<void> => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    const result = await newUser.save();

    // generate jwt
    generateTokenAndSetCookie(res, { userId: newUser._id, role: newUser.role });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        shopId: newUser.shopId
      }
    })

    console.log(result);
  } catch (error: any) {
    console.error('Signup error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(400).json({ success: false, message: "Invalid email or password" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ success: false, message: "Invalid email or password" });
      return;
    }

    // generate jwt
    generateTokenAndSetCookie(res, { userId: user._id, role: user.role });

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        shopId: user.shopId
      }
    });

    console.log(`${user.email} logged in`);
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }

};

export const logout = async (_req: AuthRequest, res: Response): Promise<void> => {
  res.clearCookie("cement_logistics_token");

  res.status(200).json({ success: true, message: "Logged out successfully" });
};

export const checkAuth = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        shopId: user.shopId
      }
    });
  } catch (error) {
    console.error('Check auth error:', (error as Error).message);
    res.status(500).json({ success: false, message: 'Server error during authentication check' });
  }
}