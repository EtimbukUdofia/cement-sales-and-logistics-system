import type { Response } from 'express';
import mongoose from 'mongoose';
import SalesOrder from '../models/SalesOrder.js';
import Customer from '../models/Customer.js';
import Product from '../models/Product.js';
import Inventory from '../models/Inventory.js';
import type { AuthRequest } from '../interfaces/interface.js';

export const getSalesHistory = async (req: AuthRequest, res: Response) => {
  try {
    const {
      period = 'today',
      from,
      to,
      page = 1,
      limit = 20,
      status,
      paymentMethod,
      search,
      sortBy = 'orderDate',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user?.id;
    const userRole = req.user?.role;
    const shopId = req.user?.shopId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Set date range based on period
    let startDate: Date;
    let endDate: Date = new Date();
    endDate.setHours(23, 59, 59, 999); // End of day

    switch (period) {
      case 'today':
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0); // Start of day
        break;
      case 'yesterday':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(endDate.getDate() - 1);
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay()); // Start of week (Sunday)
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last_week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - startDate.getDay() - 7); // Start of last week
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(endDate.getDate() - endDate.getDay() - 1); // End of last week
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'this_month':
        startDate = new Date();
        startDate.setDate(1); // First day of current month
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'last_month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1, 1); // First day of last month
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date();
        endDate.setDate(0); // Last day of last month
        endDate.setHours(23, 59, 59, 999);
        break;
      case 'custom':
        startDate = from ? new Date(from as string) : new Date();
        startDate.setHours(0, 0, 0, 0);
        endDate = to ? new Date(to as string) : new Date();
        endDate.setHours(23, 59, 59, 999);
        break;
      default:
        startDate = new Date();
        startDate.setHours(0, 0, 0, 0);
    }

    // Build query based on user role and filters
    let matchQuery: any = {
      orderDate: { $gte: startDate, $lte: endDate }
    };

    // Filter by user role
    if (userRole === 'salesPerson') {
      matchQuery.salesPerson = userId;
    } else if (userRole === 'admin' && shopId) {
      matchQuery.shop = shopId;
    }
    // For admin without shopId, show all data (remove shop restriction)

    // Additional filters
    if (status && status !== 'all') {
      matchQuery.status = status;
    }
    if (paymentMethod && paymentMethod !== 'all') {
      matchQuery.paymentMethod = paymentMethod;
    }

    // Search functionality
    if (search) {
      const searchRegex = new RegExp(search as string, 'i');

      // We need to handle search differently since customer is a populated field
      // First, find customers that match the search term
      const matchingCustomers = await Customer.find({
        $or: [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { company: searchRegex }
        ]
      }).select('_id').lean();

      const customerIds = matchingCustomers.map(c => c._id);

      matchQuery.$or = [
        { orderNumber: searchRegex },
        { notes: searchRegex }
      ];

      // Only add customer search if we found matching customers
      if (customerIds.length > 0) {
        matchQuery.$or.push({ customer: { $in: customerIds } });
      }
    }
    // Pagination
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    // Sort configuration
    const sortConfig: any = {};
    sortConfig[sortBy as string] = sortOrder === 'desc' ? -1 : 1;

    // Get sales orders with populated data
    const salesOrders = await SalesOrder.find(matchQuery)
      .populate('customer', 'name email phone company')
      .populate('shop', 'name location')
      .populate('salesPerson', 'username email')
      .populate('items.product', 'name variant brand size price')
      .sort(sortConfig)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const totalOrders = await SalesOrder.countDocuments(matchQuery);

    const response = {
      salesHistory: salesOrders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customer: {
          name: (order.customer as any)?.name || 'Unknown',
          email: (order.customer as any)?.email || '',
          phone: (order.customer as any)?.phone || '',
          company: (order.customer as any)?.company || ''
        },
        shop: {
          name: (order.shop as any)?.name || 'Unknown',
          location: (order.shop as any)?.location || ''
        },
        salesPerson: {
          username: (order.salesPerson as any)?.username || 'Unknown',
          email: (order.salesPerson as any)?.email || ''
        },
        items: order.items.map(item => ({
          product: {
            name: (item.product as any)?.name || 'Unknown Product',
            variant: (item.product as any)?.variant || '',
            brand: (item.product as any)?.brand || '',
            size: (item.product as any)?.size || 0
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice
        })),
        totalAmount: order.totalAmount,
        paymentMethod: order.paymentMethod,
        status: order.status,
        orderDate: order.orderDate,
        deliveryDate: order.deliveryDate,
        deliveryAddress: order.deliveryAddress,
        notes: order.notes
      })),
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalOrders / limitNum),
        totalRecords: totalOrders,
        limit: limitNum,
        hasNext: pageNum < Math.ceil(totalOrders / limitNum),
        hasPrev: pageNum > 1
      },
      filters: {
        period,
        startDate,
        endDate,
        status,
        paymentMethod,
        search,
        sortBy,
        sortOrder
      }
    };

    res.status(200).json({
      success: true,
      message: 'Sales history retrieved successfully',
      data: response
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sales history'
    });
  }
};

