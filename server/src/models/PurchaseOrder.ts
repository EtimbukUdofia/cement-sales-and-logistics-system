import mongoose from "mongoose";

const purchaseOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // Unique order identifier
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product model
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: 'Supplier', required: true }, // Reference to Supplier model
  // shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }, // Reference to Shop model
  quantity: { type: Number, required: true }, // Quantity ordered
  unitPrice: { type: Number, required: true }, // Price per unit
  orderDate: { type: Date, default: Date.now }, // Date of the order
  expectedDeliveryDate: { type: Date }, // Expected delivery date 
  status: { type: String, enum: ['Pending', 'Approved', 'Delivered', 'Cancelled'], default: 'Pending' }, // Order status
  totalPrice: { type: Number, required: true }, // Total price for the order
  receivedDate: { type: Date }, // Actual date of receipt
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
  notes: { type: String }, // Additional notes
}, { timestamps: true });

const PurchaseOrder = mongoose.model('PurchaseOrder', purchaseOrderSchema);
export default PurchaseOrder;