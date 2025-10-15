import { useState, useEffect, useCallback } from 'react';
import {
  apiClient,
  type PurchaseOrderData,
  type CreatePurchaseOrderData,
  type UpdatePurchaseOrderData,
  type PurchaseOrderStatsData
} from '@/lib/api';

interface UsePurchaseOrderOptions {
  status?: string;
  supplier?: string;
  product?: string;
  page?: number;
  limit?: number;
  autoFetch?: boolean;
}

export function usePurchaseOrders(options: UsePurchaseOrderOptions = {}) {
  const [orders, setOrders] = useState<PurchaseOrderData[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getPurchaseOrders({
        status: options.status,
        supplier: options.supplier,
        product: options.product,
        page: options.page,
        limit: options.limit,
      });

      if (response.success && response.data) {
        setOrders(response.data.data);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Failed to fetch purchase orders');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase orders');
    } finally {
      setLoading(false);
    }
  }, [options.status, options.supplier, options.product, options.page, options.limit]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchOrders();
    }
  }, [fetchOrders, options.autoFetch]);

  const createOrder = useCallback(async (data: CreatePurchaseOrderData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.createPurchaseOrder(data);

      if (response.success && response.data) {
        setOrders(prev => [response.data!, ...prev]);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to create purchase order';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create purchase order';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOrder = useCallback(async (id: string, data: UpdatePurchaseOrderData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.updatePurchaseOrder(id, data);

      if (response.success && response.data) {
        setOrders(prev =>
          prev.map(order =>
            order._id === id ? response.data! : order
          )
        );
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to update purchase order';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update purchase order';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrder = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.deletePurchaseOrder(id);

      if (response.success) {
        setOrders(prev => prev.filter(order => order._id !== id));
        return { success: true };
      } else {
        const errorMsg = response.message || 'Failed to delete purchase order';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete purchase order';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    pagination,
    loading,
    error,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    refetch: fetchOrders,
  };
}

export function usePurchaseOrder(id: string) {
  const [order, setOrder] = useState<PurchaseOrderData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getPurchaseOrderById(id);

      if (response.success && response.data) {
        setOrder(response.data);
      } else {
        setError(response.message || 'Failed to fetch purchase order');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  };
}

export function usePurchaseOrderStats() {
  const [stats, setStats] = useState<PurchaseOrderStatsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getPurchaseOrderStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Failed to fetch purchase order statistics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch purchase order statistics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  };
}