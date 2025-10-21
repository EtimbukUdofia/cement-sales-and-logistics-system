// API configuration and helper functions
// const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v0';
const API_BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5000/api/v0" : "/api/v0";

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
  address: string;
  phone: string;
  email?: string;
  manager?: {
    _id: string;
    username: string;
    email: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateShopData {
  name: string;
  address: string;
  manager?: string;
  phone: string;
  email?: string;
  isActive?: boolean;
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
    address: string;
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

interface InventorySummaryData {
  shopId: string;
  shopName: string;
  shopLocation: string;
  totalItems: number;
  totalValue: number;
  lowStockCount: number;
}

interface SupplierData {
  _id: string;
  name: string;
  address?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  products: Array<{
    _id: string;
    name: string;
    brand: string;
    variant?: string;
  }>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface CreateSupplierData {
  name: string;
  address?: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  products?: string[];
  isActive?: boolean;
}

interface UpdateSupplierData {
  name?: string;
  address?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  products?: string[];
  isActive?: boolean;
}

interface PurchaseOrderData {
  _id: string;
  orderNumber: string;
  product: {
    _id: string;
    name: string;
    brand: string;
    variant?: string;
  };
  supplier: {
    _id: string;
    name: string;
    phone: string;
  };
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  status: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';
  notes?: string;
  createdBy: {
    _id: string;
    username: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface CreatePurchaseOrderData {
  orderNumber: string;
  product: string;
  supplier: string;
  quantity: number;
  unitPrice: number;
  expectedDeliveryDate?: string;
  notes?: string;
}

interface UpdatePurchaseOrderData {
  orderNumber?: string;
  product?: string;
  supplier?: string;
  quantity?: number;
  unitPrice?: number;
  expectedDeliveryDate?: string;
  status?: 'Pending' | 'Approved' | 'Delivered' | 'Cancelled';
  receivedDate?: string;
  notes?: string;
}

interface PurchaseOrderStatsData {
  totalOrders: number;
  pendingOrders: number;
  approvedOrders: number;
  deliveredOrders: number;
  cancelledOrders: number;
  totalValue: number;
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

  async createShop(shopData: CreateShopData, options?: RequestInit): Promise<{ success: boolean; shop?: ShopData; message?: string }> {
    return this.request('/shops', {
      method: 'POST',
      body: JSON.stringify(shopData),
      ...options,
    }) as Promise<{ success: boolean; shop?: ShopData; message?: string }>;
  }

  async updateShop(id: string, shopData: CreateShopData, options?: RequestInit): Promise<{ success: boolean; shop?: ShopData; message?: string }> {
    return this.request(`/shops/${id}`, {
      method: 'PUT',
      body: JSON.stringify(shopData),
      ...options,
    }) as Promise<{ success: boolean; shop?: ShopData; message?: string }>;
  }

  async deleteShop(id: string, options?: RequestInit): Promise<{ success: boolean; message?: string }> {
    return this.request(`/shops/${id}`, {
      method: 'DELETE',
      ...options,
    }) as Promise<{ success: boolean; message?: string }>;
  }

  // Reports API methods
  async getReports(params: URLSearchParams, options?: RequestInit) {
    return this.request(`/reports?${params.toString()}`, options);
  }

  // Sales History API methods
  async getSalesHistory(params: URLSearchParams, options?: RequestInit) {
    return this.request(`/reports/history?${params.toString()}`, options);
  }

  // Dashboard Metrics API method
  async getDashboardMetrics(options?: RequestInit) {
    return this.request('/reports/dashboard-metrics', options);
  }

  // Admin Dashboard Metrics API method
  async getAdminDashboardMetrics(shopId?: string, options?: RequestInit) {
    const url = shopId
      ? `/reports/admin-dashboard-metrics?shopId=${encodeURIComponent(shopId)}`
      : '/reports/admin-dashboard-metrics';
    return this.request(url, options);
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

  async getInventorySummary(options?: RequestInit) {
    return this.request<InventorySummaryData[]>('/inventory/summary', options);
  }

  // Admin Shop Inventory Management API methods
  async getShopDetailsForInventory(shopId: string, options?: RequestInit) {
    return this.request(`/inventory/admin/shops/${shopId}`, options);
  }

  async getShopInventoryForAdmin(shopId: string, options?: RequestInit) {
    return this.request(`/inventory/admin/shops/${shopId}/inventory`, options);
  }

  async updateShopInventory(
    shopId: string,
    updateData: {
      productId: string;
      newQuantity: number;
      changeType: 'increase' | 'decrease' | 'restock' | 'adjustment';
      reason?: string;
    },
    options?: RequestInit
  ) {
    return this.request(`/inventory/admin/shops/${shopId}/inventory/update`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
      ...options,
    });
  }

  async getShopInventoryHistory(
    shopId: string,
    params?: { page?: number; limit?: number },
    options?: RequestInit
  ) {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    return this.request(
      `/inventory/admin/shops/${shopId}/inventory/history${queryString ? `?${queryString}` : ''}`,
      options
    );
  }

  // Sync inventory system (admin only)
  async syncInventory(options?: RequestInit) {
    return this.request('/inventory/sync', {
      method: 'POST',
      ...options,
    });
  }

  // Supplier API methods
  async getSuppliers(params?: { search?: string; isActive?: boolean }, options?: RequestInit) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.isActive !== undefined) query.append('isActive', params.isActive.toString());

    const queryString = query.toString();
    return this.request<SupplierData[]>(`/suppliers${queryString ? `?${queryString}` : ''}`, options);
  }

  async getSupplierById(id: string, options?: RequestInit) {
    return this.request<SupplierData>(`/suppliers/${id}`, options);
  }

  async createSupplier(data: CreateSupplierData, options?: RequestInit) {
    return this.request<SupplierData>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async updateSupplier(id: string, data: UpdateSupplierData, options?: RequestInit) {
    return this.request<SupplierData>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async deleteSupplier(id: string, options?: RequestInit) {
    return this.request(`/suppliers/${id}`, {
      method: 'DELETE',
      ...options,
    });
  }

  // Purchase Order API methods
  async getPurchaseOrders(params?: {
    status?: string;
    supplier?: string;
    product?: string;
    page?: number;
    limit?: number;
  }, options?: RequestInit) {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.supplier) query.append('supplier', params.supplier);
    if (params?.product) query.append('product', params.product);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const queryString = query.toString();
    return this.request<{
      data: PurchaseOrderData[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    }>(`/purchase-orders${queryString ? `?${queryString}` : ''}`, options);
  }

  async getPurchaseOrderById(id: string, options?: RequestInit) {
    return this.request<PurchaseOrderData>(`/purchase-orders/${id}`, options);
  }

  async createPurchaseOrder(data: CreatePurchaseOrderData, options?: RequestInit) {
    return this.request<PurchaseOrderData>('/purchase-orders', {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async updatePurchaseOrder(id: string, data: UpdatePurchaseOrderData, options?: RequestInit) {
    return this.request<PurchaseOrderData>(`/purchase-orders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
    });
  }

  async deletePurchaseOrder(id: string, options?: RequestInit) {
    return this.request(`/purchase-orders/${id}`, {
      method: 'DELETE',
      ...options,
    });
  }

  async getPurchaseOrderStats(options?: RequestInit) {
    return this.request<PurchaseOrderStatsData>('/purchase-orders/stats', options);
  }
}

// Export a default instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export types for use in components
export type {
  ApiResponse,
  SalesOrderData,
  CustomerData,
  CreateProductData,
  InventoryData,
  InventoryStatsData,
  InventorySummaryData,
  UserData,
  CreateUserData,
  UpdateUserData,
  ShopData,
  CreateShopData,
  SupplierData,
  CreateSupplierData,
  UpdateSupplierData,
  PurchaseOrderData,
  CreatePurchaseOrderData,
  UpdatePurchaseOrderData,
  PurchaseOrderStatsData
};
