import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  phone: { type: String, required: true, unique: true },
  address: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;