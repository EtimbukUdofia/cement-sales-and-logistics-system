import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient, type ShopData } from '@/lib/api';

interface Shop {
  _id: string;
  name: string;
  address: string;
  manager?: string;
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ShopContextType {
  currentShop: Shop | ShopData | null;
  loading: boolean;
  error: string | null;
  refreshShops: (abortSignal?: AbortSignal) => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps {
  children: ReactNode;
}

function ShopProvider({ children }: ShopProviderProps) {
  const { user } = useAuthStore();
  const [currentShop, setCurrentShop] = useState<Shop | ShopData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshShops = useCallback(async (abortSignal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);

      // If user is admin or has no assigned shop, don't set a shop
      if (!user?.shopId || user.role === 'admin') {
        setCurrentShop(null);
        return;
      }

      // Fetch the user's assigned shop
      const response = await apiClient.getShopById(user.shopId, {
        signal: abortSignal
      });

      if (abortSignal?.aborted) {
        return;
      }

      if (response.success && response.shop) {
        setCurrentShop(response.shop as ShopData);
      } else {
        throw new Error('Failed to fetch assigned shop');
      }
    } catch (err) {
      if (abortSignal?.aborted) {
        return;
      }

      setError(err instanceof Error ? err.message : 'Failed to fetch shop');
      setCurrentShop(null);
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, [user]);

  useEffect(() => {
    const abortController = new AbortController();

    if (user) {
      refreshShops(abortController.signal);
    } else {
      setCurrentShop(null);
      setLoading(false);
    }

    return () => {
      abortController.abort();
    };
  }, [user, refreshShops]);

  const value: ShopContextType = {
    currentShop,
    loading,
    error,
    refreshShops,
  };

  return (
    <ShopContext.Provider value={value}>
      {children}
    </ShopContext.Provider>
  );
}

export { ShopProvider, ShopContext };
export type { Shop, ShopContextType };
