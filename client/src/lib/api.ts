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
  paymentMethod: 'cash' | 'pos' | 'transfer';
  deliveryAddress?: string;
  notes?: string;
}

interface CustomerData {
  name: string;
  phone: string;
  email?: string;
  address?: string;
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
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API request failed: ${endpoint}`, error);
      throw error;
    }
  }

  // Product API methods
  async getProducts() {
    return this.request('/products');
  }

  async getProductsWithInventory(shopId: string) {
    return this.request(`/products/with-inventory/${shopId}`);
  }

  async getProductById(id: string) {
    return this.request(`/products/${id}`);
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
  async getShops() {
    return this.request('/shops');
  }

  async getShopById(id: string) {
    return this.request(`/shops/${id}`);
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
}

// Export a default instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type { ApiResponse, SalesOrderData, CustomerData };
