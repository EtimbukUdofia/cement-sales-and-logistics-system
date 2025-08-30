import type { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";

type Location = "params" | "body" | "query";

/**
 * Middleware factory to validate a MongoDB ObjectId.
 * Usage:
 *   app.get("/user/:id", checkValidObjectId("id"), handler);
 *   app.post("/user", checkValidObjectId("userId", "body"), handler);
 */
export const checkValidObjectId =
  (paramName = "id", location: Location = "params") =>
  (req: Request, res: Response, next: NextFunction) => {
    const container = (req as any)[location] ?? {};
    const id = container[paramName];

    if (!id) {
      return res
        .status(400)
        .json({ error: `Missing "${paramName}" in request ${location}` });
    }

    if (!mongoose.Types.ObjectId.isValid(String(id))) {
      return res
        .status(400)
        .json({ error: `Invalid ObjectId for "${paramName}"` });
    }

    return next();
  };

export default checkValidObjectId;