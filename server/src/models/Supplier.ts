import mongoose from "mongoose";

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String },
  contactPerson: { type: String },
  phone: { type: String, required: true },
  email: { type: String },
  products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }], // Reference to Product model
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Supplier = mongoose.model('Supplier', supplierSchema);
export default Supplier;