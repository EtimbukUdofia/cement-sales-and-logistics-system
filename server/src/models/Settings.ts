import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  // Pricing for additional services
  onloadingCost: { type: Number, required: true, default: 0 },
  deliveryCost: { type: Number, required: true, default: 0 },
  offloadingCost: { type: Number, required: true, default: 0 },

  // Singleton pattern - only one settings document should exist
  isActive: { type: Boolean, default: true, unique: true }
}, { timestamps: true });

const Settings = mongoose.model('Settings', settingsSchema);
export default Settings;
