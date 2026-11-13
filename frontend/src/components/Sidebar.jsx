import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  BarChart3,
  TrendingUp,
  Bot,
  FileText,
  Settings,
  X,
  Sparkles,
  ShieldCheck,
  LogIn
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { path: '/budgets', label: 'Budgets', icon: PieChart },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/predictions', label: 'Predictions', icon: TrendingUp },
  { path: '/ai-assistant', label: 'AI Assistant', icon: Bot, highlight: true },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const Sidebar = ({ isOpen, onClose, onOpenAuth }) => {
  const { user, isAuthenticated } = useFinance();

  const displayName = user?.username || user?.name || (isAuthenticated ? 'Account Holder' : 'Guest Demo');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="mobile-drawer-overlay"
          onClick={onClose}
          aria-label="Close navigation overlay"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Brand header */}
        <div className="sidebar-header">
          <div className="brand-icon-wrapper">
            <Sparkles size={22} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="brand-title">AI Finance</div>
            <span className="brand-badge">Assistant</span>
          </div>

          {/* Close button on mobile */}
          {isOpen && (
            <button
              onClick={onClose}
              className="topbar-btn"
              style={{ width: '32px', height: '32px' }}
              aria-label="Close navigation menu"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation list */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                onClick={() => {
                  if (isOpen) onClose();
                }}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
                {item.highlight && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      background: 'var(--brand-emerald)',
                      color: 'white',
                      padding: '2px 6px',
                      borderRadius: '9999px',
                      letterSpacing: '0.04em'
                    }}
                  >
                    AI
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User profile & Auth prompt at bottom */}
        <div className="sidebar-footer">
          {isAuthenticated ? (
            <div className="user-mini-card">
              <div className="user-avatar">
                {userInitial}
              </div>
              <div className="user-info-text">
                <div className="user-name">{displayName}</div>
                <div className="user-role" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <ShieldCheck size={12} color="#059669" />
                  <span>Authenticated</span>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => {
                if (isOpen) onClose();
                onOpenAuth();
              }}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <LogIn size={14} />
              <span>Sign In / Demo Login</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};
