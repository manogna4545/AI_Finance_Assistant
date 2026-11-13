import React from 'react';
import { Plus, Bell, Sparkles, LogIn, CheckCircle2, Wifi, WifiOff } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const Header = ({ title, onQuickAdd, onOpenAuth }) => {
  const { user, isAuthenticated, isBackendConnected } = useFinance();
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div>
          <h1 className="page-title">{title}</h1>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            {currentDate} • {isAuthenticated ? `Welcome back, ${user?.username || user?.name || 'User'}` : 'Guest Preview Mode'}
          </div>
        </div>
      </div>

      <div className="topbar-right">
        {/* Real-time backend status chip */}
        <div
          className="status-chip"
          style={{
            background: isBackendConnected ? 'var(--bg-subtle)' : '#fef2f2',
            borderColor: isBackendConnected ? 'var(--primary-200)' : '#fecaca',
            color: isBackendConnected ? 'var(--brand-forest)' : 'var(--expense-red)'
          }}
          title={isBackendConnected ? 'Connected to Flask REST API' : 'Backend is booting or offline (using local cache)'}
        >
          {isBackendConnected ? (
            <>
              <span className="status-dot"></span>
              <span>API Live</span>
            </>
          ) : (
            <>
              <WifiOff size={13} />
              <span>Offline Cache</span>
            </>
          )}
        </div>

        {/* Authentication button if not signed in */}
        {!isAuthenticated ? (
          <button
            onClick={onOpenAuth}
            className="btn btn-secondary"
            style={{ fontWeight: 700 }}
          >
            <LogIn size={16} />
            <span>Sign In / Demo</span>
          </button>
        ) : null}

        {/* Quick Add Transaction action */}
        <button
          onClick={onQuickAdd}
          className="btn btn-primary"
        >
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>
    </header>
  );
};
