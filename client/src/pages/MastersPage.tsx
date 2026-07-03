import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Card, CardContent, Button, Modal, Input, Table, Select } from '../components/ui';
import { useApp } from '../context/AppContext';

// Define types for API responses based on your Prisma schema
interface Ledger {
  id: number;
  name: string;
  type: 'CUSTOMER' | 'SUPPLIER' | 'BANK' | 'CASH' | 'ASSET' | 'LIABILITY' | 'INCOME' | 'EXPENSE';
  openingBalance: number;
  currentBalance: number; // This will be used for 'outstanding'
  companyId: number;
}

interface Unit {
  id: number;
  name: string;
  shortName: string;
  companyId: number;
}

interface StockGroup {
  id: number;
  name: string;
  parentId?: number;
  companyId: number;
  children?: StockGroup[]; // For hierarchical display
}

interface StockItem {
  id: number;
  name: string;
  sku?: string;
  purchasePrice: number;
  sellingPrice: number;
  gstRate: number; // Stored as whole number, e.g., 18 for 18%
  openingStock: number;
  currentStock: number;
  unitId: number;
  unit: Unit; // Relation included
  groupId: number;
  stockGroup: StockGroup; // Relation included
  companyId: number;
}

export function CustomersPage() {
  const { addToast, selectedCompany } = useApp();
  const companyId = selectedCompany ? parseInt(selectedCompany.id) : 1;
  const token = 'mock-token';
  const [customers, setCustomers] = useState<Ledger[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Ledger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    if (!token || !companyId) {
      setError('Authentication token or company ID missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/ledgers?type=CUSTOMER&companyId=${companyId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCustomers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch customers');
      }
    } catch (err: any) {
      setError(err.message);
      addToast({ type: 'error', title: 'Error fetching customers', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [token, companyId, addToast]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p className="text-error-600">Error: {error}</p>;

  const columns: any[] = [
    { key: 'name', header: 'Customer Name', sortable: true },
    { key: 'currentBalance', header: 'Outstanding', render: (item: Ledger) => (
      <span className="font-medium">₹ {item.currentBalance.toLocaleString('en-IN')}</span>
    )},
  ];

  const handleEdit = (customer: Ledger) => {
    setEditingCustomer(customer);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    addToast({ type: 'success', title: 'Customer deleted', message: `Customer ID: ${id}` });
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
          <Table<any>
            columns={columns}
            data={customers}
            keyField="id"
            searchable
            searchPlaceholder="Search customers..."
            actions={(item) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(item as Ledger)}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => handleDelete(item.id.toString())}
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
        onSave={async (formData) => {
          if (!token || !companyId) {
            addToast({ type: 'error', title: 'Authentication error', message: 'Please log in again.' });
            return;
          }

          const payload = {
            name: formData.name,
            openingBalance: parseFloat(formData.openingBalance),
            type: 'CUSTOMER',
            companyId: companyId,
          };

          try {
            const method = editingCustomer ? 'PUT' : 'POST';
            const url = editingCustomer ? `/api/v1/ledgers/${editingCustomer.id}` : '/api/v1/ledgers';
            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok) {
              addToast({ type: 'success', title: editingCustomer ? 'Customer updated' : 'Customer created' });
              fetchCustomers(); // Refresh the list
            } else {
              throw new Error(data.message || 'Failed to save customer');
            }
          } catch (err: any) {
            addToast({ type: 'error', title: 'Error saving customer', message: err.message });
          } finally {
            setShowModal(false);
            setEditingCustomer(null);
          }
        }}
      />
    </div>
  );
}

interface CustomerModalProps {
  open: boolean;
  onClose: () => void;
  customer: Ledger | null;
  onSave: (formData: { name: string; openingBalance: string; }) => Promise<void>;
}

function CustomerModal({ open, onClose, customer, onSave }: CustomerModalProps) {
  const [formData, setFormData] = useState({ name: '', openingBalance: '0' });

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name,
        openingBalance: customer.openingBalance.toString(),
      });
    } else {
      setFormData({ name: '', openingBalance: '0' });
    }
  }, [customer, open]);

  const handleSubmit = async () => {
    await onSave(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={customer ? 'Edit Customer' : 'New Customer'}
      size="lg"
    >
      <div className="grid grid-cols-1 gap-4">
        <Input label="Customer Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        <Input label="Opening Balance" type="number" value={formData.openingBalance} onChange={e => setFormData({ ...formData, openingBalance: e.target.value })} />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{customer ? 'Update' : 'Create'}</Button>
      </div>
    </Modal>
  );
}

