import mongoose from "mongoose";

const shopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  manager: {type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to User model
  phone: { type: String, required: true },
  email: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Shop = mongoose.model('Shop', shopSchema);
export default Shop;