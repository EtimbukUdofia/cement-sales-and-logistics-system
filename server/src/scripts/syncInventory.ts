import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { syncInventorySystem } from '../utils/inventoryUtils.js';

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

const runSync = async () => {
  try {
    await connectDB();

    console.log('Starting inventory system sync...');
    const result = await syncInventorySystem();

    console.log('\n=== Inventory Sync Results ===');
    console.log(`✅ Entries created: ${result.created}`);
    console.log(`🗑️ Entries removed: ${result.removed}`);
    console.log(`🔍 Entries checked: ${result.checked}`);
    console.log(`📝 ${result.message}`);
    console.log('\nInventory sync completed successfully!');

    process.exit(0);
  } catch (error) {
    console.error('Inventory sync failed:', error);
    process.exit(1);
  }
};

runSync();