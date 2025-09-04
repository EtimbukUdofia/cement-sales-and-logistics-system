import jwt from "jsonwebtoken";
import { type Response } from "express";
import type { Types } from "mongoose";
import type { StringValue } from "ms";

interface Payload {
  userId: Types.ObjectId;
  role: 'admin' | 'salesPerson';
  shopId?: Types.ObjectId;
}

const generateTokenAndSetCookie = (res: Response, payload: Payload): void => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ ...payload }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN as StringValue || "1d" });

  res.cookie('cement_logistics_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
  });
}

export default generateTokenAndSetCookie;