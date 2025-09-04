import { useState, useEffect, useCallback } from 'react';
import { apiClient, type InventoryData, type InventoryStatsData } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useInventory() {
  const { user } = useAuthStore();
  const [inventory, setInventory] = useState<InventoryData[]>([]);
  const [stats, setStats] = useState<InventoryStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use getAllInventory for role-based filtering on the backend
      // or getShopInventory if we have a specific shopId and want to be explicit
      const [inventoryResponse, statsResponse] = await Promise.all([
        apiClient.getInventory(),
        apiClient.getInventoryStats()
      ]);

      if (inventoryResponse.success && inventoryResponse.data) {
        setInventory(inventoryResponse.data);
      }

      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const filterInventory = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return inventory;

    return inventory.filter((item) =>
      item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.product.variant?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shop.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [inventory]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  return {
    inventory,
    stats,
    isLoading,
    error,
    refetch: fetchInventory,
    filterInventory
  };
}
