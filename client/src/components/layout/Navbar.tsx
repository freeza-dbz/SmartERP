import React, { useState } from 'react';
import {
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  LogOut,
  User,
  Settings,
  Building2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Input } from '../ui/Input';

export function Navbar() {
  const { darkMode, toggleDarkMode, user, selectedCompany, setCurrentPage, setUser, setSelectedCompany } = useApp();
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'Payment received', message: 'INV-2024-001 paid by ABC Corp', time: '5 min ago', unread: true },
    { id: 2, title: 'Low stock alert', message: 'Product SKU-001 below reorder level', time: '1 hour ago', unread: true },
    { id: 3, title: 'GST filing reminder', message: 'GSTR-1 due in 3 days', time: '2 hours ago', unread: false },
  ];

  return (
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
                    onClick={() => {
                      setCurrentPage('company-selection');
                      setShowCompanyDropdown(false);
                    }}
                  >
                    Switch Company...
                  </button>
                  <button
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700"
                    onClick={() => {
                      setCurrentPage('create-company');
                      setShowCompanyDropdown(false);
                    }}
                  >
                    Create Company
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
        >
          <Bell className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          {notifications.filter(n => n.unread).length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full" />
          )}
        </button>

        {showNotifications && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowNotifications(false)} />
            <div className="absolute top-full right-16 mt-1 w-80 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-20">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100">Notifications</h3>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.map(n => (
                  <div
                    key={n.id}
                    className={`p-3 border-b border-slate-100 dark:border-slate-700 last:border-0 ${n.unread ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}
                  >
                    <p className="font-medium text-sm text-slate-900 dark:text-slate-100">{n.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{n.time}</p>
                  </div>
                ))}
              </div>
              <div className="p-2 border-t border-slate-200 dark:border-slate-700">
                <button className="w-full text-center text-sm text-primary-600 dark:text-primary-400 hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          </>
        )}

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

        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600 dark:text-primary-400" />
            </div>
            <div className="text-left">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">
                {user?.name || 'John Doe'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Administrator</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showUserDropdown && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowUserDropdown(false)} />
              <div className="absolute top-full right-0 mt-1 w-48 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-lg z-20">
                <div className="p-2">
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  <button className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200">
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  <hr className="my-2 border-slate-200 dark:border-slate-700" />
                  <button
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-slate-100 dark:hover:bg-slate-700 text-error-600 dark:text-error-400"
                    onClick={() => {
                      setUser(null);
                      setSelectedCompany(null);
                      localStorage.removeItem('token');
                      setCurrentPage('login');
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </nav>
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
