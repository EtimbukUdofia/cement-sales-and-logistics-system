import { Router } from 'express';
import {
  getSalesHistory
} from '../controllers/report.controller.js';

const router = Router();

// Get sales history with filtering and pagination
router.get('/history', getSalesHistory);

export default router;
