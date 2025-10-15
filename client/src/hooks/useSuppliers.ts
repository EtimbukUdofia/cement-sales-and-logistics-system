import { useState, useEffect, useCallback } from 'react';
import { apiClient, type SupplierData, type CreateSupplierData, type UpdateSupplierData } from '@/lib/api';

interface UseSupplierOptions {
  search?: string;
  isActive?: boolean;
  autoFetch?: boolean;
}

export function useSuppliers(options: UseSupplierOptions = {}) {
  const [suppliers, setSuppliers] = useState<SupplierData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getSuppliers({
        search: options.search,
        isActive: options.isActive,
      });

      if (response.success && response.data) {
        setSuppliers(response.data);
      } else {
        setError(response.message || 'Failed to fetch suppliers');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch suppliers');
    } finally {
      setLoading(false);
    }
  }, [options.search, options.isActive]);

  useEffect(() => {
    if (options.autoFetch !== false) {
      fetchSuppliers();
    }
  }, [fetchSuppliers, options.autoFetch]);

  const createSupplier = useCallback(async (data: CreateSupplierData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.createSupplier(data);

      if (response.success && response.data) {
        setSuppliers(prev => [response.data!, ...prev]);
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to create supplier';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create supplier';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const updateSupplier = useCallback(async (id: string, data: UpdateSupplierData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.updateSupplier(id, data);

      if (response.success && response.data) {
        setSuppliers(prev =>
          prev.map(supplier =>
            supplier._id === id ? response.data! : supplier
          )
        );
        return { success: true, data: response.data };
      } else {
        const errorMsg = response.message || 'Failed to update supplier';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to update supplier';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteSupplier = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.deleteSupplier(id);

      if (response.success) {
        setSuppliers(prev => prev.filter(supplier => supplier._id !== id));
        return { success: true };
      } else {
        const errorMsg = response.message || 'Failed to delete supplier';
        setError(errorMsg);
        return { success: false, message: errorMsg };
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to delete supplier';
      setError(errorMsg);
      return { success: false, message: errorMsg };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    refetch: fetchSuppliers,
  };
}

export function useSupplier(id: string) {
  const [supplier, setSupplier] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSupplier = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.getSupplierById(id);

      if (response.success && response.data) {
        setSupplier(response.data);
      } else {
        setError(response.message || 'Failed to fetch supplier');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch supplier');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSupplier();
  }, [fetchSupplier]);

  return {
    supplier,
    loading,
    error,
    refetch: fetchSupplier,
  };
}