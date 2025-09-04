import type { Response } from 'express';
import SalesOrder from '../models/SalesOrder.ts';
import type { AuthRequest } from '../interfaces/interface.ts';

export const getSalesPersonReports = async (req: AuthRequest, res: Response) => {
  try {
    const { timeframe = 'month', from, to } = req.query;
    const userId = req.user?.id;
    const userRole = req.user?.role;
    const shopId = req.user?.shopId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    // Set date range based on timeframe
    let startDate: Date;
    let endDate: Date = new Date();

    switch (timeframe) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        startDate = from ? new Date(from as string) : new Date();
        endDate = to ? new Date(to as string) : new Date();
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Build query based on user role
    let matchQuery: any = {
      orderDate: { $gte: startDate, $lte: endDate }
    };

    if (userRole === 'salesPerson') {
      matchQuery.salesPerson = userId;
    } else if (userRole === 'admin' && shopId) {
      matchQuery.shop = shopId;
    }

    // Get sales metrics
    const salesMetrics = await getSalesMetrics(matchQuery);

    // Get sales history
    const salesHistory = await getSalesHistory(matchQuery);

    // Get top products
    const topProducts = await getTopProducts(matchQuery);

    // Get monthly performance
    const monthlyPerformance = await getMonthlyPerformance(userId || null, userRole || 'salesPerson', shopId || null);

    // Get customer insights
    const customerInsights = await getCustomerInsights(matchQuery);

    const reportData = {
      metrics: salesMetrics,
      salesHistory,
      topProducts,
      monthlyPerformance,
      customerInsights
    };

    res.status(200).json({
      success: true,
      message: 'Sales reports retrieved successfully',
      data: reportData
    });

  } catch (error) {
    console.error('Error getting sales reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sales reports'
    });
  }
};

export const getAdminReports = async (req: AuthRequest, res: Response) => {
  try {
    const { timeframe = 'month', from, to, salesPersonId } = req.query;
    const userRole = req.user?.role;

    if (userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    // Set date range based on timeframe
    let startDate: Date;
    let endDate: Date = new Date();

    switch (timeframe) {
      case 'week':
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate = new Date();
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      case 'custom':
        startDate = from ? new Date(from as string) : new Date();
        endDate = to ? new Date(to as string) : new Date();
        break;
      default:
        startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
    }

    let matchQuery: any = {
      orderDate: { $gte: startDate, $lte: endDate }
    };

    if (salesPersonId) {
      matchQuery.salesPerson = salesPersonId;
    }

    // Get all sales data for admin
    const salesMetrics = await getSalesMetrics(matchQuery);
    const salesHistory = await getSalesHistory(matchQuery);
    const topProducts = await getTopProducts(matchQuery);
    const monthlyPerformance = await getMonthlyPerformance(null, 'admin', null);
    const customerInsights = await getCustomerInsights(matchQuery);

    const reportData = {
      metrics: salesMetrics,
      salesHistory,
      topProducts,
      monthlyPerformance,
      customerInsights
    };

    res.status(200).json({
      success: true,
      message: 'Admin reports retrieved successfully',
      data: reportData
    });

  } catch (error) {
    console.error('Error getting admin reports:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve admin reports'
    });
  }
};

// Helper functions
async function getSalesMetrics(matchQuery: any) {
  const orders = await SalesOrder.find(matchQuery);

  const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = orders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Get previous period for growth calculation
  const previousPeriodStart = new Date(matchQuery.orderDate.$gte);
  previousPeriodStart.setMonth(previousPeriodStart.getMonth() - 1);
  const previousPeriodEnd = new Date(matchQuery.orderDate.$gte);

  let previousMatchQuery = {
    ...matchQuery,
    orderDate: { $gte: previousPeriodStart, $lte: previousPeriodEnd }
  };

  const previousOrders = await SalesOrder.find(previousMatchQuery);
  const previousTotalSales = previousOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const previousTotalOrders = previousOrders.length;

  const salesGrowth = previousTotalSales > 0 ?
    ((totalSales - previousTotalSales) / previousTotalSales) * 100 : 0;
  const ordersGrowth = previousTotalOrders > 0 ?
    ((totalOrders - previousTotalOrders) / previousTotalOrders) * 100 : 0;

  // Mock target data (in real app this would come from a targets collection)
  const monthlyTarget = 500000;
  const targetProgress = Math.min((totalSales / monthlyTarget) * 100, 100);

  return {
    totalSales,
    totalOrders,
    averageOrderValue,
    salesGrowth,
    ordersGrowth,
    monthlyTarget,
    targetProgress,
    rank: 1, // Mock data
    totalSalespeople: 1 // Mock data
  };
}

