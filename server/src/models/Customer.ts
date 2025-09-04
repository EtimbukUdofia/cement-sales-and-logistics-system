import mongoose from "mongoose";

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: {
    type: String,
    // unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    // unique: true,
    trim: true
  },
  address: { type: String, trim: true },

  company: { type: String, trim: true }, // For business customers
  customerType: {
    type: String,
    enum: ['individual', 'business', 'contractor'],
    default: 'individual'
  },

  // Delivery preferences for faster checkout
  preferredDeliveryAddress: { type: String, trim: true },
  preferredPaymentMethod: {
    type: String,
    enum: ['cash', 'pos', 'transfer']
  },

  // Tracking fields
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderDate: { type: Date },

  // Status
  isActive: { type: Boolean, default: true },

  // Search optimization
  searchKeywords: [{ type: String }], // For fuzzy search
}, {
  timestamps: true,
  // Create text index for search functionality
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for fast search during checkout
customerSchema.index({ name: 'text', phone: 'text', email: 'text' });
// Removed duplicate phone index - phone is already indexed in the text index above
customerSchema.index({ name: 1 }); // Fast name lookup
customerSchema.index({ isActive: 1, lastOrderDate: -1 }); // Recent active customers

// Virtual for full search text
customerSchema.virtual('fullSearchText').get(function () {
  return `${this.name} ${this.phone} ${this.email || ''} ${this.company || ''}`.toLowerCase();
});

// Pre-save middleware to update search keywords
customerSchema.pre('save', function (next) {
  if (this.isModified('name') || this.isModified('phone') || this.isModified('email') || this.isModified('company')) {
    const keywords = [];
    if (this.name) keywords.push(...this.name.toLowerCase().split(' '));
    if (this.phone) keywords.push(this.phone.replace(/\D/g, '')); // Numbers only
    if (this.email) keywords.push(this.email.toLowerCase());
    if (this.company) keywords.push(...this.company.toLowerCase().split(' '));

    this.searchKeywords = [...new Set(keywords)]; // Remove duplicates
  }
  next();
});

const Customer = mongoose.model('Customer', customerSchema);
export default Customer;