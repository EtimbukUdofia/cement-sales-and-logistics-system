import type { NextFunction, Response } from "express";
import type { AuthRequest, DecodedToken } from "../interfaces/interface.ts";
import jwt from "jsonwebtoken";

export const verifyToken = (req:AuthRequest, res:Response, next:NextFunction) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    if(!decoded || typeof decoded === "string" || !decoded.userId || decoded.role) return res.status(401).json({success:false, message: 'Invalid token' });

    req.userId = decoded.userId;
    req.role = decoded.role;

    next();
  } catch (err : any) {
    console.error("Error verifying token:", err.message);
    return res.status(500).json({success:false, message: 'Invalid token' });
  }
};