import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true }, // Reference to Product model
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true, index: true }, // Reference to Shop model
  quantity: { type: Number, required: true, default: 0 }, // Current stock level
  minStockLevel: { type: Number, default: 10 }, // Minimum stock level for alerts
  maxStockLevel: { type: Number, default: 1000 }, // Maximum stock level for alerts
  lastRestocked: { type: Date }, // Timestamp of last restock
}, { timestamps: true });

const Inventory = mongoose.model('Inventory', inventorySchema);
export default Inventory;