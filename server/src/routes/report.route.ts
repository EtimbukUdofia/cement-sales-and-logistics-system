import { Router } from 'express';
import {
  getSalesHistory
} from '../controllers/report.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.use(verifyToken);

// Get sales history with filtering and pagination
router.get('/history', getSalesHistory);

export default router;
