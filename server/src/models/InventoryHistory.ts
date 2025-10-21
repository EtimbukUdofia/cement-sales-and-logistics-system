import mongoose from "mongoose";

const inventoryHistorySchema = new mongoose.Schema({
  inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  previousQuantity: { type: Number, required: true },
  newQuantity: { type: Number, required: true },
  changeAmount: { type: Number, required: true }, // newQuantity - previousQuantity
  changeType: {
    type: String,
    required: true,
    enum: ['increase', 'decrease', 'restock', 'adjustment', 'sale', 'return']
  },
  reason: { type: String }, // Optional reason for the change
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Index for efficient querying
inventoryHistorySchema.index({ shop: 1, createdAt: -1 });
inventoryHistorySchema.index({ product: 1, createdAt: -1 });
inventoryHistorySchema.index({ updatedBy: 1, createdAt: -1 });

const InventoryHistory = mongoose.model('InventoryHistory', inventoryHistorySchema);
export default InventoryHistory;