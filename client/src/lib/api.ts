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
  async getShops(options?: RequestInit) {
    return this.request('/shops', options);
  }

  async getShopById(id: string, options?: RequestInit) {
    return this.request(`/shops/${id}`, options);
  }

  // Reports API methods
  async getReports(params: URLSearchParams, options?: RequestInit) {
    return this.request(`/reports?${params.toString()}`, options);
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
export type { ApiResponse, SalesOrderData, CustomerData, CreateProductData };
