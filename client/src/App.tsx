import { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { MainLayout } from './components/layout/MainLayout';
import { ToastContainer } from './components/ui/Toast';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

// Pages
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { CompanySelectionPage } from './pages/CompanySelectionPage';
import { DashboardPage } from './pages/DashboardPage';
import { CustomersPage, SuppliersPage, StockItemsPage } from './pages/MastersPage';
import { SalesPage, PurchasesPage, ReceiptsPage, PaymentsPage } from './pages/TransactionsPage';
import { TrialBalancePage, ProfitLossPage, BalanceSheetPage } from './pages/AccountingPage';
import { GSTPage, GSTR1Page, GSTR3BPage } from './pages/GSTPage';

function PageRouter() {
  const { currentPage, user, selectedCompany, setCurrentPage } = useApp();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user && currentPage !== 'login' && currentPage !== 'register') {
      setCurrentPage('login');
    }
  }, [user, currentPage, setCurrentPage]);

  // Auth pages (no layout) — register must be checked before the !user fallback
  if (currentPage === 'register') {
    return <RegisterPage />;
  }

  if (currentPage === 'login' || !user) {
    return <LoginPage />;
  }

  // Company selection page (no main layout)
  if (currentPage === 'company-selection' || !selectedCompany) {
    return <CompanySelectionPage />;
  }

  // Main application pages
  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'customers':
        return <CustomersPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'stock-items':
        return <StockItemsPage />;
      case 'sales':
        return <SalesPage />;
      case 'purchases':
        return <PurchasesPage />;
      case 'receipts':
        return <ReceiptsPage />;
      case 'payments':
        return <PaymentsPage />;
      case 'trial-balance':
        return <TrialBalancePage />;
      case 'profit-loss':
        return <ProfitLossPage />;
      case 'balance-sheet':
        return <BalanceSheetPage />;
      case 'gst':
        return <GSTPage />;
      case 'gstr1':
        return <GSTR1Page />;
      case 'gstr3b':
        return <GSTR3BPage />;
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">\ud83d\udcc4</span>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                Page Under Construction
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                The "{currentPage}" page is coming soon.
              </p>
              <button
                onClick={() => setCurrentPage('dashboard')}
                className="text-primary-600 dark:text-primary-400 hover:underline"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        );
    }
  };

  return <MainLayout>{renderPage()}</MainLayout>;
}

function AppContent() {
  useKeyboardShortcuts();

  return (
    <>
      <PageRouter />
      <ToastContainer />
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
