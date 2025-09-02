import { createContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuthStore } from '@/store/authStore';
import { apiClient } from '@/lib/api';

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
  currentShop: Shop | null;
  loading: boolean;
  error: string | null;
  refreshShops: () => Promise<void>;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

interface ShopProviderProps {
  children: ReactNode;
}

function ShopProvider({ children }: ShopProviderProps) {
  const { user } = useAuthStore();
  const [currentShop, setCurrentShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshShops = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // If user is admin or has no assigned shop, don't set a shop
      if (!user?.shopId || user.role === 'admin') {
        setCurrentShop(null);
        return;
      }

      // Fetch the user's assigned shop
      const response = await apiClient.getShopById(user.shopId);
      if (response.success && response.shop) {
        setCurrentShop(response.shop as Shop);
      } else {
        throw new Error(response.message || 'Failed to fetch assigned shop');
      }
    } catch (err) {
      console.error('Error fetching shop:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch shop');
      setCurrentShop(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshShops();
    } else {
      setCurrentShop(null);
      setLoading(false);
    }
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
