import mongoose from "mongoose";

const deliverySchema = new mongoose.Schema({
  deliveryNumber: { type: String, required: true, unique: true }, 
  salesOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder', required: true },
  route: { type: mongoose.Schema.Types.ObjectId, ref: 'Route'}, // should this be required?
  truck: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck', required: true },
  driver: {
    name: { type: String },
    licenseNumber: { type: String },
    phone: { type: String }
  },
  status: { type: String, enum: ['scheduled', 'in-transit', 'delivered', 'failed'], default: 'scheduled' },
  scheduledDate: { type: Date, required: true },
  actualDeliveryDate: { type: Date },
  deliveryAddress: { type: String },
  notes: { type: String },
}, { timestamps: true });

const Delivery = mongoose.model('Delivery', deliverySchema);
export default Delivery;