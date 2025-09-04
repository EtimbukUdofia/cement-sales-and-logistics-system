import type { NextFunction, Response } from "express";
import type { AuthRequest } from "../interfaces/interface.ts";
import jwt from "jsonwebtoken";

const alreadyLoggedIn = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.sessionID;

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET as string);
      return res.status(403).json({ success: false, message: 'User is already logged in' });

    } catch (error) {
      next();
    }

  } else {
    next();
  }
}

export default alreadyLoggedIn;