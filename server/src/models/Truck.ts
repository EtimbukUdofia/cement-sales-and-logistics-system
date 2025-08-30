import mongoose from "mongoose";

const truckSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  model: { type: String },
  make: { type: String },
  year: { type: Number },
  capacity: { type: Number }, // in kg, tons or bags
  driverName: {
    name: { type: String },
    licenseNumber: { type: String },
    phone: { type: String }
  },
  status: { type: String, enum: ['available', 'in-transit', 'maintenance', 'inactive'], default: 'available' },
  currentLocation: {
    latitude: { type: Number },
    longitude: { type: Number }
  }, // this is very optional
  assignedRoute: { type: mongoose.Schema.Types.ObjectId, ref: 'Route' },
  lastMaintenance: { type: Date },
  nextMaintenance: { type: Date },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Truck = mongoose.model('Truck', truckSchema);
export default Truck;