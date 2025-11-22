import type { Response } from "express";
import type { AuthRequest } from "../interfaces/interface.js";
import Settings from "../models/Settings.js";

// Get settings (public endpoint - anyone can view settings)
export const getSettings = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Get or create settings if they don't exist
    let settings = await Settings.findOne({ isActive: true }).lean();

    if (!settings) {
      // Create default settings if none exist
      const newSettings = new Settings({
        onloadingCost: 0,
        deliveryCost: 0,
        offloadingCost: 0,
        isActive: true
      });
      settings = await newSettings.save();
    }

    res.status(200).json({ success: true, settings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error fetching settings' });
  }
};

// Update settings (admin only)
export const updateSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  const { onloadingCost, deliveryCost, offloadingCost } = req.body;

  // Validate that at least one field is being updated
  if (
    onloadingCost === undefined &&
    deliveryCost === undefined &&
    offloadingCost === undefined
  ) {
    res.status(400).json({
      success: false,
      message: 'At least one field (onloadingCost, deliveryCost, offloadingCost) is required'
    });
    return;
  }

  // Validate that costs are non-negative numbers
  const costs = { onloadingCost, deliveryCost, offloadingCost };
  for (const [key, value] of Object.entries(costs)) {
    if (value !== undefined && (typeof value !== 'number' || value < 0)) {
      res.status(400).json({
        success: false,
        message: `${key} must be a non-negative number`
      });
      return;
    }
  }

  try {
    // Find existing settings or create new one
    let settings = await Settings.findOne({ isActive: true });

    if (!settings) {
      // Create new settings if none exist
      settings = new Settings({
        onloadingCost: onloadingCost ?? 0,
        deliveryCost: deliveryCost ?? 0,
        offloadingCost: offloadingCost ?? 0,
        isActive: true
      });
    } else {
      // Update existing settings
      if (onloadingCost !== undefined) settings.onloadingCost = onloadingCost;
      if (deliveryCost !== undefined) settings.deliveryCost = deliveryCost;
      if (offloadingCost !== undefined) settings.offloadingCost = offloadingCost;
    }

    const updatedSettings = await settings.save();

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error updating settings' });
  }
};
