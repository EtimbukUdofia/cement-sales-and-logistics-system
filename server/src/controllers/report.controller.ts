import type { Response } from 'express';
import SalesOrder from '../models/SalesOrder.ts';
import type { AuthRequest } from '../interfaces/interface.ts';

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
      matchQuery.$or = [
        { orderNumber: searchRegex },
        { 'customer.name': searchRegex },
        { notes: searchRegex }
      ];
    }

    console.log('Sales History Query:', JSON.stringify(matchQuery, null, 2));
    console.log('User Role:', userRole, 'User ID:', userId, 'Shop ID:', shopId);
    console.log('Date range:', startDate, 'to', endDate);

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
    console.error('Error getting sales history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve sales history'
    });
  }
};
