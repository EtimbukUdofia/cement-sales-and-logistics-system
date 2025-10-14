import type { Response } from 'express';
import SalesOrder from '../models/SalesOrder.js';
import Customer from '../models/Customer.js';
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
