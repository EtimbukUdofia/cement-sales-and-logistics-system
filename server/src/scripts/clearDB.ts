import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import Customer from '../models/Customer.js';
import Inventory from '../models/Inventory.js';
import InventoryHistory from '../models/InventoryHistory.js';
import PurchaseOrder from '../models/PurchaseOrder.js';
import SalesOrder from '../models/SalesOrder.js';
import Supplier from '../models/Supplier.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Initialize inventory for existing products and shops
const initializeInventorySystem = async () => {
  try {
    console.log('Initializing inventory system...');

    // Get all active shops and products
    const [shops, products] = await Promise.all([
      Shop.find({ isActive: true }).lean(),
      Product.find({ isActive: true }).lean()
    ]);

    if (shops.length === 0 || products.length === 0) {
      console.log('No shops or products found. Skipping inventory initialization.');
      return;
    }

    // Check if inventory already exists
    const existingInventory = await Inventory.findOne();
    if (existingInventory) {
      console.log('Inventory already exists. Skipping initialization.');
      return;
    }

    // Create inventory entries for all shop-product combinations
    const inventoryEntries = [];
    for (const shop of shops) {
      for (const product of products) {
        inventoryEntries.push({
          product: product._id,
          shop: shop._id,
          quantity: 0,
          minStockLevel: 10,
          maxStockLevel: 1000,
        });
      }
    }

    if (inventoryEntries.length > 0) {
      await Inventory.insertMany(inventoryEntries);
      console.log(`Created ${inventoryEntries.length} inventory entries for ${shops.length} shops and ${products.length} products`);
    }
  } catch (error) {
    console.error('Error initializing inventory system:', error);
  }
};

const clearDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany({});
    await Shop.deleteMany({});
    await Inventory.deleteMany({});
    await InventoryHistory.deleteMany({});
    await Customer.deleteMany({});
    await SalesOrder.deleteMany({});
    await Supplier.deleteMany({});
    await PurchaseOrder.deleteMany({});
    // Note: Not clearing User collection to preserve admin account

    console.log('Database cleared successfully (except User collection)');
    console.log('Admin user account preserved');
    console.log('');
    console.log('To get started:');
    console.log('1. Create shops using the admin panel');
    console.log('2. Add products using the admin panel');
    console.log('3. Inventory will be automatically initialized for all shop-product combinations');
    console.log('4. Use the inventory management page to set stock levels');

    process.exit(0);
  } catch (error) {
    console.error('Clear DB script error', error);
    process.exit(1);
  }
};

// Add a separate function to just initialize inventory without clearing data
const initializeOnly = async () => {
  try {
    await connectDB();
    await initializeInventorySystem();
    console.log('Inventory initialization completed');
    process.exit(0);
  } catch (error) {
    console.error('Initialize inventory script error', error);
    process.exit(1);
  }
};

// Check command line arguments
const command = process.argv[2];

if (command === 'init-inventory') {
  initializeOnly();
} else {
  clearDB();
}