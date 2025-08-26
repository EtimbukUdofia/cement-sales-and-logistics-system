import {type Request } from "express";
import type { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId?: string;
  role?: string;
}

export interface DecodedToken extends JwtPayload {
  userId: string;
  role: string;
}