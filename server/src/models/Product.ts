import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  variant: { type: String },
  brand: { type: String },
  size: { type: Number, required: true },
  price: { type: Number, required: true },
  imageUrl: { type: String },
  description: { type: String },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;