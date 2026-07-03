import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Printer, FileText, Eye, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Modal, Input, Select, Table } from '../components/ui';
import { StatusBadge } from '../components/ui/Badge';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

const mockSales = [ // This can be made dynamic later
  { id: '1', voucherNo: 'INV-2024-001', date: '2024-01-15', customer: 'ABC Corp', items: 3, total: 45600, status: 'confirmed' as const },
  { id: '2', voucherNo: 'INV-2024-002', date: '2024-01-15', customer: 'XYZ Ltd', items: 2, total: 32400, status: 'confirmed' as const },
  { id: '3', voucherNo: 'INV-2024-003', date: '2024-01-14', customer: 'Global Traders', items: 5, total: 28900, status: 'draft' as const },
  { id: '4', voucherNo: 'INV-2024-004', date: '2024-01-14', customer: 'Sunrise Industries', items: 1, total: 19800, status: 'cancelled' as const },
  { id: '5', voucherNo: 'INV-2024-005', date: '2024-01-13', customer: 'Tech Solutions', items: 4, total: 56200, status: 'confirmed' as const },
];

export function SalesPage() {
  const { addToast, setCurrentPage } = useApp();
  const [showModal, setShowModal] = useState(false);

  const columns = [
    { key: 'voucherNo', header: 'Voucher No', sortable: true, render: (item: typeof mockSales[0]) => (
      <span className="font-mono text-primary-600 dark:text-primary-400">{item.voucherNo}</span>
    )},
    { key: 'date', header: 'Date', sortable: true },
    { key: 'customer', header: 'Customer', sortable: true },
    { key: 'items', header: 'Items' },
    { key: 'total', header: 'Total', render: (item: typeof mockSales[0]) => (
      <span className="font-medium">₹ {item.total.toLocaleString('en-IN')}</span>
    )},
    { key: 'status', header: 'Status', render: (item: typeof mockSales[0]) => (
      <StatusBadge status={item.status} />
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sales Vouchers</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Create and manage sales invoices <span className="kbd">F8</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print Register
          </Button>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Sales Voucher
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="text-center py-4"><p className="text-2xl font-bold text-slate-900 dark:text-white">156</p><p className="text-sm text-slate-500">This Month</p></CardContent></Card>
        <Card><CardContent className="text-center py-4"><p className="text-2xl font-bold text-success-600">142</p><p className="text-sm text-slate-500">Confirmed</p></CardContent></Card>
        <Card><CardContent className="text-center py-4"><p className="text-2xl font-bold text-warning-600">8</p><p className="text-sm text-slate-500">Draft</p></CardContent></Card>
        <Card><CardContent className="text-center py-4"><p className="text-2xl font-bold text-error-600">6</p><p className="text-sm text-slate-500">Cancelled</p></CardContent></Card>
      </div>

      <Card>
        <CardContent>
          <Table
            columns={columns}
            data={mockSales}
            keyField="id"
            searchable
            searchPlaceholder="Search by voucher no, customer..."
            onRowClick={(item) => addToast({ type: 'info', title: 'Opening', message: item.voucherNo })}
            actions={(item) => (
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="View">
                  <Eye className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit">
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Print">
                  <Printer className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <SalesVoucherModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={() => {
          addToast({ type: 'success', title: 'Sales voucher created' });
          setShowModal(false);
        }}
      />
    </div>
  );
}

interface SalesVoucherModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

function SalesVoucherModal({ open, onClose, onSave }: SalesVoucherModalProps) {
  const [formData, setFormData] = useState({
    customer: '',
    date: new Date().toISOString().split('T')[0],
    items: [{ name: '', quantity: 1, rate: 0 }],
  });

  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const gst = subtotal * 0.18;
  const total = subtotal + gst;

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, rate: 0 }],
    });
  };

  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setFormData({ ...formData, items: newItems });
  };

  return (
    <Modal open={open} onClose={onClose} title="New Sales Voucher" size="xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select
          label="Customer"
          required
          options={[
            { value: 'abc', label: 'ABC Corp' },
            { value: 'xyz', label: 'XYZ Ltd' },
            { value: 'global', label: 'Global Traders' },
          ]}
          value={formData.customer}
          onChange={e => setFormData({ ...formData, customer: e.target.value })}
        />
        <Input
          label="Date"
          type="date"
          required
          value={formData.date}
          onChange={e => setFormData({ ...formData, date: e.target.value })}
        />
        <Input
          label="Voucher No"
          value="INV-2024-006"
          disabled
          hint="Auto-generated"
        />
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Item</th>
              <th className="px-4 py-3 text-center font-medium text-slate-500 w-24">Qty</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500 w-32">Rate</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500 w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {formData.items.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2">
                  <Input
                    placeholder="Item name"
                    value={item.name}
                    onChange={e => updateItem(index, 'name', e.target.value)}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={e => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                  />
                </td>
                <td className="px-4 py-2">
                  <Input
                    type="number"
                    value={item.rate}
                    onChange={e => updateItem(index, 'rate', parseFloat(e.target.value) || 0)}
                  />
                </td>
                <td className="px-4 py-2 text-right font-medium">
                  ₹ {(item.quantity * item.rate).toLocaleString('en-IN')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <div className="w-64 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">Subtotal</span>
            <span>₹ {subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500">GST (18%)</span>
            <span>₹ {gst.toLocaleString('en-IN')}</span>
          </div>
          <hr className="border-slate-200 dark:border-slate-700" />
          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>₹ {total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button variant="outline">Save as Draft</Button>
        <Button onClick={onSave}>Confirm & Save</Button>
      </div>
    </Modal>
  );
}

export function PurchasesPage() {
  const { addToast, selectedCompany } = useApp();
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPurchases = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const response = await api.get(`/purchase-vouchers?companyId=${selectedCompany.id}`);
      setPurchases(response.data.data);
    } catch (error) {
      addToast({ type: 'error', title: 'Failed to fetch purchases' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [selectedCompany]);

  const columns = [
    { key: 'voucherNo', header: 'Voucher No', sortable: true, render: (item: any) => (
      <span className="font-mono text-primary-600 dark:text-primary-400">{item.voucherNo}</span>
    )},
    { key: 'date', header: 'Date', sortable: true, render: (item: any) => new Date(item.date).toLocaleDateString() },
    { key: 'supplier', header: 'Supplier', sortable: true, render: (item: any) => item.supplier.name },
    { key: 'items', header: 'Items', render: (item: any) => item.items.length },
    { key: 'totalAmount', header: 'Total', render: (item: any) => (
      <span className="font-medium">₹ {Number(item.totalAmount).toLocaleString('en-IN')}</span>
    )},
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Purchase Vouchers</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Create and manage purchase orders <span className="kbd">F9</span>
          </p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New Purchase Voucher
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="text-center py-4"><p className="text-2xl font-bold text-slate-900 dark:text-white">89</p><p className="text-sm text-slate-500">This Month</p></CardContent></Card>
        <Card><CardContent className="text-center py-4"><p className="text-2xl font-bold text-success-600">76</p><p className="text-sm text-slate-500">Confirmed</p></CardContent></Card>
        <Card><CardContent className="text-center py-4"><p className="text-2xl font-bold text-warning-600">10</p><p className="text-sm text-slate-500">Pending</p></CardContent></Card>
        <Card><CardContent className="text-center py-4"><p className="text-2xl font-bold text-error-600">3</p><p className="text-sm text-slate-500">Cancelled</p></CardContent></Card>
      </div>

      <Card>
        <CardContent>
          <Table columns={columns} data={purchases} keyField="id" searchable loading={loading} />
        </CardContent>
      </Card>

      <PurchaseVoucherModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onSave={() => {
          setShowModal(false);
          fetchPurchases(); // Refresh list after saving
        }}
      />
    </div>
  );
}

interface PurchaseVoucherModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

const initialItem = { itemId: '', quantity: 1, rate: 0, amount: 0 };
const initialFormData = {
  supplierId: '',
  date: new Date().toISOString().split('T')[0],
  voucherNo: '',
  items: [initialItem],
};

function PurchaseVoucherModal({ open, onClose, onSave }: PurchaseVoucherModalProps) {
  const { addToast, selectedCompany } = useApp();
  const [formData, setFormData] = useState(initialFormData);
  const [suppliers, setSuppliers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && selectedCompany) {
      const fetchData = async () => {
        try {
          const [suppliersRes, itemsRes] = await Promise.all([
            api.get(`/ledgers/fetchLedgers?companyId=${selectedCompany.id}&type=SUPPLIER`),
            api.get(`/stock-items?companyId=${selectedCompany.id}`)
          ]);
          setSuppliers(suppliersRes.data.data.map((s: any) => ({ value: s.id, label: s.name })));
          setStockItems(itemsRes.data.data.map((i: any) => ({ value: i.id, label: i.name, rate: i.purchasePrice })));
        } catch (error) {
          addToast({ type: 'error', title: 'Failed to load data for modal' });
        }
      };
      fetchData();
    }
  }, [open, selectedCompany, addToast]);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    const item = { ...newItems[index], [field]: value };

    if (field === 'itemId') {
      const selectedStockItem = stockItems.find((si: any) => si.value === value);
      if (selectedStockItem) {
        item.rate = (selectedStockItem as any).rate;
      }
    }

    item.amount = item.quantity * item.rate;
    newItems[index] = item;
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { ...initialItem }] });
  const removeItem = (index: number) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);

  const handleSave = async () => {
    if (!selectedCompany || !formData.supplierId || !formData.voucherNo || formData.items.some(i => !i.itemId)) {
      addToast({ type: 'error', title: 'Please fill all required fields.' });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        companyId: selectedCompany.id,
        supplierId: parseInt(formData.supplierId),
        totalAmount,
        items: formData.items.map(item => ({
          itemId: parseInt(item.itemId),
          quantity: parseFloat(String(item.quantity)),
          rate: parseFloat(String(item.rate)),
        })),
      };
      await api.post('/purchase-vouchers', payload);
      addToast({ type: 'success', title: 'Purchase voucher created' });
      onSave();
      setFormData(initialFormData);
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed to save purchase voucher', message: error.response?.data?.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Purchase Voucher" size="2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select label="Supplier" required options={suppliers} value={formData.supplierId} onChange={e => setFormData({ ...formData, supplierId: e.target.value })} />
        <Input label="Date" type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
        <Input label="Voucher No" required value={formData.voucherNo} onChange={e => setFormData({ ...formData, voucherNo: e.target.value })} />
      </div>

      <div className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-slate-500">Item</th>
              <th className="px-4 py-3 text-center font-medium text-slate-500 w-24">Qty</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500 w-32">Rate</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500 w-32">Amount</th>
              <th className="w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {formData.items.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-2"><Select placeholder="Select Item" options={stockItems} value={item.itemId} onChange={e => handleItemChange(index, 'itemId', parseInt(e.target.value))} /></td>
                <td className="px-4 py-2"><Input type="number" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} /></td>
                <td className="px-4 py-2"><Input type="number" value={item.rate} onChange={e => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)} /></td>
                <td className="px-4 py-2 text-right font-medium">₹ {item.amount.toLocaleString('en-IN')}</td>
                <td className="px-4 py-2 text-center"><Button variant="ghost" size="icon" onClick={() => removeItem(index)} disabled={formData.items.length <= 1}><Trash2 className="w-4 h-4 text-error-500" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-2 border-t border-slate-200 dark:border-slate-700"><Button variant="ghost" size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> Add Item</Button></div>
      </div>

      <div className="mt-4 flex justify-end"><div className="w-64 space-y-2"><div className="flex justify-between font-bold"><span>Total</span><span>₹ {totalAmount.toLocaleString('en-IN')}</span></div></div></div>
      <div className="flex justify-end gap-3 mt-6"><Button variant="secondary" onClick={onClose}>Cancel</Button><Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Confirm & Save'}</Button></div>
    </Modal>
  );
}

