import { Router } from 'express';
import {
  getSalesHistory,
  getSalesDashboardMetrics,
  getAdminDashboardMetrics
} from '../controllers/report.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';

const router = Router();

router.use(verifyToken);

// Get admin dashboard metrics
router.get('/admin-dashboard-metrics', getAdminDashboardMetrics);

// Get sales dashboard metrics
router.get('/dashboard-metrics', getSalesDashboardMetrics);

// Get sales history with filtering and pagination
router.get('/history', getSalesHistory);

export default router;
