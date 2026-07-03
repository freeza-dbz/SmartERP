import React, { useState } from 'react';
import { Building2, Plus, Edit2, Trash2, MapPin, Calendar, FileText, MoreVertical } from 'lucide-react';
import { Card, CardContent, Button, Modal, Input, Select } from '../components/ui';
import { useApp } from '../context/AppContext';
import type { Company } from '../types';

const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'ABC Electronics Pvt Ltd',
    address: '123 Industrial Area, Sector 15',
    state: 'Maharashtra',
    gstNumber: '27AABCT1234M1Z5',
    financialYear: '2024-2025',
    contactNumber: '+91 98765 43210',
    email: 'accounts@abcelectronics.com',
  },
  {
    id: '2',
    name: 'XYZ Textiles Ltd',
    address: '45 Trade Center, MG Road',
    state: 'Gujarat',
    gstNumber: '24AABCX5678L1Z2',
    financialYear: '2024-2025',
    contactNumber: '+91 87654 32109',
    email: 'finance@xyztextiles.com',
  },
  {
    id: '3',
    name: 'Global Imports Exports',
    address: '78 Cargo Complex, Dock Road',
    state: 'Tamil Nadu',
    gstNumber: '33AABCG9012N1Z8',
    financialYear: '2024-2025',
    contactNumber: '+91 76543 21098',
    email: 'accounts@globalimports.com',
  },
];

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
];

export function CompanySelectionPage() {
  const { setSelectedCompany, setCurrentPage, addToast } = useApp();
  const [companies] = useState<Company[]>(mockCompanies);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleSelectCompany = (company: Company) => {
    setSelectedCompany(company);
    setCurrentPage('dashboard');
    addToast({ type: 'success', title: 'Company Selected', message: `Working on ${company.name}` });
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setShowCreateModal(true);
    setShowMenu(null);
  };

  const handleDeleteCompany = () => {
    addToast({ type: 'success', title: 'Company Deleted' });
    setConfirmDelete(null);
    setShowMenu(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">S</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-xl">SmartERP</span>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Company
          </Button>
        </div>
      </header>

      <main className="flex-1 py-8 px-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Select Company</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400">
              Choose a company to start working with <span className="kbd">F1</span>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map((company) => (
              <Card key={company.id} hoverable onClick={() => handleSelectCompany(company)}>
                <CardContent className="relative">
                  <div className="absolute top-4 right-4">
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(showMenu === company.id ? null : company.id);
                        }}
                        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <MoreVertical className="w-4 h-4 text-slate-400" />
                      </button>
                      {showMenu === company.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => { e.stopPropagation(); setShowMenu(null); }}
                          />
                          <div
                            className="absolute right-0 top-full mt-1 w-36 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-20"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                              onClick={() => handleEditCompany(company)}
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit
                            </button>
                            <button
                              className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600 text-error-600 dark:text-error-400"
                              onClick={() => setConfirmDelete(company.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="pr-8">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
                          {company.name}
                        </h3>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <MapPin className="w-4 h-4 flex-shrink-0" />
                        <span>{company.state}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <FileText className="w-4 h-4 flex-shrink-0" />
                        <span className="font-mono text-xs">{company.gstNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Calendar className="w-4 h-4 flex-shrink-0" />
                        <span>FY {company.financialYear}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Card
              hoverable
              onClick={() => setShowCreateModal(true)}
              className="flex items-center justify-center min-h-[180px]"
            >
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-slate-400 dark:text-slate-500" />
                </div>
                <p className="font-medium text-slate-600 dark:text-slate-400">Create New Company</p>
              </div>
            </Card>
          </div>
        </div>
      </main>

      <CompanyModal
        open={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingCompany(null);
        }}
        company={editingCompany}
        onSave={() => {
          addToast({
            type: 'success',
            title: editingCompany ? 'Company Updated' : 'Company Created',
          });
          setShowCreateModal(false);
          setEditingCompany(null);
        }}
      />

      <Modal
        open={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        title="Delete Company?"
        size="sm"
      >
        <p className="text-slate-600 dark:text-slate-300">
          Are you sure you want to delete this company? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={() => confirmDelete && handleDeleteCompany()}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}

interface CompanyModalProps {
  open: boolean;
  onClose: () => void;
  company: Company | null;
  onSave: (data: Partial<Company>) => void;
}

function CompanyModal({ open, onClose, company, onSave }: CompanyModalProps) {
  const [formData, setFormData] = useState({
    name: company?.name || '',
    address: company?.address || '',
    state: company?.state || '',
    gstNumber: company?.gstNumber || '',
    financialYear: company?.financialYear || '2024-2025',
    contactNumber: company?.contactNumber || '',
    email: company?.email || '',
  });

  React.useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        address: company.address,
        state: company.state,
        gstNumber: company.gstNumber,
        financialYear: company.financialYear,
        contactNumber: company.contactNumber,
        email: company.email,
      });
    } else {
      setFormData({
        name: '',
        address: '',
        state: '',
        gstNumber: '',
        financialYear: '2024-2025',
        contactNumber: '',
        email: '',
      });
    }
  }, [company, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={company ? 'Edit Company' : 'Create Company'}
      description={company ? 'Update company details' : 'Add a new company to your workspace'}
      size="lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company Name"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter company name"
        />
        <Select
          label="State"
          required
          value={formData.state}
          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
          options={indianStates.map(s => ({ value: s, label: s }))}
          placeholder="Select state"
        />
        <Input
          label="GST Number"
          required
          value={formData.gstNumber}
          onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
          placeholder="27AABCT1234M1Z5"
          hint="15-character GSTIN"
        />
        <Select
          label="Financial Year"
          required
          value={formData.financialYear}
          onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
          options={[
            { value: '2024-2025', label: '2024-2025' },
            { value: '2023-2024', label: '2023-2024' },
            { value: '2022-2023', label: '2022-2023' },
          ]}
        />
        <Input
          label="Contact Number"
          value={formData.contactNumber}
          onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
          placeholder="+91 98765 43210"
        />
        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="accounts@company.com"
        />
        <div className="md:col-span-2">
          <Input
            label="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Enter complete address"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={() => onSave(formData)}>
          {company ? 'Update Company' : 'Create Company'}
        </Button>
      </div>
    </Modal>
  );
}
