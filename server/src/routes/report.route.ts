import { Router } from 'express';
import {
  getSalesPersonReports,
  getAdminReports
} from '../controllers/report.controller.ts';

const router = Router();

// Get reports for sales person (filtered by their data)
router.get('/', getSalesPersonReports);

// Get admin reports (all data)
router.get('/admin', getAdminReports);

export default router;
