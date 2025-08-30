import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: true }, // Reference to SalesOrder model
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true }, // Reference to Customer model
  shop: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true }, // Reference to Shop model
  items: [{ description: String, quantity: Number, unitPrice: Number, totalPrice: Number }],
  totalAmount: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  status: { type: String, enum: ['paid', 'unpaid', 'overdue']},
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  paidDate: { type: Date },
  notes: { type: String },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User model
}, { timestamps: true });

const Invoice = mongoose.model('Invoice', invoiceSchema);
export default Invoice;