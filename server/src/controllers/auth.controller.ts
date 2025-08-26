import { type Request, type Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.ts";
import generateTokenAndSetCookie from "../utils/generateTokenAndSetCookie.ts";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { username, email, password, role, shopId } = req.body;

  try {
    if (!username || !email || !password || !role) {
      res.status(400).json({ success: false, message: 'All fields are required' });
      return;
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword, role, shopId });
    const result = await newUser.save();

    // generate jwt
    generateTokenAndSetCookie(res, { userId: newUser._id, role: newUser.role });

    res.status(201).json({
      success: true,
      message: "User created successfully",
      user: {
        ...newUser.toObject(),
        password: undefined
      }
    })

    console.log(result);
  } catch (error: any) {
    console.error('Signup error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
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
        ...user.toObject(),
        password: undefined
      }
    });

    console.log(`${user.email} logged in`);
  } catch (error: any) {
    console.error('Login error:', error.message);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }

}
export const logout = async (): Promise<void> => {

}
export const checkAuth = async (): Promise<void> => {

}