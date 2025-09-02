import { create } from "zustand";

export interface CartItem {
  id: string;
  name: string;
  variant: string;
  brand: string;
  size: number;
  imageUrl: string;
  price: number;
  quantity: number;
  availableStock: number; // From Inventory model
}

interface CartState {
  items: CartItem[];
  addItem: (product: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>()((set, get) => ({
  items: [],

  addItem: (product) => {
    const items = get().items;
    const existingItem = items.find(item => item.id === product.id);

    if (existingItem) {
      // If item already exists, increase quantity
      set({
        items: items.map(item =>
          item.id === product.id
            ? { ...item, quantity: Math.min(item.quantity + 1, item.availableStock) }
            : item
        )
      });
    } else {
      // Add new item to cart
      set({
        items: [...items, { ...product, quantity: 1 }]
      });
    }
  },

  removeItem: (id) => {
    set({
      items: get().items.filter(item => item.id !== id)
    });
  },

  updateQuantity: (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }

    set({
      items: get().items.map(item =>
        item.id === id
          ? { ...item, quantity: Math.min(quantity, item.availableStock) }
          : item
      )
    });
  },

  clearCart: () => {
    set({ items: [] });
  },

  getTotalItems: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((total, item) => total + (item.price * item.quantity), 0);
  },
}));