export const getSalesDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const shopId = req.user?.shopId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Base query - filter by user role
    let baseQuery: any = {};
    if (userRole === 'salesPerson') {
      baseQuery.salesPerson = userId;
    } else if (userRole === 'admin' && shopId) {
      baseQuery.shop = shopId;
    }

    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const endOfYesterday = new Date(yesterday);
    endOfYesterday.setHours(23, 59, 59, 999);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    // Today's metrics
    const todaysOrders = await SalesOrder.find({
      ...baseQuery,
      orderDate: { $gte: today, $lte: endOfToday }
    });

    const todaysSales = todaysOrders.length;
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Yesterday's metrics for comparison
    const yesterdaysOrders = await SalesOrder.find({
      ...baseQuery,
      orderDate: { $gte: yesterday, $lte: endOfYesterday }
    });

    const yesterdaysSales = yesterdaysOrders.length;
    const yesterdaysRevenue = yesterdaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // This week's metrics
    const thisWeeksOrders = await SalesOrder.find({
      ...baseQuery,
      orderDate: { $gte: thisWeek, $lte: endOfToday }
    });

    const thisWeeksSales = thisWeeksOrders.length;
    const thisWeeksRevenue = thisWeeksOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // This month's metrics
    const thisMonthsOrders = await SalesOrder.find({
      ...baseQuery,
      orderDate: { $gte: thisMonth, $lte: endOfToday }
    });

    const thisMonthsSales = thisMonthsOrders.length;
    const thisMonthsRevenue = thisMonthsOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate percentage changes
    const salesChange = yesterdaysSales === 0
      ? (todaysSales > 0 ? 100 : 0)
      : ((todaysSales - yesterdaysSales) / yesterdaysSales) * 100;

    const revenueChange = yesterdaysRevenue === 0
      ? (todaysRevenue > 0 ? 100 : 0)
      : ((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100;

    // Top products this month
    const topProducts = await SalesOrder.aggregate([
      {
        $match: {
          ...baseQuery,
          orderDate: { $gte: thisMonth, $lte: endOfToday }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product._id',
          productName: { $first: '$items.product.name' },
          brand: { $first: '$items.product.brand' },
          variant: { $first: '$items.product.variant' },
          size: { $first: '$items.product.size' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 5 }
    ]);

    // Recent orders (last 5)
    const recentOrders = await SalesOrder.find(baseQuery)
      .populate('customer', 'name company')
      .populate('shop', 'name location')
      .sort({ orderDate: -1 })
      .limit(5)
      .select('orderNumber customer shop totalAmount status orderDate');

    // Sales trend for the last 7 days
    const salesTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const dayOrders = await SalesOrder.find({
        ...baseQuery,
        orderDate: { $gte: date, $lte: endDate }
      });

      salesTrend.push({
        date: date.toISOString().split('T')[0],
        sales: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      });
    }

    const response = {
      today: {
        sales: todaysSales,
        revenue: todaysRevenue,
        salesChange: Math.round(salesChange * 100) / 100,
        revenueChange: Math.round(revenueChange * 100) / 100
      },
      thisWeek: {
        sales: thisWeeksSales,
        revenue: thisWeeksRevenue
      },
      thisMonth: {
        sales: thisMonthsSales,
        revenue: thisMonthsRevenue
      },
      topProducts,
      recentOrders,
      salesTrend
    };

    res.status(200).json({
      success: true,
      message: 'Sales dashboard metrics retrieved successfully',
      data: response
    });

  } catch (error) {
    console.error('Error getting sales dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sales dashboard metrics'
    });
  }
};

