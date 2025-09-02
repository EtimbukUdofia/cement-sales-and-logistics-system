import { useContext } from 'react';
import { ShopContext, type ShopContextType } from '@/contexts/ShopContext';

export function useShop(): ShopContextType {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
