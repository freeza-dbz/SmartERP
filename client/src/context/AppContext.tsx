import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { User, Company, ToastMessage } from '../types';

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  selectedCompany: Company | null;
  setSelectedCompany: (company: Company | null) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('selectedCompany');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('darkMode') === 'true' ||
        (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('user');
      const savedCompany = localStorage.getItem('selectedCompany');
      if (savedUser) {
        return savedCompany ? 'dashboard' : 'company-selection';
      }
    }
    return 'login';
  });

  const setUser = useCallback((val: User | null) => {
    setUserState(val);
    if (val) {
      localStorage.setItem('user', JSON.stringify(val));
    } else {
      localStorage.removeItem('user');
    }
  }, []);

  const setSelectedCompany = useCallback((val: Company | null) => {
    setSelectedCompanyState(val);
    if (val) {
      localStorage.setItem('selectedCompany', JSON.stringify(val));
    } else {
      localStorage.removeItem('selectedCompany');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', String(darkMode));
  }, [darkMode]);

  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => !prev);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed(prev => !prev);
  }, []);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <AppContext.Provider value={{
      user,
      setUser,
      selectedCompany,
      setSelectedCompany,
      darkMode,
      toggleDarkMode,
      sidebarCollapsed,
      toggleSidebar,
      toasts,
      addToast,
      removeToast,
      currentPage,
      setCurrentPage,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
