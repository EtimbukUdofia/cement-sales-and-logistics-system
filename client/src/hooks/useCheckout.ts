import { useState } from 'react';
import { useCartStore, type CartItem } from '@/store/cartStore';
import { useShop } from '@/hooks/useShop';
import { useAuthStore } from '@/store/authStore';
import { apiClient, type SalesOrderData, type CustomerData } from '@/lib/api';
import { toast } from 'sonner';

interface CheckoutData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  notes?: string;
}

interface Customer {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface InsufficientStockItem {
  product: string;
  available: number;
  requested: number;
}

interface ErrorResponse {
  response?: {
    data?: {
      insufficientStockItems?: InsufficientStockItem[];
      message?: string;
    };
  };
}

export function useCheckout() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { items, clearCart } = useCartStore();
  const { currentShop } = useShop();
  const { user } = useAuthStore();

  const processCheckout = async (checkoutData: CheckoutData) => {
    if (user?.role === 'admin') {
      toast.error('Admins cannot process orders. Only sales personnel can create orders.');
      return { success: false, message: 'Admins cannot process orders' };
    }

    if (!currentShop) {
      toast.error('No shop assigned. Contact your administrator.');
      return { success: false, message: 'No shop assigned' };
    }

    if (!user) {
      toast.error('User not authenticated. Please log in.');
      return { success: false, message: 'User not authenticated' };
    }

    if (items.length === 0) {
      toast.error('Cart is empty. Add items before checkout.');
      return { success: false, message: 'Cart is empty' };
    }

    setIsProcessing(true);

    try {
      // Create customer first
      const customerData: CustomerData = {
        name: checkoutData.customerName,
        phone: checkoutData.customerPhone,
        email: checkoutData.customerEmail,
        address: checkoutData.deliveryAddress
      };

      const customerResponse = await apiClient.createCustomer(customerData);

      if (!customerResponse.success) {
        throw new Error(customerResponse.message || 'Failed to create customer');
      }

      const customerId = (customerResponse.customer as Customer)._id;

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Prepare order data
      const orderData: SalesOrderData = {
        orderNumber,
        customer: customerId,
        shop: currentShop._id,
        items: items.map((item: CartItem) => ({
          product: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        totalAmount,
        paymentMethod: checkoutData.paymentMethod,
        salesPerson: user.id,
        deliveryAddress: checkoutData.deliveryAddress,
        notes: checkoutData.notes
      };

      // Create the order
      const response = await apiClient.createSalesOrder(orderData);

      if (response.success) {
        toast.success('Order created successfully!');
        clearCart();
        return {
          success: true,
          order: response.salesOrder,
          orderNumber: orderData.orderNumber
        };
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Checkout error:', error);

      // Handle insufficient stock error specifically
      if (error instanceof Error && error.message.includes('Insufficient stock')) {
        // Check if the error response contains insufficient stock details
        const errorResponse = (error as ErrorResponse).response?.data;
        if (errorResponse?.insufficientStockItems) {
          const stockDetails = errorResponse.insufficientStockItems
            .map((item: InsufficientStockItem) => `Product ${item.product}: requested ${item.requested}, available ${item.available}`)
            .join('; ');
          toast.error(`Insufficient stock: ${stockDetails}`, { duration: 6000 });
        } else {
          toast.error('Some items have insufficient stock. Please check quantities.');
        }
        return { success: false, message: 'Insufficient stock', type: 'insufficient_stock' };
      }

      const errorMessage = error instanceof Error ? error.message : 'Failed to process order';
      toast.error(`Order failed: ${errorMessage}`);
      return { success: false, message: errorMessage };
    } finally {
      setIsProcessing(false);
    }
  };

  const canCheckout = () => {
    return items.length > 0 && currentShop && user && user.role === 'salesPerson';
  };

  return {
    processCheckout,
    isProcessing,
    canCheckout: canCheckout(),
    currentShop,
    itemCount: items.length
  };
}
