import mongoose from "mongoose";

const salesOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // Unique

  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, // Reference to Customer model

  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }, // Reference to Shop model

  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true }, // Reference to Product model
    quantity: { type: Number, required: true }, // Quantity ordered
    unitPrice: { type: Number, required: true }, // Price per unit
    totalPrice: { type: Number, required: true }, // Total price for the item
    collectedQuantity: { type: Number, default: 0 } // Quantity actually collected (for partial collections)
  }], // List

  // Delivery and additional costs
  isDelivery: { type: Boolean, default: false }, // Whether order includes delivery
  onloadingCost: { type: Number, default: 0 }, // Cost for onloading
  deliveryCost: { type: Number, default: 0 }, // Cost for delivery
  offloadingCost: { type: Number, default: 0 }, // Cost for offloading

  totalAmount: { type: Number, required: true }, // Total amount for the order (includes items + additional costs)

  paymentMethod: { type: String, enum: ['cash', 'pos', 'transfer'], required: true }, // Payment method

  orderDate: { type: Date, default: Date.now }, // Date of the order

  deliveryDate: { type: Date }, // Expected delivery date

  status: { type: String, enum: ['Collected', 'Not Collected', 'Pending Correction'], default: 'Not Collected' }, // Order status

  shippedDate: { type: Date }, // Actual date of shipment

  deliveredDate: { type: Date }, // Actual date of delivery

  collectedDate: { type: Date }, // Actual date cement was collected

  deliveryAddress: { type: String }, // Delivery address

  salesPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model

  notes: { type: String }, // Additional notes

  needsCorrection: { type: Boolean, default: false }, // Flag for orders needing correction

  correctionNotes: { type: String }, // Notes about what needs correction

  correctionRequestedAt: { type: Date }, // When correction was requested

  correctionRequestedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Who requested correction
}, { timestamps: true });

const SalesOrder = mongoose.model('SalesOrder', salesOrderSchema);
export default SalesOrder;