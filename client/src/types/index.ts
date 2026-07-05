export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Company {
  _id?: string;
  id: string;
  name: string;
  address: string;
  state: string;
  gstNumber: string;
  financialYear: string;
  contactNumber: string;
  email: string;
  logo?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  outstanding: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  gstNumber?: string;
  outstanding: number;
  createdAt: string;
}

export interface StockItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  quantity: number;
  reorderLevel: number;
  purchaseRate: number;
  saleRate: number;
  gstRate: number;
}

export interface SalesVoucher {
  id: string;
  voucherNo: string;
  date: string;
  customerId: string;
  customerName: string;
  items: VoucherItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  status: 'draft' | 'confirmed' | 'cancelled';
}

export interface PurchaseVoucher {
  id: string;
  voucherNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  items: VoucherItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  status: 'draft' | 'confirmed' | 'cancelled';
}

export interface VoucherItem {
  itemId: string;
  itemName: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface DashboardStats {
  todaySales: number;
  todayPurchases: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalStockItems: number;
  outstandingReceivables: number;
  outstandingPayables: number;
}

export interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  children?: MenuItem[];
  path?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
}

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';
export type InputSize = 'sm' | 'md' | 'lg';
