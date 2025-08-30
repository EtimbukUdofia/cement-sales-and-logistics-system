import type { Response, NextFunction } from 'express';
import type { AuthRequest } from '../interfaces/interface.ts';

const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin Only' });
  }
}

export default isAdmin;