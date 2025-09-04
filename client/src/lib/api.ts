// API configuration and helper functions
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v0';

interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  [key: string]: unknown;
}

interface SalesOrderData {
  orderNumber: string;
  customer: string;
  shop: string;
  items: Array<{
    product: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  paymentMethod: 'cash' | 'pos' | 'transfer';
  salesPerson: string;
  deliveryAddress?: string;
  notes?: string;
}

interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

interface UserData {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'salesPerson';
  shopId?: string;
  createdAt: string;
  updatedAt: string;
  shop?: {
    _id: string;
    name: string;
    address: string;
  };
}

interface CreateUserData {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'salesPerson';
  shopId?: string;
}

interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'salesPerson';
  shopId?: string;
}

interface ShopData {
  _id: string;
  name: string;
  location: string;
  address?: string;
  phone?: string;
  email?: string;
  manager?: {
    _id: string;
    username: string;
    email: string;
  };
}

interface CreateProductData {
  name: string;
  variant?: string;
  brand: string;
  size: number;
  price: number;
  imageUrl?: string;
  description?: string;
  isActive?: boolean;
}

interface InventoryData {
  _id: string;
  product: {
    _id: string;
    name: string;
    variant?: string;
    brand: string;
    size: number;
    price: number;
    imageUrl?: string;
  };
  shop: {
    _id: string;
    name: string;
    location: string;
  };
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  lastRestocked?: string;
  createdAt: string;
  updatedAt: string;
}

interface InventoryStatsData {
  totalProducts: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
  totalQuantity: number;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: options.signal, // Support for AbortController
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });

      // Check if the request was aborted
      if (options.signal?.aborted) {
        throw new Error('Request was aborted');
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      // Don't log errors for aborted requests
      if (error instanceof Error && error.name === 'AbortError') {
        throw error;
      }

      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Product API methods
  async getProducts(options?: RequestInit) {
    return this.request('/products', options);
  }

  async getProductsWithInventory(shopId: string, options?: RequestInit) {
    return this.request(`/products/with-inventory/${shopId}`, options);
  }

  async getProductById(id: string, options?: RequestInit) {
    return this.request(`/products/${id}`, options);
  }

  async createProduct(productData: CreateProductData) {
    return this.request('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  async updateProduct(id: string, productData: Partial<CreateProductData>) {
    return this.request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(productData),
    });
  }

  async deleteProduct(id: string) {
    return this.request(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // Sales Order API methods
  async createSalesOrder(orderData: SalesOrderData) {
    return this.request('/sales-orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getSalesOrders() {
    return this.request('/sales-orders');
  }

  async getSalesOrderById(id: string) {
    return this.request(`/sales-orders/${id}`);
  }

  // Shop API methods
  async getShops(options?: RequestInit): Promise<{ success: boolean; shops: ShopData[] }> {
    return this.request('/shops', options) as Promise<{ success: boolean; shops: ShopData[] }>;
  }

  async getShopById(id: string, options?: RequestInit): Promise<{ success: boolean; shop: ShopData }> {
    return this.request(`/shops/${id}`, options) as Promise<{ success: boolean; shop: ShopData }>;
  }

  // Reports API methods
  async getReports(params: URLSearchParams, options?: RequestInit) {
    return this.request(`/reports?${params.toString()}`, options);
  }

  // Sales History API methods
  async getSalesHistory(params: URLSearchParams, options?: RequestInit) {
    return this.request(`/reports/history?${params.toString()}`, options);
  }

  // Customer API methods
  async getCustomers() {
    return this.request('/customers');
  }

  async createCustomer(customerData: CustomerData) {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  // User API methods
  async getUsers(): Promise<{ success: boolean; users: UserData[] }> {
    return this.request('/users') as Promise<{ success: boolean; users: UserData[] }>;
  }

  async getUserById(id: string): Promise<{ success: boolean; user: UserData }> {
    return this.request(`/users/${id}`) as Promise<{ success: boolean; user: UserData }>;
  }

  async createUser(userData: CreateUserData): Promise<{ success: boolean; message: string; user: UserData }> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }) as Promise<{ success: boolean; message: string; user: UserData }>;
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<{ success: boolean; message: string; user: UserData }> {
    return this.request(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }) as Promise<{ success: boolean; message: string; user: UserData }>;
  }

  async deleteUser(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/users/${id}`, {
      method: 'DELETE',
    }) as Promise<{ success: boolean; message: string }>;
  }

  // Inventory API methods
  async getInventory(options?: RequestInit) {
    return this.request<InventoryData[]>('/inventory', options);
  }

  async getInventoryStats(shopId?: string, options?: RequestInit) {
    const endpoint = shopId ? `/inventory/stats?shop=${shopId}` : '/inventory/stats';
    return this.request<InventoryStatsData>(endpoint, options);
  }

  async getShopInventory(shopId: string, options?: RequestInit) {
    return this.request<InventoryData[]>(`/inventory/shop/${shopId}`, options);
  }

  async updateInventoryStock(inventoryId: string, quantity: number) {
    return this.request(`/inventory/${inventoryId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  }
}

// Export a default instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type { ApiResponse, SalesOrderData, CustomerData, CreateProductData, InventoryData, InventoryStatsData, UserData, CreateUserData, UpdateUserData, ShopData };