export function SuppliersPage() {
  const { addToast, selectedCompany } = useApp();
  const companyId = selectedCompany ? parseInt(selectedCompany.id) : 1;
  const token = 'mock-token';
  const [suppliers, setSuppliers] = useState<Ledger[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Ledger | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async () => {
    if (!token || !companyId) {
      setError('Authentication token or company ID missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/ledgers?type=SUPPLIER&companyId=${companyId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSuppliers(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch suppliers');
      }
    } catch (err: any) {
      setError(err.message);
      addToast({ type: 'error', title: 'Error fetching suppliers', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [token, companyId, addToast]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  if (loading) return <p>Loading suppliers...</p>;
  if (error) return <p className="text-error-600">Error: {error}</p>;

  const handleEdit = (supplier: Ledger) => {
    setEditingSupplier(supplier);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    addToast({ type: 'success', title: 'Supplier deleted', message: `Supplier ID: ${id}` });
  };

  const columns: any[] = [
    { key: 'name', header: 'Supplier Name', sortable: true },
    { key: 'currentBalance', header: 'Outstanding', render: (item: Ledger) => (
      <span className="font-medium">₹ {item.currentBalance.toLocaleString('en-IN')}</span>
    )},
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
        <Button onClick={() => { setEditingSupplier(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Supplier
        </Button>
      </div>

      <Card>
        <CardContent>
          <Table<any>
            columns={columns}
            data={suppliers}
            keyField="id"
            searchable
            searchPlaceholder="Search suppliers..."
            actions={(item) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleEdit(item as Ledger)}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
                <button
                  onClick={() => handleDelete(item.id.toString())}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Trash2 className="w-4 h-4 text-error-400" />
                </button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <SupplierModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingSupplier(null); }}
        supplier={editingSupplier}
        onSave={async (formData) => {
          if (!token || !companyId) {
            addToast({ type: 'error', title: 'Authentication error', message: 'Please log in again.' });
            return;
          }

          const payload = {
            name: formData.name,
            openingBalance: parseFloat(formData.openingBalance),
            type: 'SUPPLIER',
            companyId: companyId,
          };

          try {
            const method = editingSupplier ? 'PUT' : 'POST';
            const url = editingSupplier ? `/api/v1/ledgers/${editingSupplier.id}` : '/api/v1/ledgers';
            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok) {
              addToast({ type: 'success', title: editingSupplier ? 'Supplier updated' : 'Supplier created' });
              fetchSuppliers(); // Refresh the list
            } else {
              throw new Error(data.message || 'Failed to save supplier');
            }
          } catch (err: any) {
            addToast({ type: 'error', title: 'Error saving supplier', message: err.message });
          } finally {
            setShowModal(false);
            setEditingSupplier(null);
          }
        }}
      />
    </div>
  );
}

interface SupplierModalProps {
  open: boolean;
  onClose: () => void;
  supplier: Ledger | null;
  onSave: (formData: { name: string; openingBalance: string; }) => Promise<void>;
}

function SupplierModal({ open, onClose, supplier, onSave }: SupplierModalProps) {
  const [formData, setFormData] = useState({
    name: '', openingBalance: '0',
  });

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        openingBalance: supplier.openingBalance.toString(),
      });
    } else {
      setFormData({ name: '', openingBalance: '0' });
    }
  }, [supplier, open]);

  const handleSubmit = async () => {
    await onSave(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={supplier ? 'Edit Supplier' : 'New Supplier'}
      size="lg"
    >
      <div className="grid grid-cols-1 gap-4">
        <Input label="Supplier Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
        <Input label="Opening Balance" type="number" value={formData.openingBalance} onChange={e => setFormData({ ...formData, openingBalance: e.target.value })} />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{supplier ? 'Update' : 'Create'}</Button>
      </div>
    </Modal>
  );
}

