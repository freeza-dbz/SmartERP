import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Receipt,
  Package,
  Calculator,
  Building2,
  FileText,
  ClipboardList,
  Settings,
  ChevronDown,
  Menu,
  Keyboard,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, shortcut: 'F1' },
  {
    id: 'masters',
    label: 'Masters',
    icon: Users,
    shortcut: 'F2',
    children: [
      { id: 'customers', label: 'Customers', shortcut: 'Ctrl+C' },
      { id: 'suppliers', label: 'Suppliers', shortcut: 'Ctrl+S' },
      { id: 'ledgers', label: 'Ledgers', shortcut: 'Ctrl+L' },
      { id: 'stock-items', label: 'Stock Items', shortcut: 'Ctrl+I' },
      { id: 'stock-groups', label: 'Stock Groups', shortcut: '' },
    ],
  },
  {
    id: 'transactions',
    label: 'Transactions',
    icon: Receipt,
    shortcut: 'F3',
    children: [
      { id: 'sales', label: 'Sales Vouchers', shortcut: 'F8' },
      { id: 'purchases', label: 'Purchase Vouchers', shortcut: 'F9' },
      { id: 'receipts', label: 'Receipts', shortcut: 'Ctrl+R' },
      { id: 'payments', label: 'Payments', shortcut: 'Ctrl+P' },
      { id: 'journals', label: 'Journal Entries', shortcut: 'Ctrl+J' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Package,
    shortcut: 'F4',
    children: [
      { id: 'stock-summary', label: 'Stock Summary' },
      { id: 'stock-transfer', label: 'Stock Transfer' },
      { id: 'physical-stock', label: 'Physical Stock' },
    ],
  },
  {
    id: 'accounting',
    label: 'Accounting',
    icon: Calculator,
    shortcut: 'F5',
    children: [
      { id: 'trial-balance', label: 'Trial Balance' },
      { id: 'profit-loss', label: 'Profit & Loss' },
      { id: 'balance-sheet', label: 'Balance Sheet' },
    ],
  },
  {
    id: 'banking',
    label: 'Banking',
    icon: Building2,
    shortcut: 'F6',
    children: [
      { id: 'bank-accounts', label: 'Bank Accounts' },
      { id: 'reconciliation', label: 'Reconciliation' },
      { id: 'cheques', label: 'Cheques' },
    ],
  },
  {
    id: 'gst',
    label: 'GST',
    icon: FileText,
    shortcut: 'F7',
    children: [
      { id: 'gstr1', label: 'GSTR-1' },
      { id: 'gstr3b', label: 'GSTR-3B' },
      { id: 'gst-reports', label: 'GST Reports' },
    ],
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: ClipboardList,
    children: [
      { id: 'sales-register', label: 'Sales Register' },
      { id: 'purchase-register', label: 'Purchase Register' },
      { id: 'ledger-reports', label: 'Ledger Reports' },
      { id: 'outstanding', label: 'Outstanding Reports' },
    ],
  },
  {
    id: 'administration',
    label: 'Administration',
    icon: Settings,
    children: [
      { id: 'users', label: 'Users' },
      { id: 'roles', label: 'Roles & Permissions' },
      { id: 'audit-log', label: 'Audit Log' },
    ],
  },
];

interface NavItemRowProps {
  item: NavItem;
  collapsed: boolean;
  active: string;
  onNavigate: (id: string) => void;
  level?: number;
}

function NavItemRow({ item, collapsed, active, onNavigate, level = 0 }: NavItemRowProps) {
  const [expanded, setExpanded] = useState(false);
  const isActive = active === item.id;
  const hasChildren = item.children && item.children.length > 0;
  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else {
      onNavigate(item.id);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        className={`
          w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
          transition-colors duration-150
          ${isActive
            ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
            : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
          }
          ${level > 0 ? 'ml-6 text-sm' : ''}
          ${collapsed ? 'justify-center px-2' : ''}
        `}
      >
        {Icon && !level && (
          <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-primary-600 dark:text-primary-400' : ''}`} />
        )}
        {!collapsed && (
          <>
            <span className="flex-1 truncate">{item.label}</span>
            {item.shortcut && !hasChildren && (
              <span className="kbd text-xs">{item.shortcut}</span>
            )}
            {hasChildren && (
              <ChevronDown
                className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              />
            )}
          </>
        )}
      </button>
      {hasChildren && expanded && !collapsed && (
        <div className="mt-1 space-y-0.5">
          {item.children!.map(child => (
            <NavItemRow
              key={child.id}
              item={child}
              collapsed={collapsed}
              active={active}
              onNavigate={onNavigate}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, currentPage, setCurrentPage } = useApp();

  return (
    <aside
      className={`
        fixed left-0 top-0 z-40 h-screen bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
        transition-all duration-300 ease-in-out flex flex-col
        ${sidebarCollapsed ? 'w-16' : 'w-64'}
      `}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-200 dark:border-slate-700">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white text-lg">SmartERP</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {navItems.map(item => (
          <NavItemRow
            key={item.id}
            item={item}
            collapsed={sidebarCollapsed}
            active={currentPage}
            onNavigate={setCurrentPage}
          />
        ))}
      </nav>

      <div className="p-3 border-t border-slate-200 dark:border-slate-700">
        <button
          className={`
            w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left
            text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700
            transition-colors duration-150
            ${sidebarCollapsed ? 'justify-center' : ''}
          `}
        >
          <Keyboard className="w-5 h-5" />
          {!sidebarCollapsed && <span className="text-sm">Keyboard Shortcuts</span>}
        </button>
      </div>
    </aside>
  );
}
