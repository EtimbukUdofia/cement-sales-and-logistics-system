export interface Supplier {
  id: string;
  name: string;
  location: string;
  phone: string;
  totalInventory: number;
  inventoryUnit: string;
  products: number;
  status: 'Available' | 'Unavailable';
}

export interface PurchaseOrder {
  transactionId: string;
  supplier: string;
  product: string;
  quantity: string;
  pricePerBag: string;
  total: string;
  status: 'Completed' | 'Pending' | 'Cancelled';
  date: string;
}

export const suppliers: Supplier[] = [
  {
    id: '1',
    name: 'Dangote Cement',
    location: 'Rail Terminal, Lagos',
    phone: '+234 - 8916 - 7686',
    totalInventory: 5,
    inventoryUnit: 'bags',
    products: 3,
    status: 'Available'
  },
  {
    id: '2',
    name: 'BUA Cement',
    location: 'Rail Terminal, Lagos',
    phone: '+234 - 8916 - 7686',
    totalInventory: 0,
    inventoryUnit: 'bags',
    products: 3,
    status: 'Available'
  },
  {
    id: '3',
    name: 'Lafarge Cement',
    location: 'Rail Terminal, Lagos',
    phone: '+234 - 8916 - 7686',
    totalInventory: 0,
    inventoryUnit: 'bags',
    products: 3,
    status: 'Available'
  },
  {
    id: '4',
    name: 'Mangal Cement',
    location: 'Rail Terminal, Lagos',
    phone: '+234 - 8916 - 7686',
    totalInventory: 0,
    inventoryUnit: 'bags',
    products: 3,
    status: 'Available'
  }
];

export const recentPurchaseOrders: PurchaseOrder[] = [
  {
    transactionId: '#TXN1001',
    supplier: 'Dangote Cement',
    product: 'Dangote 3X Cement',
    quantity: '6 bags',
    pricePerBag: '₦ 1000.05',
    total: '₦ 2000.05',
    status: 'Completed',
    date: '2025 - 8 - 12'
  },
  {
    transactionId: '#TXN1001',
    supplier: 'Dangote Cement',
    product: 'Dangote 3X',
    quantity: '8 bags',
    pricePerBag: '₦ 1000.05',
    total: '₦ 2000.05',
    status: 'Completed',
    date: '2025 - 8 - 12'
  }
];