export const getAdminDashboardMetrics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const { shopId: filterShopId } = req.query;

    if (!userId || userRole !== 'admin') {
      return res.status(401).json({ success: false, message: 'Admin access required' });
    }

    // Base query - admin can see all shop data
    let baseQuery: any = {};

    // Admins have full access to all shops regardless of their assigned shop
    // If a specific shop is requested, filter by that shop
    // If no filter specified, show all data
    if (filterShopId && typeof filterShopId === 'string') {
      baseQuery.shop = filterShopId;
    }
    // If no shopId filter provided, show all shops data (default behavior)

    // Date ranges
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const thisWeek = new Date();
    thisWeek.setDate(thisWeek.getDate() - thisWeek.getDay());
    thisWeek.setHours(0, 0, 0, 0);

    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1, 1);
    const endOfLastMonth = new Date();
    endOfLastMonth.setDate(0);
    endOfLastMonth.setHours(23, 59, 59, 999);

    // Today's metrics
    const [todaysOrders, yesterdaysOrders] = await Promise.all([
      SalesOrder.find({
        ...baseQuery,
        orderDate: { $gte: today, $lte: endOfToday }
      }),
      SalesOrder.find({
        ...baseQuery,
        orderDate: { $gte: yesterday, $lte: new Date(yesterday.getTime() + 24 * 60 * 60 * 1000 - 1) }
      })
    ]);

    const todaysSales = todaysOrders.length;
    const todaysRevenue = todaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const yesterdaysSales = yesterdaysOrders.length;
    const yesterdaysRevenue = yesterdaysOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // This month vs last month
    const [thisMonthOrders, lastMonthOrders] = await Promise.all([
      SalesOrder.find({
        ...baseQuery,
        orderDate: { $gte: thisMonth, $lte: endOfToday }
      }),
      SalesOrder.find({
        ...baseQuery,
        orderDate: { $gte: lastMonth, $lte: endOfLastMonth }
      })
    ]);

    const thisMonthsSales = thisMonthOrders.length;
    const thisMonthsRevenue = thisMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const lastMonthsSales = lastMonthOrders.length;
    const lastMonthsRevenue = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);

    // Calculate percentage changes
    const salesChange = yesterdaysSales === 0
      ? (todaysSales > 0 ? 100 : 0)
      : ((todaysSales - yesterdaysSales) / yesterdaysSales) * 100;

    const revenueChange = yesterdaysRevenue === 0
      ? (todaysRevenue > 0 ? 100 : 0)
      : ((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100;

    const monthlySalesChange = lastMonthsSales === 0
      ? (thisMonthsSales > 0 ? 100 : 0)
      : ((thisMonthsSales - lastMonthsSales) / lastMonthsSales) * 100;

    const monthlyRevenueChange = lastMonthsRevenue === 0
      ? (thisMonthsRevenue > 0 ? 100 : 0)
      : ((thisMonthsRevenue - lastMonthsRevenue) / lastMonthsRevenue) * 100;

    // Top performing sales people this month
    const topSalesPeople = await SalesOrder.aggregate([
      {
        $match: {
          ...baseQuery,
          orderDate: { $gte: thisMonth, $lte: endOfToday }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'salesPerson',
          foreignField: '_id',
          as: 'salesPersonDetails'
        }
      },
      { $unwind: '$salesPersonDetails' },
      {
        $group: {
          _id: '$salesPerson',
          salesPersonName: { $first: '$salesPersonDetails.username' },
          salesPersonEmail: { $first: '$salesPersonDetails.email' },
          totalSales: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          avgOrderValue: { $avg: '$totalAmount' }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Top products this month
    const topProducts = await SalesOrder.aggregate([
      {
        $match: {
          ...baseQuery,
          orderDate: { $gte: thisMonth, $lte: endOfToday }
        }
      },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product._id',
          productName: { $first: '$items.product.name' },
          brand: { $first: '$items.product.brand' },
          variant: { $first: '$items.product.variant' },
          size: { $first: '$items.product.size' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.totalPrice' },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 }
    ]);

    // Recent orders (last 10)
    const recentOrders = await SalesOrder.find(baseQuery)
      .populate('customer', 'name company')
      .populate('shop', 'name location')
      .populate('salesPerson', 'username email')
      .sort({ orderDate: -1 })
      .limit(10)
      .select('orderNumber customer shop salesPerson totalAmount status orderDate');

    // Sales trend for the last 30 days
    const salesTrend = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const dayOrders = await SalesOrder.find({
        ...baseQuery,
        orderDate: { $gte: date, $lte: endDate }
      });

      salesTrend.push({
        date: date.toISOString().split('T')[0],
        sales: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0)
      });
    }

    // Inventory summary
    const Inventory = (await import('../models/Inventory.js')).default;
    const inventoryShopId = baseQuery.shop;
    const inventoryStats = await Inventory.aggregate([
      ...(inventoryShopId ? [{ $match: { shop: new (await import('mongoose')).Types.ObjectId(inventoryShopId) } }] : []),
      {
        $lookup: {
          from: 'products',
          localField: 'product',
          foreignField: '_id',
          as: 'productDetails'
        }
      },
      { $unwind: '$productDetails' },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          totalValue: {
            $sum: {
              $multiply: ['$quantity', '$productDetails.price']
            }
          },
          lowStockItems: {
            $sum: {
              $cond: [
                { $lt: ['$quantity', '$minStockLevel'] },
                1,
                0
              ]
            }
          },
          outOfStockItems: {
            $sum: {
              $cond: [
                { $eq: ['$quantity', 0] },
                1,
                0
              ]
            }
          }
        }
      }
    ]);

    const inventoryData = inventoryStats[0] || {
      totalProducts: 0,
      totalQuantity: 0,
      totalValue: 0,
      lowStockItems: 0,
      outOfStockItems: 0
    };

    // Order status distribution
    const orderStatuses = await SalesOrder.aggregate([
      {
        $match: {
          ...baseQuery,
          orderDate: { $gte: thisMonth, $lte: endOfToday }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      }
    ]);

    const response = {
      today: {
        sales: todaysSales,
        revenue: todaysRevenue,
        salesChange: Math.round(salesChange * 100) / 100,
        revenueChange: Math.round(revenueChange * 100) / 100
      },
      thisMonth: {
        sales: thisMonthsSales,
        revenue: thisMonthsRevenue,
        salesChange: Math.round(monthlySalesChange * 100) / 100,
        revenueChange: Math.round(monthlyRevenueChange * 100) / 100
      },
      inventory: inventoryData,
      topSalesPeople,
      topProducts,
      recentOrders,
      salesTrend,
      orderStatuses
    };

    res.status(200).json({
      success: true,
      message: 'Admin dashboard metrics retrieved successfully',
      data: response
    });

  } catch (error) {
    console.error('Error getting admin dashboard metrics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin dashboard metrics'
    });
  }
};

// Comprehensive reports endpoint
export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const { shop, from, to } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Parse date range
    const startDate = from ? new Date(from as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const endDate = to ? new Date(to as string) : new Date();

    // Build query filters
    const matchFilter: any = {
      orderDate: { $gte: startDate, $lte: endDate }
    };

    // Filter by shop if specified and not "all"
    if (shop && shop !== 'all') {
      matchFilter.shop = new mongoose.Types.ObjectId(shop as string);
    }

    // For sales persons, only show their shop data
    if (userRole === 'salesPerson' && req.user?.shopId) {
      matchFilter.shop = new mongoose.Types.ObjectId(req.user.shopId);
    }

    console.log('Report query filter:', matchFilter);

    // Get sales orders data
    const salesOrders = await SalesOrder.find(matchFilter)
      .populate('shop', 'name address')
      .populate('customer', 'name phone email')
      .populate('items.product', 'name variant price')
      .populate('salesPerson', 'username email')
      .sort({ orderDate: -1 });

    console.log(`Found ${salesOrders.length} sales orders`);

    // Calculate revenue metrics
    const totalRevenue = salesOrders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = salesOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Get unique customers
    const uniqueCustomers = new Set(salesOrders.map(order => order.customer._id.toString()));
    const totalCustomers = uniqueCustomers.size;

    // Get revenue by month for the last 6 months
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthOrders = salesOrders.filter(order =>
        order.orderDate >= monthStart && order.orderDate <= monthEnd
      );

      revenueByMonth.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        revenue: monthOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        orders: monthOrders.length
      });
    }

    // Generate sales overview for last 30 days
    const salesOverview = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);

      const dayOrders = salesOrders.filter(order =>
        order.orderDate >= dayStart && order.orderDate < dayEnd
      );

      salesOverview.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        orders: dayOrders.length
      });
    }

    // Calculate product performance
    const productMap = new Map();
    salesOrders.forEach(order => {
      order.items.forEach((item: any) => {
        const key = `${item.product.name}-${item.product.variant}`;
        if (!productMap.has(key)) {
          productMap.set(key, {
            productName: item.product.name,
            variant: item.product.variant,
            revenue: 0,
            quantity: 0,
            orders: 0
          });
        }
        const product = productMap.get(key);
        product.revenue += item.totalPrice;
        product.quantity += item.quantity;
        product.orders += 1;
      });
    });

    const productPerformance = Array.from(productMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);

    // Get inventory data
    const inventoryQuery: any = {};
    if (shop && shop !== 'all') {
      inventoryQuery.shop = new mongoose.Types.ObjectId(shop as string);
    }
    if (userRole === 'salesPerson' && req.user?.shopId) {
      inventoryQuery.shop = new mongoose.Types.ObjectId(req.user.shopId);
    }

    const inventory = await Inventory.find(inventoryQuery)
      .populate('product', 'name variant price')
      .populate('shop', 'name address');

    const totalProducts = inventory.length;
    const lowStockItems = inventory
      .filter((item: any) => item.quantity <= item.minStockLevel && item.quantity > 0)
      .map((item: any) => ({
        productName: item.product.name,
        variant: item.product.variant,
        currentStock: item.quantity,
        minimumStock: item.minStockLevel,
        shopName: item.shop.name
      }));

    const outOfStockItems = inventory
      .filter((item: any) => item.quantity === 0)
      .map((item: any) => ({
        productName: item.product.name,
        variant: item.product.variant,
        shopName: item.shop.name
      }));

    const topStockItems = inventory
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 10)
      .map((item: any) => ({
        productName: item.product.name,
        variant: item.product.variant,
        currentStock: item.quantity,
        shopName: item.shop.name
      }));

    // Get sales person performance (only for admin users)
    let salesPersonPerformance = [];
    if (userRole === 'admin') {
      const salesPersonMap = new Map();
      salesOrders.forEach((order: any) => {
        if (order.salesPerson) {
          const key = order.salesPerson._id.toString();
          if (!salesPersonMap.has(key)) {
            salesPersonMap.set(key, {
              id: order.salesPerson._id,
              name: order.salesPerson.username,
              email: order.salesPerson.email,
              shopName: order.shop.name,
              totalRevenue: 0,
              totalOrders: 0,
              orders: []
            });
          }
          const salesperson = salesPersonMap.get(key);
          salesperson.totalRevenue += order.totalAmount;
          salesperson.totalOrders += 1;
          salesperson.orders.push(order);
        }
      });

      salesPersonPerformance = Array.from(salesPersonMap.values())
        .map((person, index) => ({
          ...person,
          averageOrderValue: person.totalOrders > 0 ? person.totalRevenue / person.totalOrders : 0,
          revenueGrowth: Math.random() * 20 - 5, // Mock growth for now
          ordersGrowth: Math.random() * 15 - 5, // Mock growth for now
          performanceScore: Math.min(100, (person.totalRevenue / 10000) + (person.totalOrders * 2)),
          rank: index + 1
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    // Get shop comparison (only for admin users and "all shops" view)
    let shopComparison = [];
    if (userRole === 'admin' && (!shop || shop === 'all')) {
      const shopMap = new Map();
      salesOrders.forEach((order: any) => {
        const key = order.shop._id.toString();
        if (!shopMap.has(key)) {
          shopMap.set(key, {
            shopId: order.shop._id,
            shopName: order.shop.name,
            location: order.shop.address,
            totalRevenue: 0,
            totalOrders: 0,
            orders: []
          });
        }
        const shop = shopMap.get(key);
        shop.totalRevenue += order.totalAmount;
        shop.totalOrders += 1;
        shop.orders.push(order);
      });

      shopComparison = Array.from(shopMap.values())
        .map(shop => ({
          ...shop,
          averageOrderValue: shop.totalOrders > 0 ? shop.totalRevenue / shop.totalOrders : 0,
          revenueGrowth: Math.random() * 25 - 10, // Mock growth for now
          ordersGrowth: Math.random() * 20 - 10, // Mock growth for now
          topProduct: productPerformance[0]?.productName || 'N/A',
          salesPersonCount: salesPersonPerformance.filter(sp => sp.shopName === shop.shopName).length,
          inventoryValue: inventory
            .filter((item: any) => item.shop._id.toString() === shop.shopId.toString())
            .reduce((sum: number, item: any) => sum + (item.quantity * (item.product?.price || 1000)), 0),
          performanceScore: Math.min(100, (shop.totalRevenue / 50000) + (shop.totalOrders * 1.5))
        }))
        .sort((a, b) => b.totalRevenue - a.totalRevenue);
    }

    const reportData = {
      revenue: {
        totalRevenue,
        totalOrders,
        totalProducts: await Product.countDocuments(),
        totalCustomers,
        revenueGrowth: Math.random() * 20 - 5, // Mock growth for now
        ordersGrowth: Math.random() * 15 - 5, // Mock growth for now
        averageOrderValue,
        topSellingProduct: productPerformance[0]?.productName || 'N/A',
        revenueByMonth
      },
      salesOverview,
      productPerformance,
      inventory: {
        totalProducts,
        lowStockItems,
        outOfStockItems,
        topStockItems,
        stockTurnover: [] // Would need additional data tracking for real turnover calculation
      },
      salesPersonPerformance,
      shopComparison
    };

    console.log('Report data generated:', {
      totalRevenue,
      totalOrders,
      totalProducts,
      salesPersonCount: salesPersonPerformance.length,
      shopCount: shopComparison.length
    });

    res.status(200).json({
      success: true,
      data: reportData
    });

  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reports'
    });
  }
};
