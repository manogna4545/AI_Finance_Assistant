import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { FinanceProvider } from './context/FinanceContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileHeader } from './components/MobileHeader';
import { TransactionModal } from './components/TransactionModal';
import { AuthModal } from './components/AuthModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Budgets } from './pages/Budgets';
import { Analytics } from './pages/Analytics';
import { Predictions } from './pages/Predictions';
import { AIAssistant } from './pages/AIAssistant';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

const ROUTE_TITLES = {
  '/': 'Financial Overview',
  '/transactions': 'Transactions & Ledger',
  '/budgets': 'Budgets & Thresholds',
  '/analytics': 'Performance Analytics',
  '/predictions': 'AI Spending Forecasts',
  '/ai-assistant': 'AI Financial Assistant',
  '/reports': 'Financial Reports',
  '/settings': 'Profile & Preferences'
};

const MainLayout = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const currentTitle = ROUTE_TITLES[location.pathname] || 'AI Finance Assistant';

  return (
    <div className="app-layout">
      {/* Desktop & Mobile Responsive Sidebar */}
      <Sidebar
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <div className="main-wrapper">
        {/* Mobile Header Bar */}
        <MobileHeader
          pageTitle={currentTitle}
          onMenuClick={() => setIsMobileMenuOpen(true)}
          onQuickAdd={() => setIsQuickAddOpen(true)}
        />

        {/* Desktop Sticky Header */}
        <Header
          title={currentTitle}
          onQuickAdd={() => setIsQuickAddOpen(true)}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />

        {/* Dynamic Page Content */}
        <main className="page-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard onOpenTransactionModal={() => setIsQuickAddOpen(true)} />}
            />
            <Route
              path="/transactions"
              element={<Transactions onOpenTransactionModal={() => setIsQuickAddOpen(true)} />}
            />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/predictions" element={<Predictions />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings onOpenAuth={() => setIsAuthModalOpen(true)} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />

      {/* Global Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <FinanceProvider>
        <MainLayout />
      </FinanceProvider>
    </BrowserRouter>
  );
}
