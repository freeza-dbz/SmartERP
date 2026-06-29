import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Phone, Mail, MapPin, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Modal, Input, Table } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import type { Customer } from '../types';

const mockCustomers: Customer[] = [
  { id: '1', name: 'ABC Corporation', email: 'accounts@abc.com', phone: '+91 98765 43210', address: 'Mumbai, Maharashtra', gstNumber: '27AABCC1234M1Z5', outstanding: 125000, createdAt: '2024-01-10' },
  { id: '2', name: 'XYZ Industries', email: 'finance@xyz.com', phone: '+91 87654 32109', address: 'Delhi', gstNumber: '07AABCX5678L1Z2', outstanding: 89000, createdAt: '2024-01-08' },
  { id: '3', name: 'Global Traders', email: 'sales@global.com', phone: '+91 76543 21098', address: 'Bangalore, Karnataka', gstNumber: '29AABCG9012N1Z8', outstanding: 45000, createdAt: '2024-01-05' },
  { id: '4', name: 'Sunrise Exports', email: 'exports@sunrise.com', phone: '+91 65432 10987', address: 'Chennai, Tamil Nadu', gstNumber: '33AABBS3456K1Z4', outstanding: 78500, createdAt: '2024-01-03' },
  { id: '5', name: 'Tech Solutions', email: 'billing@tech.com', phone: '+91 54321 09876', address: 'Pune, Maharashtra', gstNumber: '27AABBT7890T1Z3', outstanding: 156000, createdAt: '2024-01-01' },
];

export function CustomersPage() {
  const { addToast } = useApp();
  const [customers] = useState<Customer[]>(mockCustomers);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);

  const columns = [
    { key: 'name', header: 'Customer Name', sortable: true },
    { key: 'phone', header: 'Phone', render: (item: Customer) => (
      <span className="font-mono text-xs">{item.phone}</span>
    )},
    { key: 'gstNumber', header: 'GSTIN', render: (item: Customer) => (
      <span className="font-mono text-xs">{item.gstNumber}</span>
    )},
    { key: 'address', header: 'Location' },
    { key: 'outstanding', header: 'Outstanding', render: (item: Customer) => (
      <span className="font-medium">₹ {item.outstanding.toLocaleString('en-IN')}</span>
    )},
  ];

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setShowModal(true);
    setShowMenu(null);
  };

  const handleDelete = (id: string) => {
    addToast({ type: 'success', title: 'Customer deleted' });
    setShowMenu(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Customers</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage your customer database <span className="kbd">Ctrl+C</span>
          </p>
        </div>
        <Button onClick={() => { setEditingCustomer(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Customer
        </Button>
      </div>

      <Card>
        <CardContent>
          <Table
            columns={columns}
            data={customers}
            keyField="id"
            searchable
            searchPlaceholder="Search customers..."
            actions={(item) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(item)}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Trash2 className="w-4 h-4 text-error-400" />
                </button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <CustomerModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingCustomer(null); }}
        customer={editingCustomer}
        onSave={() => {
          addToast({ type: 'success', title: editingCustomer ? 'Customer updated' : 'Customer created' });
          setShowModal(false);
          setEditingCustomer(null);
        }}
      />
    </div>
  );
}

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: Customer | null;
  onSave: () => void;
}

function CustomerModal({ open, onClose, customer, onSave }: CustomerModalProps) {
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', address: '', gstNumber: '',
  });

  React.useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        gstNumber: customer.gstNumber || '',
      });
    } else {
      setFormData({ name: '', email: '', phone: '', address: '', gstNumber: '' });
    }
  }, [customer, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? 'Edit Customer' : 'New Customer'}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="Customer Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        <Input label="Phone" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
        <Input label="Email" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
        <Input label="GST Number" value={formData.gstNumber} onChange={e => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })} />
        <div className="md:col-span-2">
          <Input label="Address" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={onSave}>{customer ? 'Update' : 'Create'}</Button>
      </div>
    </Modal>
  );
}

export function SuppliersPage() {
  const { addToast } = useApp();

  const mockSuppliers = [
    { id: '1', name: 'Prime Suppliers', email: 'orders@prime.com', phone: '+91 99887 76655', outstanding: 234000 },
    { id: '2', name: 'Metro Distributors', email: 'sales@metro.com', phone: '+91 88776 65544', outstanding: 156000 },
    { id: '3', name: 'Star Enterprises', email: 'info@star.com', phone: '+91 77665 54433', outstanding: 89000 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Suppliers</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage your supplier network <span className="kbd">Ctrl+S</span>
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {mockSuppliers.map(supplier => (
          <Card key={supplier.id} hoverable>
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white">{supplier.name}</h3>
                  <div className="mt-2 space-y-1 text-sm text-slate-500">
                    <div className="flex items-center gap-2"><Phone className="w-4 h-4" />{supplier.phone}</div>
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4" />{supplier.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500">Outstanding</p>
                  <p className="font-semibold text-slate-900 dark:text-white">₹ {supplier.outstanding.toLocaleString('en-IN')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function StockItemsPage() {
  const { addToast } = useApp();

  const mockItems = [
    { id: '1', name: 'Laptop Dell Inspiron', sku: 'SKU-001', category: 'Electronics', quantity: 45, reorderLevel: 10, saleRate: 55000 },
    { id: '2', name: 'Wireless Mouse', sku: 'SKU-002', category: 'Electronics', quantity: 120, reorderLevel: 20, saleRate: 850 },
    { id: '3', name: 'USB Keyboard', sku: 'SKU-003', category: 'Electronics', quantity: 8, reorderLevel: 15, saleRate: 1200 },
    { id: '4', name: 'Monitor 24"', sku: 'SKU-004', category: 'Electronics', quantity: 32, reorderLevel: 10, saleRate: 12500 },
  ];

  const columns = [
    { key: 'name', header: 'Item Name', sortable: true },
    { key: 'sku', header: 'SKU', render: (item: typeof mockItems[0]) => <span className="font-mono text-xs">{item.sku}</span> },
    { key: 'category', header: 'Category' },
    { key: 'quantity', header: 'Stock', render: (item: typeof mockItems[0]) => (
      <span className={item.quantity <= item.reorderLevel ? 'text-error-600 font-medium' : ''}>
        {item.quantity}
      </span>
    )},
    { key: 'saleRate', header: 'Sale Rate', render: (item: typeof mockItems[0]) => <span>₹ {item.saleRate.toLocaleString('en-IN')}</span> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Stock Items</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Manage inventory and stock items <span className="kbd">Ctrl+I</span>
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Stock Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="text-center"><p className="text-2xl font-bold text-slate-900 dark:text-white">205</p><p className="text-sm text-slate-500">Total Items</p></CardContent></Card>
        <Card><CardContent className="text-center"><p className="text-2xl font-bold text-error-600">3</p><p className="text-sm text-slate-500">Low Stock</p></CardContent></Card>
        <Card><CardContent className="text-center"><p className="text-2xl font-bold text-success-600">189</p><p className="text-sm text-slate-500">In Stock</p></CardContent></Card>
        <Card><CardContent className="text-center"><p className="text-2xl font-bold text-slate-900 dark:text-white">13</p><p className="text-sm text-slate-500">Out of Stock</p></CardContent></Card>
      </div>

      <Card>
        <CardContent>
          <Table columns={columns} data={mockItems} keyField="id" searchable />
        </CardContent>
      </Card>
    </div>
  );
}
