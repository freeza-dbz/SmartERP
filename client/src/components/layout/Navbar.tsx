import React, { useState } from 'react';
import {
  Search,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Building2,
  Mail,
  AtSign,
  Save,
  X,
  KeyRound,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

// ── Settings modal ────────────────────────────────────────────────────────────
function SettingsModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, setUser, addToast } = useApp();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Re-sync when user changes
  React.useEffect(() => {
    setFormData(f => ({
      ...f,
      fullName: user?.name || '',
      username: user?.username || '',
      email: user?.email || '',
    }));
  }, [user]);

  const handleSave = async () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      addToast({ type: 'error', title: 'Passwords do not match' });
      return;
    }
    if (formData.newPassword && formData.newPassword.length < 8) {
      addToast({ type: 'error', title: 'New password must be at least 8 characters' });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, string> = {};
      if (formData.fullName)      payload.fullName        = formData.fullName;
      if (formData.username)      payload.username        = formData.username;
      if (formData.email)         payload.email           = formData.email;
      if (formData.newPassword)   payload.newPassword     = formData.newPassword;
      if (formData.currentPassword) payload.currentPassword = formData.currentPassword;

      const token = localStorage.getItem('token');
      const res = await fetch('/api/v1/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Update failed');
      const updated = data.data?.user;
      if (updated) {
        setUser({ ...user!, name: updated.name, email: updated.email, username: updated.username });
        addToast({ type: 'success', title: 'Profile updated successfully!' });
      }
      onClose();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update failed', message: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" size="md">
      <div className="space-y-5">
        {/* Avatar preview */}
        <div className="flex items-center gap-4 pb-4 border-b border-slate-200 dark:border-slate-700">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-white text-xl font-bold">
              {(formData.fullName || user?.name || '?')[0].toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white">{formData.fullName || user?.name}</p>
            <p className="text-sm text-slate-500">{formData.email || user?.email}</p>
          </div>
        </div>

        {/* Profile fields */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              value={formData.fullName}
              onChange={e => setFormData({ ...formData, fullName: e.target.value })}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Username"
              value={formData.username}
              onChange={e => setFormData({ ...formData, username: e.target.value })}
              leftIcon={<AtSign className="w-4 h-4" />}
            />
          </div>
          <Input
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
            leftIcon={<Mail className="w-4 h-4" />}
          />
        </div>

        {/* Password change */}
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
            Change Password <span className="text-slate-400 font-normal normal-case">(leave blank to keep current)</span>
          </h3>
          <Input
            label="Current Password"
            type="password"
            value={formData.currentPassword}
            onChange={e => setFormData({ ...formData, currentPassword: e.target.value })}
            leftIcon={<KeyRound className="w-4 h-4" />}
            placeholder="Enter current password"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="New Password"
              type="password"
              value={formData.newPassword}
              onChange={e => setFormData({ ...formData, newPassword: e.target.value })}
              leftIcon={<KeyRound className="w-4 h-4" />}
              placeholder="Min 8 characters"
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={formData.confirmPassword}
              onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })}
              leftIcon={<KeyRound className="w-4 h-4" />}
              placeholder="Repeat new password"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose}>
            <X className="w-4 h-4 mr-2" /> Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

// ── Main Navbar ───────────────────────────────────────────────────────────────
export function Navbar() {
  const { darkMode, toggleDarkMode, user, selectedCompany, setCurrentPage, setUser, setSelectedCompany } = useApp();
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  return (
    <>
      <nav className="h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-64">
            <Input
              inputSize="sm"
              placeholder="Search... (Ctrl+K)"
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Company selector */}
          <div className="relative">
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <Building2 className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {selectedCompany?.name || 'Select Company'}
              </span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </button>
            {showCompanyDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowCompanyDropdown(false)} />
                <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-20">
                  <div className="p-2">
                    <button
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => { setCurrentPage('company-selection'); setShowCompanyDropdown(false); }}
                    >
                      Switch Company...
                    </button>
                    <button
                      className="w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => { setCurrentPage('create-company'); setShowCompanyDropdown(false); }}
                    >
                      Create Company
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
            )}
          </button>

          {/* User avatar and name (no click) */}
          <div className="relative flex items-center gap-2">
            {/* Avatar and name */}
            <div className="flex items-center gap-2 px-3 py-1.5">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center shadow">
                <span className="text-white text-sm font-bold">
                  {(user?.name || 'U')[0].toUpperCase()}
                </span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
              </div>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Settings modal rendered outside nav to avoid z-index issues */}
      <SettingsModal open={showSettingsModal} onClose={() => setShowSettingsModal(false)} />
    </>
  );
}

export function Breadcrumb({ items }: { items: { label: string; href?: string }[] }) {
  return (
    <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-4">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span>/</span>}
          {item.href ? (
            <a href={item.href} className="hover:text-primary-600 dark:hover:text-primary-400">
              {item.label}
            </a>
          ) : (
            <span className="text-slate-700 dark:text-slate-200 font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
