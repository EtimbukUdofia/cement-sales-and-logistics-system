import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useShop } from '@/hooks/useShop';
import { useAuthStore } from '@/store/authStore';
import { apiClient, type SalesOrderData } from '@/lib/api';
import { toast } from 'sonner';

interface CheckoutData {
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  deliveryAddress?: string;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  notes?: string;
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
      // First, create customer if needed (for now, we'll skip this and use dummy customer)
      // In a real app, you'd check if customer exists or create new one
      const dummyCustomerId = "68b64fa84e118a33a3d06250"; // This should be replaced with actual customer creation

      // Generate unique order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Prepare order data
      const orderData: SalesOrderData = {
        orderNumber,
        customer: dummyCustomerId,
        shop: currentShop._id,
        items: items.map(item => ({
          product: item.id,
          quantity: item.quantity,
          unitPrice: item.price,
          totalPrice: item.price * item.quantity
        })),
        paymentMethod: checkoutData.paymentMethod,
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