export function StockItemsPage() {
  const { addToast, selectedCompany } = useApp();
  const companyId = selectedCompany ? parseInt(selectedCompany.id) : 1;
  const token = 'mock-token';
  const [stockItems, setStockItems] = useState<StockItem[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [stockGroups, setStockGroups] = useState<StockGroup[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<StockItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockItems = useCallback(async () => {
    if (!token || !companyId) {
      setError('Authentication token or company ID missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/items?companyId=${companyId}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setStockItems(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch stock items');
      }
    } catch (err: any) {
      setError(err.message);
      addToast({ type: 'error', title: 'Error fetching stock items', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [token, companyId, addToast]);

  const fetchDependencies = useCallback(async () => {
    if (!token || !companyId) return;
    try {
      const [unitsRes, groupsRes] = await Promise.all([
        fetch(`/api/v1/units?companyId=${companyId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`/api/v1/stock-groups?companyId=${companyId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
      ]);

      const unitsData = await unitsRes.json();
      const groupsData = await groupsRes.json();

      if (unitsRes.ok) setUnits(unitsData.data);
      else throw new Error(unitsData.message || 'Failed to fetch units');

      if (groupsRes.ok) setStockGroups(groupsData.data);
      else throw new Error(groupsData.message || 'Failed to fetch stock groups');

    } catch (err: any) {
      addToast({ type: 'error', title: 'Error fetching dependencies', message: err.message });
    }
  }, [token, companyId, addToast]);

  useEffect(() => {
    fetchStockItems();
    fetchDependencies();
  }, [fetchStockItems, fetchDependencies]);

  if (loading) return <p>Loading stock items...</p>;
  if (error) return <p className="text-error-600">Error: {error}</p>;

  const columns: any[] = [
    { key: 'name', header: 'Item Name', sortable: true },
    { key: 'sku', header: 'SKU', render: (item: StockItem) => <span className="font-mono text-xs">{item.sku}</span> },
    { key: 'stockGroup.name', header: 'Group', render: (item: StockItem) => item.stockGroup?.name || 'N/A' },
    { key: 'unit.shortName', header: 'Unit', render: (item: StockItem) => item.unit?.shortName || 'N/A' },
    { key: 'currentStock', header: 'Stock', render: (item: StockItem) => (
      <span className={item.currentStock <= item.openingStock / 2 ? 'text-error-600 font-medium' : ''}> {/* Example low stock logic */}
        {item.currentStock}
      </span>
    )},
    { key: 'sellingPrice', header: 'Sale Rate', render: (item: StockItem) => <span>₹ {item.sellingPrice.toLocaleString('en-IN')}</span> },
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
        <Button onClick={() => { setEditingItem(null); setShowModal(true); }}>
          <Plus className="w-4 h-4 mr-2" />
          New Stock Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card><CardContent className="text-center"><p className="text-2xl font-bold text-slate-900 dark:text-white">{stockItems.length}</p><p className="text-sm text-slate-500">Total Items</p></CardContent></Card>
        <Card><CardContent className="text-center"><p className="text-2xl font-bold text-error-600">{stockItems.filter(item => item.currentStock <= item.openingStock / 2).length}</p><p className="text-sm text-slate-500">Low Stock</p></CardContent></Card>
        <Card><CardContent className="text-center"><p className="text-2xl font-bold text-success-600">{stockItems.filter(item => item.currentStock > 0).length}</p><p className="text-sm text-slate-500">In Stock</p></CardContent></Card>
        <Card><CardContent className="text-center"><p className="text-2xl font-bold text-slate-900 dark:text-white">{stockItems.filter(item => item.currentStock === 0).length}</p><p className="text-sm text-slate-500">Out of Stock</p></CardContent></Card>
      </div>

      <Card>
        <CardContent>
          <Table<any>
            columns={columns}
            data={stockItems}
            keyField="id"
            searchable
            actions={(item) => (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setEditingItem(item as StockItem);
                    setShowModal(true);
                  }}
                  className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Edit2 className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            )}
          />
        </CardContent>
      </Card>

      <StockItemModal
        open={showModal}
        onClose={() => { setShowModal(false); setEditingItem(null); }}
        item={editingItem}
        units={units}
        stockGroups={stockGroups}
        onSave={async (formData) => {
          if (!token || !companyId) {
            addToast({ type: 'error', title: 'Authentication error', message: 'Please log in again.' });
            return;
          }

          const payload = {
            name: formData.name,
            sku: formData.sku || null,
            purchasePrice: parseFloat(formData.purchasePrice) || 0,
            sellingPrice: parseFloat(formData.sellingPrice) || 0,
            gstRate: parseFloat(formData.gstRate) || 0,
            openingStock: parseFloat(formData.openingStock) || 0,
            unitId: parseInt(formData.unitId),
            groupId: parseInt(formData.groupId),
            companyId: companyId,
          };

          try {
            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `/api/v1/items/${editingItem.id}` : '/api/v1/items';
            const response = await fetch(url, {
              method,
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify(payload),
            });
            const data = await response.json();
            if (response.ok) {
              addToast({ type: 'success', title: editingItem ? 'Stock item updated' : 'Stock item created' });
              fetchStockItems(); // Refresh the list
            } else {
              throw new Error(data.message || 'Failed to save stock item');
            }
          } catch (err: any) {
            addToast({ type: 'error', title: 'Error saving stock item', message: err.message });
          } finally {
            setShowModal(false);
            setEditingItem(null);
          }
        }}
      />
    </div>
  );
}

interface StockItemModalProps {
  open: boolean;
  onClose: () => void;
  item: StockItem | null;
  units: Unit[];
  stockGroups: StockGroup[];
  onSave: (formData: {
    name: string;
    sku: string;
    purchasePrice: string;
    sellingPrice: string;
    gstRate: string;
    openingStock: string;
    unitId: string;
    groupId: string;
  }) => Promise<void>;
}

function StockItemModal({ open, onClose, item, units, stockGroups, onSave }: StockItemModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    purchasePrice: '0',
    sellingPrice: '0',
    gstRate: '18',
    openingStock: '0',
    unitId: '',
    groupId: '',
  });

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        sku: item.sku || '',
        purchasePrice: item.purchasePrice.toString(),
        sellingPrice: item.sellingPrice.toString(),
        gstRate: item.gstRate.toString(),
        openingStock: item.openingStock.toString(),
        unitId: item.unitId.toString(),
        groupId: item.groupId.toString(),
      });
    } else {
      setFormData({
        name: '',
        sku: '',
        purchasePrice: '0',
        sellingPrice: '0',
        gstRate: '18',
        openingStock: '0',
        unitId: units[0]?.id.toString() || '',
        groupId: stockGroups[0]?.id.toString() || '',
      });
    }
  }, [item, open, units, stockGroups]);

  const handleSubmit = async () => {
    await onSave(formData);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={item ? 'Edit Stock Item' : 'New Stock Item'}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Item Name"
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          label="SKU"
          value={formData.sku}
          onChange={e => setFormData({ ...formData, sku: e.target.value })}
        />
        <Input
          label="Purchase Price"
          type="number"
          required
          value={formData.purchasePrice}
          onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
        />
        <Input
          label="Selling Price"
          type="number"
          required
          value={formData.sellingPrice}
          onChange={e => setFormData({ ...formData, sellingPrice: e.target.value })}
        />
        <Input
          label="GST Rate (%)"
          type="number"
          required
          value={formData.gstRate}
          onChange={e => setFormData({ ...formData, gstRate: e.target.value })}
        />
        <Input
          label="Opening Stock"
          type="number"
          required
          value={formData.openingStock}
          onChange={e => setFormData({ ...formData, openingStock: e.target.value })}
        />
        <Select
          label="Unit"
          required
          value={formData.unitId}
          onChange={e => setFormData({ ...formData, unitId: e.target.value })}
          options={units.map(u => ({ value: u.id.toString(), label: `${u.name} (${u.shortName})` }))}
        />
        <Select
          label="Stock Group"
          required
          value={formData.groupId}
          onChange={e => setFormData({ ...formData, groupId: e.target.value })}
          options={stockGroups.map(g => ({ value: g.id.toString(), label: g.name }))}
        />
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit}>{item ? 'Update' : 'Create'}</Button>
      </div>
    </Modal>
  );
}
