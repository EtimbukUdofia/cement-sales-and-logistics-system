import { Router } from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import isAdmin from '../middlewares/isAdmin.js';

const settingsRouter = Router();

// Get settings (public - no auth required)
settingsRouter.get('/', getSettings);

// Update settings (admin only)
settingsRouter.put('/', verifyToken, isAdmin, updateSettings);

export default settingsRouter;