async function getSalesHistory(matchQuery: any) {
  const orders = await SalesOrder.find(matchQuery)
    .populate('customer', 'name')
    .populate('items.product', 'name variant')
    .sort({ orderDate: -1 })
    .limit(10);

  return orders.map(order => ({
    date: order.orderDate.toISOString().split('T')[0],
    amount: order.totalAmount,
    orders: 1,
    customerName: (order.customer as any)?.name || 'Unknown Customer',
    products: order.items.map((item: any) =>
      `${(item.product as any)?.name} ${(item.product as any)?.variant || ''}`.trim()
    )
  }));
}

async function getTopProducts(matchQuery: any) {
  const pipeline = [
    { $match: matchQuery },
    { $unwind: '$items' },
    {
      $group: {
        _id: '$items.product',
        quantitySold: { $sum: '$items.quantity' },
        revenue: { $sum: '$items.totalPrice' }
      }
    },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    { $sort: { revenue: -1 } },
    { $limit: 5 }
  ];

  const results = await SalesOrder.aggregate(pipeline as any);
  const totalRevenue = results.reduce((sum, item) => sum + item.revenue, 0);

  return results.map(item => ({
    productName: item.product.name,
    variant: item.product.variant || '',
    quantitySold: item.quantitySold,
    revenue: item.revenue,
    percentage: totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0
  }));
}

async function getMonthlyPerformance(userId: string | null, userRole: string, shopId: string | null) {
  const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentDate = new Date();
  const performanceData = [];

  for (let i = 2; i >= 0; i--) {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0);

    let matchQuery: any = {
      orderDate: { $gte: monthStart, $lte: monthEnd }
    };

    if (userRole === 'salesPerson' && userId) {
      matchQuery.salesPerson = userId;
    } else if (userRole === 'admin' && shopId) {
      matchQuery.shop = shopId;
    }

    const orders = await SalesOrder.find(matchQuery);
    const sales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const orderCount = orders.length;

    performanceData.push({
      month: months[monthStart.getMonth() % 12],
      sales,
      orders: orderCount,
      target: 450000 // Mock target
    });
  }

  return performanceData;
}

async function getCustomerInsights(matchQuery: any) {
  // Get orders with customer data
  const orders = await SalesOrder.find(matchQuery)
    .populate('customer', 'name email phone')
    .sort({ orderDate: -1 });

  // Group by customer
  const customerMap = new Map();
  orders.forEach(order => {
    const customerId = (order.customer as any)?._id?.toString();
    if (customerId) {
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          id: customerId,
          name: (order.customer as any)?.name || 'Unknown',
          email: (order.customer as any)?.email || '',
          phone: (order.customer as any)?.phone || '',
          location: 'Lagos', // Mock data
          totalPurchases: 0,
          totalOrders: 0,
          lastOrderDate: order.orderDate,
          status: 'active' as const
        });
      }
      const customer = customerMap.get(customerId);
      customer.totalPurchases += order.totalAmount;
      customer.totalOrders += 1;
      if (order.orderDate > customer.lastOrderDate) {
        customer.lastOrderDate = order.orderDate;
      }
    }
  });

  const customerList = Array.from(customerMap.values());
  const totalCustomers = customerList.length;

  // Determine new vs returning customers (simplified logic)
  const newCustomers = customerList.filter(c => c.totalOrders <= 2).length;
  const returningCustomers = totalCustomers - newCustomers;

  const topCustomer = customerList.reduce((top, current) =>
    current.totalPurchases > (top?.totalPurchases || 0) ? current : top,
    { name: 'No customers', totalPurchases: 0 }
  );

  return {
    totalCustomers,
    newCustomers,
    returningCustomers,
    topCustomer: {
      name: topCustomer.name,
      totalPurchases: topCustomer.totalPurchases
    },
    customerList: customerList.map(customer => ({
      ...customer,
      lastOrderDate: customer.lastOrderDate.toISOString().split('T')[0]
    }))
  };
}
