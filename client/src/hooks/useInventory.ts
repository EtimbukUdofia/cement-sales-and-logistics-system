import { useState, useEffect, useCallback } from 'react';
import { apiClient, type InventoryData, type InventoryStatsData, type InventorySummaryData } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';

export function useInventory() {
  const { user } = useAuthStore();
  const [inventory, setInventory] = useState<InventoryData[]>([]);
  const [stats, setStats] = useState<InventoryStatsData | null>(null);
  const [inventorySummary, setInventorySummary] = useState<InventorySummaryData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInventory = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch inventory and stats data
      const [inventoryResponse, statsResponse] = await Promise.all([
        apiClient.getInventory(),
        apiClient.getInventoryStats()
      ]);

      // Handle inventory response
      if (inventoryResponse.success && inventoryResponse.data) {
        setInventory(inventoryResponse.data);
      } else {
        setInventory([]);
      }

      // Handle stats response  
      if (statsResponse.success && statsResponse.data) {
        setStats(statsResponse.data);
      } else {
        setStats(null);
      }

      // Only fetch inventory summary if user is admin
      if (user?.role === 'admin') {
        try {
          const summaryResponse = await apiClient.getInventorySummary();

          if (summaryResponse.success && summaryResponse.data) {
            setInventorySummary(summaryResponse.data);
          } else {
            setInventorySummary([]);
          }
        } catch {
          // Don't set this as a critical error since regular inventory might still work
          setInventorySummary([]);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch inventory';
      setError(errorMessage);
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
    inventorySummary,
    isLoading,
    error,
    refetch: fetchInventory,
    filterInventory
  };
}
