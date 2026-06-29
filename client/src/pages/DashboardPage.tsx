
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingBag,
  Users,
  Truck,
  Package,
  Receipt,
  Building2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, StatCard, Button } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';

const stats = [
  {
    title: "Today's Sales",
    value: 245670,
    prefix: '₹',
    icon: <DollarSign className="w-6 h-6" />,
    trend: { value: 12.5, isPositive: true },
    page: 'sales',
  },
  {
    title: "Today's Purchases",
    value: 156340,
    prefix: '₹',
    icon: <ShoppingBag className="w-6 h-6" />,
    trend: { value: 3.2, isPositive: false },
    page: 'purchases',
  },
  {
    title: 'Customers',
    value: 1248,
    icon: <Users className="w-6 h-6" />,
    trend: { value: 8.1, isPositive: true },
    page: 'customers',
  },
  {
    title: 'Suppliers',
    value: 342,
    icon: <Truck className="w-6 h-6" />,
    trend: { value: 2.5, isPositive: true },
    page: 'suppliers',
  },
  {
    title: 'Stock Items',
    value: 892,
    icon: <Package className="w-6 h-6" />,
    trend: { value: 5.3, isPositive: true },
    page: 'stock-items',
  },
  {
    title: 'Outstanding Receivables',
    value: 1842560,
    prefix: '₹',
    icon: <Receipt className="w-6 h-6" />,
    trend: { value: 1.8, isPositive: false },
    page: 'outstanding',
  },
  {
    title: 'Outstanding Payables',
    value: 892340,
    prefix: '₹',
    icon: <Building2 className="w-6 h-6" />,
    trend: { value: 4.2, isPositive: false },
    page: 'outstanding',
  },
];

const quickActions = [
  { label: 'New Customer', icon: <Users className="w-4 h-4" />, shortcut: 'Ctrl+C', page: 'customers' },
  { label: 'New Supplier', icon: <Truck className="w-4 h-4" />, shortcut: 'Ctrl+S', page: 'suppliers' },
  { label: 'Sales Voucher', icon: <Receipt className="w-4 h-4" />, shortcut: 'F8', page: 'sales' },
  { label: 'Purchase Voucher', icon: <ShoppingBag className="w-4 h-4" />, shortcut: 'F9', page: 'purchases' },
  { label: 'Stock Item', icon: <Package className="w-4 h-4" />, shortcut: 'Ctrl+I', page: 'stock-items' },
];

const recentSales = [
  { id: 'INV-2024-001', customer: 'ABC Corp', amount: 45600, date: '2024-01-15', status: 'confirmed' as const },
  { id: 'INV-2024-002', customer: 'XYZ Ltd', amount: 32400, date: '2024-01-15', status: 'confirmed' as const },
  { id: 'INV-2024-003', customer: 'Global Traders', amount: 28900, date: '2024-01-14', status: 'pending' as const },
  { id: 'INV-2024-004', customer: 'Sunrise Industries', amount: 19800, date: '2024-01-14', status: 'confirmed' as const },
  { id: 'INV-2024-005', customer: 'Tech Solutions', amount: 56200, date: '2024-01-13', status: 'confirmed' as const },
];

const recentPurchases = [
  { id: 'PO-2024-001', supplier: 'Prime Suppliers', amount: 78500, date: '2024-01-15', status: 'confirmed' as const },
  { id: 'PO-2024-002', supplier: 'Metro Distributors', amount: 45200, date: '2024-01-14', status: 'pending' as const },
  { id: 'PO-2024-003', supplier: 'Star Enterprises', amount: 33100, date: '2024-01-14', status: 'confirmed' as const },
];

const recentCustomers = [
  { name: 'New Age Industries', type: 'Customer', date: '2024-01-15' },
  { name: 'Mountain Traders', type: 'Customer', date: '2024-01-14' },
  { name: 'Coastal Exports', type: 'Customer', date: '2024-01-13' },
];

