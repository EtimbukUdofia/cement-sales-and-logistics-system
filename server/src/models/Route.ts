import mongoose from "mongoose";

const routeSchema = new mongoose.Schema({
  routeNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  origin: {
    type: {
      type: String,
      enum: ['Supplier', 'Shop'],
    },
    locationId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'origin.type' },
    name: { type: String, required: true },
    address: { type: String },
  },
  destination: {
    type: {
      type: String,
      enum: ['Customer', 'Shop'],
    },
    locationId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'destination.type' },
    name: { type: String, required: true },
    address: { type: String },
  },
  stops: [{
    stopOrder: { type: Number, required: true }, // Order of the stop in the route. it will be a sequence
    type: {
      type: String,
      enum: ['Shop', 'Customer'],
    },
    locationId: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'stops.type' },
    name: { type: String, required: true },
    address: { type: String },
    estimatedArrival: { type: Date },
    actualArrival: { type: Date },
    deliveryQuantity: { type: Number }, // amount to be delivered at this stop
    deliveryStatus: { type: String, enum: ['pending', 'in-transit', 'delivered'], default: 'pending' },
  }],
  totalDistance: { type: Number }, // in kilometers
  estimatedTime: { type: Number }, // in minutes
  actualTime: { type: Number }, // in minutes

  assignedVehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Truck' },
  driver: {
    name: { type: String },
    licenseNumber: { type: String },
    phone: { type: String }
  },

  status: { type: String, enum: ['planned', 'in-progress', 'completed', 'cancelled'], default: 'planned' },

  startDate: { type: Date },
  completedDate: { type: Date },

  cargo: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, required: true },
    unit: { type: String, default: 'bags' },
    totalWeight: { type: Number }
  }],

  // cost and revenue tracking
  transportCost: { type: Number },
  fuelCost: { type: Number },
  totalRevenue: { type: Number },

  // Related orders
  salesOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SalesOrder' }],
  purchaseOrders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseOrder' }],

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  isActive: { type: Boolean, default: true }

}, { timestamps: true });

const Route = mongoose.model('Route', routeSchema);
export default Route;