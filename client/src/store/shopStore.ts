import { create } from "zustand";
import { apiClient, type CreateShopData } from "@/lib/api";

export interface Shop {
  _id: string;
  name: string;
  address: string;
  manager?: {
    _id: string;
    username: string;
    email: string;
  };
  phone: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ShopFormData = CreateShopData;

interface ShopState {
  shops: Shop[];
  isLoading: boolean;
  error: string | null;
  fetchShops: () => Promise<void>;
  createShop: (shopData: ShopFormData) => Promise<boolean>;
  updateShop: (id: string, shopData: ShopFormData) => Promise<boolean>;
  deleteShop: (id: string) => Promise<boolean>;
  clearError: () => void;
}

export const useShopStore = create<ShopState>()((set, get) => ({
  shops: [],
  isLoading: false,
  error: null,

  fetchShops: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getShops();
      if (response.success && response.shops) {
        set({ shops: response.shops, isLoading: false });
      } else {
        set({ error: "Failed to fetch shops", isLoading: false });
      }
    } catch (error) {
      let errorMessage = "An error occurred while fetching shops";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
    }
  },

  createShop: async (shopData: ShopFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createShop(shopData);
      if (response.success) {
        // Refresh shops list
        await get().fetchShops();
        set({ isLoading: false });
        return true;
      } else {
        set({ error: response.message || "Failed to create shop", isLoading: false });
        return false;
      }
    } catch (error) {
      let errorMessage = "An error occurred while creating shop";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  updateShop: async (id: string, shopData: ShopFormData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateShop(id, shopData);
      if (response.success) {
        // Refresh shops list
        await get().fetchShops();
        set({ isLoading: false });
        return true;
      } else {
        set({ error: response.message || "Failed to update shop", isLoading: false });
        return false;
      }
    } catch (error) {
      let errorMessage = "An error occurred while updating shop";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  deleteShop: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.deleteShop(id);
      if (response.success) {
        // Remove shop from local state
        set((state) => ({
          shops: state.shops.filter(shop => shop._id !== id),
          isLoading: false
        }));
        return true;
      } else {
        set({ error: response.message || "Failed to delete shop", isLoading: false });
        return false;
      }
    } catch (error) {
      let errorMessage = "An error occurred while deleting shop";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      set({ error: errorMessage, isLoading: false });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));