# Database Management & Inventory System

This document explains the improved database management and inventory system that works from scratch with a single admin account.

## Key Improvements

### 🔄 Automatic Inventory Initialization

- When you create a new shop, inventory entries are automatically created for all existing products with 0 quantity
- When you add a new product, inventory entries are automatically created for all existing shops with 0 quantity
- No more empty inventory pages!

### 🏪 All Shops Visible

- The inventory management page now shows ALL shops, even those with zero inventory
- Each shop card has a "Manage Inventory" button to directly access inventory management
- Visual indicators show stock status (green = has stock, red = low stock, gray = no stock)

### 🛠️ Database Scripts

#### Clear Database (Preserve Admin)

```bash
npm run clearDB
```

- Clears all data except User collection (preserves admin account)
- Safe to run when starting fresh

#### Sync Inventory System

```bash
npm run sync-inventory
```

- Ensures all shops have inventory entries for all products
- Removes orphaned inventory entries for inactive shops/products
- Can be run anytime to fix missing inventory entries

#### Initialize Inventory Only

```bash
npm run init-inventory
```

- Creates inventory entries without clearing data
- Useful for existing installations

## Getting Started from Scratch

1. **Clear database** (optional, preserves admin account):

   ```bash
   cd server
   npm run clearDB
   ```

2. **Login with admin account** and start adding:

   - Create shops first
   - Add products
   - Inventory will be automatically initialized

3. **Manage inventory**:
   - Go to Admin → Inventory Management
   - Click "Manage Inventory" on any shop card
   - Set stock levels for products

## Features

### Admin Inventory Management

- **Inventory Summary**: View all shops with stock levels and values
- **Shop-specific Management**: Click any shop to manage its inventory
- **Bulk Updates**: Adjust quantities with reason tracking
- **History Tracking**: See all inventory changes with timestamps
- **Quick Adjustments**: +/- buttons for fast stock updates
- **Stock Status Indicators**: Visual warnings for low/out of stock items

### Automatic Synchronization

- **Manual Sync**: Use the "Sync System" button in the inventory header
- **API Endpoint**: `POST /api/v0/inventory/sync` for programmatic syncing
- **Startup Check**: System can verify inventory completeness on startup

### Role-based Access

- **Admin**: Can view and manage inventory for all shops
- **Sales Person**: Can only view/manage inventory for their assigned shop
- **Automatic Filtering**: System enforces access controls

## Database Schema

### Inventory Model

```typescript
{
  product: ObjectId,      // Reference to Product
  shop: ObjectId,         // Reference to Shop
  quantity: Number,       // Current stock level
  minStockLevel: Number,  // Low stock threshold (default: 10)
  maxStockLevel: Number,  // Maximum stock level (default: 1000)
  lastRestocked: Date,    // Last restock timestamp
  createdAt: Date,
  updatedAt: Date
}
```

### InventoryHistory Model

```typescript
{
  inventory: ObjectId,        // Reference to Inventory
  product: ObjectId,          // Reference to Product
  shop: ObjectId,             // Reference to Shop
  previousQuantity: Number,   // Stock before change
  newQuantity: Number,        // Stock after change
  changeAmount: Number,       // Difference (+/-)
  changeType: String,         // 'increase' | 'decrease' | 'restock' | 'adjustment'
  reason: String,             // Optional reason for change
  updatedBy: ObjectId,        // User who made the change
  createdAt: Date
}
```

## Troubleshooting

### Empty Inventory Pages

If you see empty inventory pages:

1. Run `npm run sync-inventory` in the server directory
2. Use the "Sync System" button in the admin panel
3. Check that shops and products exist and are active

### Missing Inventory Entries

The system automatically creates missing entries, but you can force a sync:

1. Via admin panel: Click "Sync System" button
2. Via command line: `npm run sync-inventory`
3. Via API: `POST /api/v0/inventory/sync`

### Performance

- Inventory initialization is non-blocking and logged
- Sync operations are optimized to only create missing entries
- History tracking is paginated for large datasets

## Best Practices

1. **Always start with shops and products** before managing inventory
2. **Use the sync button** if you encounter any inventory issues
3. **Set appropriate min/max stock levels** for each product in each shop
4. **Use the history feature** to track who made changes and when
5. **Regular syncing** ensures data consistency across the system

The system is now fully optimized to work from a clean slate with just an admin account!
