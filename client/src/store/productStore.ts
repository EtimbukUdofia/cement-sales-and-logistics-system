import { create } from 'zustand';
import { apiClient } from '@/lib/api';

export interface Product {
  _id: string;
  name: string;
  variant?: string;
  brand: string;
  size: number;
  price: number;
  imageUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  variant?: string;
  brand: string;
  size: number;
  price: number;
  imageUrl?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  _id: string;
}

interface ProductState {
  products: Product[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: () => Promise<void>;
  createProduct: (productData: CreateProductData) => Promise<boolean>;
  updateProduct: (productData: UpdateProductData) => Promise<boolean>;
  deleteProduct: (productId: string) => Promise<boolean>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: [],
  isLoading: false,
  error: null,

  fetchProducts: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getProducts();
      if (response.success && response.products) {
        set({ products: response.products as Product[], isLoading: false });
      } else {
        throw new Error(response.message || 'Failed to fetch products');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch products';
      set({ error: errorMessage, isLoading: false });
      console.error('Error fetching products:', error);
    }
  },

  createProduct: async (productData: CreateProductData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.createProduct(productData);
      if (response.success) {
        // Refresh products list after creation
        await get().fetchProducts();
        set({ isLoading: false });
        return true;
      } else {
        throw new Error(response.message || 'Failed to create product');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create product';
      set({ error: errorMessage, isLoading: false });
      console.error('Error creating product:', error);
      return false;
    }
  },

  updateProduct: async (productData: UpdateProductData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.updateProduct(productData._id, productData);
      if (response.success) {
        // Refresh products list after update
        await get().fetchProducts();
        set({ isLoading: false });
        return true;
      } else {
        throw new Error(response.message || 'Failed to update product');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update product';
      set({ error: errorMessage, isLoading: false });
      console.error('Error updating product:', error);
      return false;
    }
  },

  deleteProduct: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.deleteProduct(productId);
      if (response.success) {
        // Remove product from local state
        set(state => ({
          products: state.products.filter(product => product._id !== productId),
          isLoading: false
        }));
        return true;
      } else {
        throw new Error(response.message || 'Failed to delete product');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete product';
      set({ error: errorMessage, isLoading: false });
      console.error('Error deleting product:', error);
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
