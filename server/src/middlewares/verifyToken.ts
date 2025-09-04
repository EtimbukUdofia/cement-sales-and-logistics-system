import type { NextFunction, Response } from "express";
import type { AuthRequest, DecodedToken } from "../interfaces/interface.ts";
import jwt from "jsonwebtoken";

export const verifyToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.sessionID;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as DecodedToken;

    if (!decoded || typeof decoded === "string" || !decoded.userId || !decoded.role) {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    req.userId = decoded.userId; // i'll have to remove this ones later in favour of req.user
    req.role = decoded.role; // i'll have to remove this ones later in favour of req.user

    // Set user object from JWT payload (no DB query needed for better performance)
    req.user = {
      id: decoded.userId,
      role: decoded.role,
      ...(decoded.shopId && { shopId: decoded.shopId })
    };

    next();
  } catch (err: any) {
    return res.status(500).json({ success: false, message: 'Server Error while trying to validate token' });
  }
};