export function DashboardPage() {
  const { setCurrentPage, addToast, selectedCompany } = useApp();

  const handleQuickAction = (page: string) => {
    setCurrentPage(page);
    addToast({ type: 'info', title: 'Navigation', message: `Opening ${page}` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Gateway of SmartERP
          </h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            {selectedCompany?.name || 'Dashboard Overview'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-500 dark:text-slate-400">Financial Year</p>
          <p className="font-semibold text-slate-900 dark:text-white">
            {selectedCompany?.financialYear || '2024-2025'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-4">
        {stats.slice(0, 4).map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            prefix={stat.prefix}
            icon={stat.icon}
            trend={stat.trend}
            onClick={() => setCurrentPage(stat.page)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {stats.slice(4).map((stat) => (
          <StatCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            prefix={stat.prefix}
            icon={stat.icon}
            trend={stat.trend}
            onClick={() => setCurrentPage(stat.page)}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>Sales Overview</CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 text-success-500" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹ 45.2L</p>
                <p className="text-sm">This Month</p>
                <div className="flex justify-center gap-2 mt-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Week 1</p>
                    <div className="w-12 h-16 bg-success-200 rounded mt-1" style={{ height: '60%' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Week 2</p>
                    <div className="w-12 h-16 bg-success-300 rounded mt-1" style={{ height: '80%' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Week 3</p>
                    <div className="w-12 h-16 bg-success-400 rounded mt-1" style={{ height: '65%' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Week 4</p>
                    <div className="w-12 h-16 bg-success-500 rounded mt-1" style={{ height: '90%' }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Purchase Overview</CardHeader>
          <CardContent>
            <div className="h-48 flex items-center justify-center text-slate-400">
              <div className="text-center">
                <TrendingDown className="w-12 h-12 mx-auto mb-2 text-primary-500" />
                <p className="text-2xl font-bold text-slate-900 dark:text-white">₹ 28.6L</p>
                <p className="text-sm">This Month</p>
                <div className="flex justify-center gap-2 mt-4">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Week 1</p>
                    <div className="w-12 h-16 bg-primary-200 rounded mt-1" style={{ height: '50%' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Week 2</p>
                    <div className="w-12 h-16 bg-primary-300 rounded mt-1" style={{ height: '70%' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Week 3</p>
                    <div className="w-12 h-16 bg-primary-400 rounded mt-1" style={{ height: '60%' }} />
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Week 4</p>
                    <div className="w-12 h-16 bg-primary-500 rounded mt-1" style={{ height: '55%' }} />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Quick Actions</CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleQuickAction(action.page)}
                  className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400">
                      {action.icon}
                    </div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                      {action.label}
                    </span>
                  </div>
                  <span className="kbd">{action.shortcut}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader action={<Button size="sm" variant="ghost" onClick={() => setCurrentPage('sales')}>View All</Button>}>
            Recent Sales
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Voucher No</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Customer</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <td className="px-4 py-3 font-mono text-slate-900 dark:text-slate-100">{sale.id}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{sale.customer}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                      ₹ {sale.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={sale.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader action={<Button size="sm" variant="ghost">View All</Button>}>
            Recent Customers
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCustomers.map((customer, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Users className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">{customer.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{customer.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader action={<Button size="sm" variant="ghost" onClick={() => setCurrentPage('purchases')}>View All</Button>}>
            Recent Purchases
          </CardHeader>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Order No</th>
                  <th className="px-4 py-3 text-left font-medium text-slate-500 dark:text-slate-400">Supplier</th>
                  <th className="px-4 py-3 text-right font-medium text-slate-500 dark:text-slate-400">Amount</th>
                  <th className="px-4 py-3 text-center font-medium text-slate-500 dark:text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {recentPurchases.map((purchase) => (
                  <tr key={purchase.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                    <td className="px-4 py-3 font-mono text-slate-900 dark:text-slate-100">{purchase.id}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{purchase.supplier}</td>
                    <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white">
                      ₹ {purchase.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={purchase.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Stock Distribution</CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { category: 'Electronics', count: 245, color: 'bg-primary-500' },
                { category: 'Textiles', count: 189, color: 'bg-success-500' },
                { category: 'Hardware', count: 156, color: 'bg-warning-500' },
                { category: 'Stationery', count: 98, color: 'bg-error-500' },
                { category: 'Others', count: 204, color: 'bg-slate-400' },
              ].map((item) => (
                <div key={item.category}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 dark:text-slate-300">{item.category}</span>
                    <span className="font-medium text-slate-900 dark:text-white">{item.count}</span>
                  </div>
                  <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${(item.count / 245) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
