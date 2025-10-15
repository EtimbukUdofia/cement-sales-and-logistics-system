import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import Product from '../models/Product.js';
import Shop from '../models/Shop.js';
import Inventory from '../models/Inventory.js';
import User from '../models/User.js';
import Customer from '../models/Customer.js';
import SalesOrder from '../models/SalesOrder.js';
import Supplier from '../models/Supplier.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Product.deleteMany({});
    await Shop.deleteMany({});
    await Inventory.deleteMany({});
    await User.deleteMany({});
    await Customer.deleteMany({});
    await SalesOrder.deleteMany({});
    await Supplier.deleteMany({});
    await PurchaseOrder.deleteMany({});

    console.log('Existing data cleared');

    // Create sample products
    const products = await Product.insertMany([
      {
        name: 'Dangote Cement',
        variant: '3X',
        brand: 'dangote',
        size: 50,
        price: 5000,
        imageUrl: '/assets/products/dangote-3x-cement.png',
        description: 'High quality cement for construction',
        isActive: true
      },
      {
        name: 'Dangote Cement',
        variant: 'Falcon',
        brand: 'dangote',
        size: 50,
        price: 5200,
        imageUrl: '/assets/products/dangote-falcon-cement.png',
        description: 'Premium cement with superior strength',
        isActive: true
      },
      {
        name: 'BUA Cement',
        variant: 'XL',
        brand: 'bua',
        size: 50,
        price: 4800,
        imageUrl: '/assets/products/bua-cement.jpg',
        description: 'Reliable cement for all construction needs',
        isActive: true
      },
      {
        name: 'Lafarge Cement',
        variant: 'Elephant',
        brand: 'lafarge',
        size: 50,
        price: 5100,
        imageUrl: '/assets/products/lafarge-elephant-cement.png',
        description: 'Strong and durable cement',
        isActive: true
      },
      {
        name: 'Lafarge Cement',
        variant: 'Supafix Premium',
        brand: 'lafarge',
        size: 50,
        price: 5300,
        imageUrl: '/assets/products/lafarge-supafix-premium-cement.png',
        description: 'Premium grade cement for special projects',
        isActive: true
      }
    ]);

    console.log(`${products.length} products created`);

    // Create sample shops
    const shops = await Shop.insertMany([
      {
        name: 'Main Store Lagos',
        address: '123 Victoria Island, Lagos',
        phone: '+234-901-234-5678',
        email: 'lagos@cementstore.com',
        isActive: true
      },
      {
        name: 'Abuja Branch',
        address: '456 Garki District, Abuja',
        phone: '+234-902-345-6789',
        email: 'abuja@cementstore.com',
        isActive: true
      },
      {
        name: 'Port Harcourt Outlet',
        address: '789 Trans-Amadi, Port Harcourt',
        phone: '+234-903-456-7890',
        email: 'portharcourt@cementstore.com',
        isActive: true
      }
    ]);

    console.log(`${shops.length} shops created`);

    // Create sample users with shop assignments
    const hashedPassword = await bcrypt.hash('password123', 12);

    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@cementstore.com',
        password: hashedPassword,
        role: 'admin',
        shopId: shops[0]!._id // Admin assigned to Lagos shop
      },
      {
        username: 'salesperson_lagos',
        email: 'sales.lagos@cementstore.com',
        password: hashedPassword,
        role: 'salesPerson',
        shopId: shops[0]!._id // Lagos shop
      },
      {
        username: 'salesperson_abuja',
        email: 'sales.abuja@cementstore.com',
        password: hashedPassword,
        role: 'salesPerson',
        shopId: shops[1]!._id // Abuja shop
      },
      {
        username: 'salesperson_ph',
        email: 'sales.ph@cementstore.com',
        password: hashedPassword,
        role: 'salesPerson',
        shopId: shops[2]!._id // Port Harcourt shop
      }
    ]);

    console.log(`${users.length} users created with shop assignments`);

    // Create inventory records for each product in each shop
    const inventoryRecords = [];
    for (const shop of shops) {
      for (const product of products) {
        // Random stock between 50-200 bags
        const quantity = Math.floor(Math.random() * 151) + 50;
        inventoryRecords.push({
          product: product._id,
          shop: shop._id,
          quantity,
          minStockLevel: 20,
          maxStockLevel: 500,
          lastRestocked: new Date()
        });
      }
    }

    const inventory = await Inventory.insertMany(inventoryRecords);
    console.log(`${inventory.length} inventory records created`);

    // Create sample customers
    const customers = await Customer.insertMany([
      {
        name: 'ABC Construction',
        email: 'contact@abcconstruction.com',
        phone: '+234 801 234 5678',
        address: 'Victoria Island, Lagos',
        company: 'ABC Construction Limited',
        customerType: 'business',
        preferredDeliveryAddress: 'Victoria Island, Lagos',
        preferredPaymentMethod: 'transfer'
      },
      {
        name: 'XYZ Builders Ltd',
        email: 'info@xyzbuilders.com',
        phone: '+234 802 345 6789',
        address: 'Wuse 2, Abuja',
        company: 'XYZ Builders Limited',
        customerType: 'business',
        preferredDeliveryAddress: 'Wuse 2, Abuja',
        preferredPaymentMethod: 'pos'
      },
      {
        name: 'Delta Properties',
        email: 'sales@deltaproperties.com',
        phone: '+234 803 456 7890',
        address: 'GRA, Port Harcourt',
        company: 'Delta Properties',
        customerType: 'business',
        preferredDeliveryAddress: 'GRA, Port Harcourt',
        preferredPaymentMethod: 'cash'
      },
      {
        name: 'John Okoro',
        email: 'john.okoro@gmail.com',
        phone: '+234 804 567 8901',
        address: 'Ikeja, Lagos',
        customerType: 'individual',
        preferredDeliveryAddress: 'Ikeja, Lagos',
        preferredPaymentMethod: 'pos'
      },
      {
        name: 'Mercy Construction',
        email: 'mercy@mercyconstruction.com',
        phone: '+234 805 678 9012',
        address: 'Garki, Abuja',
        company: 'Mercy Construction Services',
        customerType: 'contractor',
        preferredDeliveryAddress: 'Garki, Abuja',
        preferredPaymentMethod: 'transfer'
      }
    ]);
    console.log(`${customers.length} customers created`);

    // Create sample sales orders
    const salesPersons = users.filter(user => user.role === 'salesPerson');
    const salesOrders = [];

    // Generate sales orders for the last 3 months
    const currentDate = new Date();

    for (let monthsBack = 2; monthsBack >= 0; monthsBack--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - monthsBack, 1);
      const ordersThisMonth = Math.floor(Math.random() * 10) + 5; // 5-15 orders per month

      for (let i = 0; i < ordersThisMonth; i++) {
        const randomDay = Math.floor(Math.random() * 28) + 1;
        const orderDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay);

        const randomCustomer = customers[Math.floor(Math.random() * customers.length)];
        const randomSalesPerson = salesPersons[Math.floor(Math.random() * salesPersons.length)];

        if (!randomCustomer || !randomSalesPerson) {
          continue; // Skip if no customer or salesperson available
        }

        const randomShop = randomSalesPerson.shopId ?
          shops.find(shop => shop._id.toString() === randomSalesPerson.shopId!.toString()) :
          shops[Math.floor(Math.random() * shops.length)];

        // Create order items (1-3 products per order)
        const itemCount = Math.floor(Math.random() * 3) + 1;
        const orderItems = [];
        let totalAmount = 0;

        for (let j = 0; j < itemCount; j++) {
          const randomProduct = products[Math.floor(Math.random() * products.length)];

          if (!randomProduct) {
            continue; // Skip if no product available
          }

          const quantity = Math.floor(Math.random() * 20) + 1; // 1-20 bags
          const unitPrice = randomProduct.price;
          const totalPrice = quantity * unitPrice;

          orderItems.push({
            product: randomProduct._id,
            quantity,
            unitPrice,
            totalPrice
          });

          totalAmount += totalPrice;
        }

        const orderNumber = `ORD-${orderDate.getFullYear()}${String(orderDate.getMonth() + 1).padStart(2, '0')}${String(orderDate.getDate()).padStart(2, '0')}-${String(i + 1).padStart(3, '0')}`;

        salesOrders.push({
          orderNumber,
          customer: randomCustomer._id,
          shop: randomShop!._id,
          items: orderItems,
          totalAmount,
          paymentMethod: ['cash', 'pos', 'transfer'][Math.floor(Math.random() * 3)] as 'cash' | 'pos' | 'transfer',
          orderDate,
          deliveryDate: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days later
          status: ['Pending', 'Confirmed', 'Delivered'][Math.floor(Math.random() * 3)] as 'Pending' | 'Confirmed' | 'Delivered',
          salesPerson: randomSalesPerson._id,
          deliveryAddress: randomCustomer.preferredDeliveryAddress || randomCustomer.address,
          notes: `Order processed by ${randomSalesPerson.username}`
        });
      }
    }

    const createdSalesOrders = await SalesOrder.insertMany(salesOrders);
    console.log(`${createdSalesOrders.length} sales orders created`);

    // Create sample suppliers
    const suppliers = await Supplier.insertMany([
      {
        name: 'Dangote Cement Plc',
        address: 'No. 1 Dangote Street, Ikoyi, Lagos State',
        contactPerson: 'Ademola Johnson',
        phone: '+234-802-123-4567',
        email: 'procurement@dangote.com.ng',
        products: [products[0]!._id, products[1]!._id], // Dangote 3X and Falcon
        isActive: true
      },
      {
        name: 'BUA Cement Plc',
        address: 'BUA House, Plot 962/963, Herbert Macaulay Way, Central Business District, Abuja',
        contactPerson: 'Fatima Abdullahi',
        phone: '+234-803-234-5678',
        email: 'sales@buacement.com',
        products: [products[2]!._id], // BUA XL
        isActive: true
      },
      {
        name: 'Lafarge Africa Plc',
        address: 'Plot 3A & B Block A10, Admiralty Way, Lekki Phase 1, Lagos',
        contactPerson: 'Emeka Okafor',
        phone: '+234-804-345-6789',
        email: 'procurement@lafarge.com.ng',
        products: [products[3]!._id, products[4]!._id], // Elephant and Supafix
        isActive: true
      },
      {
        name: 'Ashaka Cement Plc',
        address: 'Ashaka, Funakaye LGA, Gombe State',
        contactPerson: 'Ibrahim Mohammed',
        phone: '+234-805-456-7890',
        email: 'sales@ashakacem.com',
        products: [],
        isActive: true
      }
    ]);

    console.log(`${suppliers.length} suppliers created`);

    // Create sample purchase orders
    const adminUser = users.find(u => u.role === 'admin');
    const purchaseOrders = [];

    for (let i = 0; i < 8; i++) {
      const randomSupplier = suppliers[Math.floor(Math.random() * suppliers.length)]!;
      const randomProduct = products[Math.floor(Math.random() * products.length)]!;
      const quantity = Math.floor(Math.random() * 100) + 10; // 10-109 bags
      const unitPrice = randomProduct.price + Math.floor(Math.random() * 500); // Add some variation to price

      const statuses = ['Pending', 'Approved', 'Delivered', 'Cancelled'] as const;
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]!;

      const orderDate = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000)); // Random date in last 30 days

      purchaseOrders.push({
        orderNumber: `PO-${Date.now()}-${i}`,
        product: randomProduct._id,
        supplier: randomSupplier._id,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        orderDate,
        expectedDeliveryDate: new Date(orderDate.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days later
        status: randomStatus,
        createdBy: adminUser!._id,
        notes: `Sample purchase order for ${randomProduct.brand} ${randomProduct.name}`
      });
    }

    const createdPurchaseOrders = await PurchaseOrder.insertMany(purchaseOrders);
    console.log(`${createdPurchaseOrders.length} purchase orders created`);

    console.log('\nSeed data created successfully!');
    console.log('\nSample Login Credentials:');
    console.log('Admin: admin@cementstore.com / password123');
    console.log('Sales (Lagos): sales.lagos@cementstore.com / password123');
    console.log('Sales (Abuja): sales.abuja@cementstore.com / password123');
    console.log('Sales (Port Harcourt): sales.ph@cementstore.com / password123');
    console.log('\nSample API calls:');
    console.log(`GET /api/v0/products/with-inventory/${shops[0]!._id}`);
    console.log(`GET /api/v0/products/with-inventory/${shops[1]!._id}`);
    console.log(`GET /api/v0/products/with-inventory/${shops[2]!._id}`);

    process.exit(0);
  } catch (error) {
    console.error('Seed script error:', error);
    process.exit(1);
  }
};

seedData();
