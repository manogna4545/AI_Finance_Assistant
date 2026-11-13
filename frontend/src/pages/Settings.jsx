import React, { useState } from 'react';
import {
  User,
  Settings as SettingsIcon,
  RotateCcw,
  LogOut,
  Save,
  CheckCircle,
  Shield,
  LogIn
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const CURRENCIES = [
  { symbol: '$', name: 'US Dollar ($)' },
  { symbol: '₹', name: 'Indian Rupee (₹)' },
  { symbol: '€', name: 'Euro (€)' },
  { symbol: '£', name: 'British Pound (£)' },
  { symbol: '¥', name: 'Japanese Yen (¥)' },
  { symbol: 'C$', name: 'Canadian Dollar (C$)' }
];

export const Settings = ({ onOpenAuth }) => {
  const { user, updateUser, resetDemoData, isAuthenticated, logout } = useFinance();

  const [name, setName] = useState(user?.username || user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [currency, setCurrency] = useState(user?.currency || '$');
  const [monthlyBudget, setMonthlyBudget] = useState(user?.monthly_budget || user?.monthlyBudget || 3800);
  const [savedMsg, setSavedMsg] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    await updateUser({
      username: name,
      currency,
      monthly_budget: parseFloat(monthlyBudget) || 3800.0
    });
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm('Reset all transactions and budgets back to the initial demo template?')) {
      resetDemoData();
      window.location.reload();
    }
  };

  const handleConfirmLogout = async () => {
    setShowLogoutModal(false);
    await logout();
  };

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--brand-forest)' }}>
          Profile & Application Settings
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Manage your personal identity, preferred currency, target caps, and prototype preferences
        </p>
      </div>

      {savedMsg && (
        <div
          style={{
            background: 'var(--income-bg)',
            border: '1px solid #a7f3d0',
            color: 'var(--income-green)',
            padding: '12px 18px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600
          }}
        >
          <CheckCircle size={18} />
          <span>Profile and currency preferences updated successfully!</span>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '28px'
        }}
      >
        {/* User Profile Form */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">User Profile</h3>
              <div className="card-subtitle">Personal information stored in your account database</div>
            </div>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'var(--bg-subtle)',
                color: 'var(--brand-emerald)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <User size={18} />
            </div>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name / Username</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                value={email}
                disabled
                style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Primary Ledger Currency</label>
              <select
                className="form-select"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.symbol} value={c.symbol}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Target Budget Cap ({currency})</label>
              <input
                type="number"
                className="form-input"
                value={monthlyBudget}
                onChange={(e) => setMonthlyBudget(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px' }}>
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </form>
        </div>

        {/* Application Data & Security */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Security & Authentication status */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Authentication & Access</h3>
                <div className="card-subtitle">
                  {isAuthenticated ? 'Authenticated via Secure JWT Token' : 'Currently in Guest / Demo Mode'}
                </div>
              </div>
              <Shield size={18} color={isAuthenticated ? 'var(--brand-emerald)' : 'var(--text-muted)'} />
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.6, marginBottom: '16px' }}>
              {isAuthenticated
                ? `You are logged in as ${user?.email || user?.username}. Your financial records are isolated and protected by password hashing and JWT authentication.`
                : 'Sign in or use our one-click instant demo access to synchronize all records with the live Flask backend.'}
            </p>

            {isAuthenticated ? (
              <button
                onClick={() => setShowLogoutModal(true)}
                className="btn btn-outline"
                style={{ color: 'var(--expense-red)', borderColor: '#fecaca' }}
              >
                <LogOut size={16} />
                <span>Sign Out of Account</span>
              </button>
            ) : (
              <button
                onClick={onOpenAuth}
                className="btn btn-primary"
              >
                <LogIn size={16} />
                <span>Sign In / Demo Login</span>
              </button>
            )}
          </div>

          {/* Reset Demo State Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Prototype Data Controls</h3>
                <div className="card-subtitle">Clear modified records and restore initial starter template</div>
              </div>
              <RotateCcw size={18} color="var(--brand-emerald)" />
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
              Use this if you want to restore the clean starter dataset to showcase the AI Finance Assistant from scratch during evaluation.
            </p>

            <button
              onClick={handleReset}
              className="btn btn-secondary"
            >
              <RotateCcw size={16} />
              <span>Restore Default Starter Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="modal-backdrop" onClick={() => setShowLogoutModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="card-title">Confirm Session Exit</h3>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: '0.9rem', color: 'var(--text-body)' }}>
                Are you sure you want to sign out of the AI Finance Assistant dashboard?
              </p>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="btn btn-outline"
              >
                Stay Logged In
              </button>
              <button
                onClick={handleConfirmLogout}
                className="btn btn-primary"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