export function ReceiptsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Receipts</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Record receipts from customers <span className="kbd">Ctrl+R</span>
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Receipt
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="text-center py-6"><p className="text-3xl font-bold text-success-600">₹ 12.5L</p><p className="text-sm text-slate-500 mt-1">This Month</p></CardContent></Card>
        <Card><CardContent className="text-center py-6"><p className="text-3xl font-bold text-slate-900 dark:text-white">45</p><p className="text-sm text-slate-500 mt-1">Transactions</p></CardContent></Card>
        <Card><CardContent className="text-center py-6"><p className="text-3xl font-bold text-warning-600">₹ 18.4L</p><p className="text-sm text-slate-500 mt-1">Outstanding</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>Recent Receipts</CardHeader>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Receipt No</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Date</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Customer</th>
                <th className="px-4 py-3 text-left font-medium text-slate-500">Mode</th>
                <th className="px-4 py-3 text-right font-medium text-slate-500">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {[
                { no: 'RCT-001', date: '2024-01-15', customer: 'ABC Corp', mode: 'Bank Transfer', amount: 50000 },
                { no: 'RCT-002', date: '2024-01-15', customer: 'XYZ Ltd', mode: 'Cash', amount: 25000 },
                { no: 'RCT-003', date: '2024-01-14', customer: 'Global Traders', mode: 'Cheque', amount: 35000 },
              ].map(r => (
                <tr key={r.no} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                  <td className="px-4 py-3 font-mono text-primary-600">{r.no}</td>
                  <td className="px-4 py-3">{r.date}</td>
                  <td className="px-4 py-3">{r.customer}</td>
                  <td className="px-4 py-3">{r.mode}</td>
                  <td className="px-4 py-3 text-right font-medium">₹ {r.amount.toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

export function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payments</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Record payments to suppliers <span className="kbd">Ctrl+P</span>
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Payment
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card><CardContent className="text-center py-6"><p className="text-3xl font-bold text-error-600">₹ 8.2L</p><p className="text-sm text-slate-500 mt-1">This Month</p></CardContent></Card>
        <Card><CardContent className="text-center py-6"><p className="text-3xl font-bold text-slate-900 dark:text-white">32</p><p className="text-sm text-slate-500 mt-1">Transactions</p></CardContent></Card>
        <Card><CardContent className="text-center py-6"><p className="text-3xl font-bold text-warning-600">₹ 8.9L</p><p className="text-sm text-slate-500 mt-1">Outstanding</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader>Recent Payments</CardHeader>
        <CardContent>
          <p className="text-slate-500 text-center py-8">No recent payments</p>
        </CardContent>
      </Card>
    </div>
  );
}
