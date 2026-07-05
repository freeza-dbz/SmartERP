import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Printer, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, Button, Modal, Input, Select, Table } from '../components/ui';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

export function SalesPage() {
  const { addToast, selectedCompany } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSales = async () => {
    if (!selectedCompany) return;
    setLoading(true);
    try {
      const response = await api.get(`/sales-vouchers?companyId=${selectedCompany._id || selectedCompany.id}`);
      setSales(response.data.data);
    } catch {
      addToast({ type: 'error', title: 'Failed to fetch sales' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCompany]);

  const columns = [
    { key: 'invoiceNo', header: 'Voucher No', sortable: true, render: (item: any) => (
      <span className="font-mono text-primary-600 dark:text-primary-400">{item.invoiceNo}</span>
    )},
    { key: 'invoiceDate', header: 'Date', sortable: true, render: (item: any) => new Date(item.invoiceDate).toLocaleDateString() },
    { key: 'customer', header: 'Customer', sortable: true, render: (item: any) => item.customer.name },
    { key: 'items', header: 'Items', render: (item: any) => item.items.length },
    { key: 'totalAmount', header: 'Total', render: (item: any) => (
      <span className="font-medium">₹ {Number(item.totalAmount).toLocaleString('en-IN')}</span>
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
            data={sales}
            keyField="id"
            searchable
            loading={loading}
            searchPlaceholder="Search by voucher no, customer..."
            onRowClick={(item) => addToast({ type: 'info', title: 'Opening', message: item.voucherNo })}
            actions={(item: any) => (
              <div className="flex items-center gap-1">
                <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="View">
                  <Eye className="w-4 h-4 text-slate-400" />
                </button>
                <button className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Edit">
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(`/api/v1/sales-vouchers/${item.id}/pdf`, '_blank');
                  }}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700" title="Print"
                >
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
          setShowModal(false);
          fetchSales();
        }}
      />
    </div>
  );
}

const initialSalesItem = { itemId: '', quantity: 1, rate: 0, amount: 0 };
const initialSalesFormData = {
  customerId: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  invoiceNo: '',
  items: [initialSalesItem],
};

interface SalesVoucherModalProps {
  open: boolean;
  onClose: () => void;
  onSave: () => void;
}

function SalesVoucherModal({ open, onClose, onSave }: SalesVoucherModalProps) {
  const { addToast, selectedCompany } = useApp();
  const [formData, setFormData] = useState(initialSalesFormData);
  const [customers, setCustomers] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && selectedCompany) {
      const fetchData = async () => {
        try {
          const [customersRes, itemsRes] = await Promise.all([
            api.get(`/ledgers/fetchLedgers?companyId=${selectedCompany._id || selectedCompany.id}&type=CUSTOMER`),
            api.get(`/stock-items?companyId=${selectedCompany._id || selectedCompany.id}`)
          ]);
          setCustomers(customersRes.data.data.map((c: any) => ({ value: c.id, label: c.name })));
          setStockItems(itemsRes.data.data.map((i: any) => ({ value: i.id, label: i.name, rate: i.sellingPrice })));
        } catch {
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

  const addItem = () => setFormData({ ...formData, items: [...formData.items, { ...initialSalesItem }] });
  const removeItem = (index: number) => setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });

  const totalAmount = formData.items.reduce((sum, item) => sum + item.amount, 0);

  const handleSave = async () => {
    if (!selectedCompany || !formData.customerId || !formData.invoiceNo || formData.items.some(i => !i.itemId)) {
      addToast({ type: 'error', title: 'Please fill all required fields.' });
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        companyId: selectedCompany._id || selectedCompany.id,
        customerId: parseInt(formData.customerId),
        totalAmount,
        items: formData.items.map(item => ({
          itemId: parseInt(item.itemId),
          quantity: parseFloat(String(item.quantity)),
          rate: parseFloat(String(item.rate)),
        })),
      };
      await api.post('/sales-vouchers', payload);
      addToast({ type: 'success', title: 'Sales voucher created' });
      onSave();
      setFormData(initialSalesFormData);
    } catch (error: any) {
      addToast({ type: 'error', title: 'Failed to save sales voucher', message: error.response?.data?.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="New Sales Voucher" size="2xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Select label="Customer" required options={customers} value={formData.customerId} onChange={e => setFormData({ ...formData, customerId: e.target.value })} />
        <Input label="Date" type="date" required value={formData.invoiceDate} onChange={e => setFormData({ ...formData, invoiceDate: e.target.value })} />
        <Input label="Invoice No" required value={formData.invoiceNo} onChange={e => setFormData({ ...formData, invoiceNo: e.target.value })} />
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
        <div className="p-2 border-t border-slate-200 dark:border-slate-700">
          <Button variant="ghost" size="sm" onClick={addItem}>
            <Plus className="w-4 h-4 mr-1" /> Add Item
          </Button>
        </div>
      </div>

      <div className="mt-4 flex justify-end"><div className="w-64 space-y-2"><div className="flex justify-between font-bold"><span>Total</span><span>₹ {totalAmount.toLocaleString('en-IN')}</span></div></div></div>

      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Confirm & Save'}</Button>
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
      const response = await api.get(`/purchase-vouchers?companyId=${selectedCompany._id || selectedCompany.id}`);
      setPurchases(response.data.data);
    } catch {
      addToast({ type: 'error', title: 'Failed to fetch purchases' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
            api.get(`/ledgers/fetchLedgers?companyId=${selectedCompany._id || selectedCompany.id}&type=SUPPLIER`),
            api.get(`/stock-items?companyId=${selectedCompany._id || selectedCompany.id}`)
          ]);
          setSuppliers(suppliersRes.data.data.map((s: any) => ({ value: s.id, label: s.name })));
          setStockItems(itemsRes.data.data.map((i: any) => ({ value: i.id, label: i.name, rate: i.purchasePrice })));
        } catch {
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
        companyId: selectedCompany._id || selectedCompany.id,
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
