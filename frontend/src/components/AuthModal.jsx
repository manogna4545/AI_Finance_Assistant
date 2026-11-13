import React, { useState } from 'react';
import { X, Lock, Mail, User, DollarSign, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const CURRENCIES = [
  { symbol: '$', name: 'US Dollar ($)' },
  { symbol: '₹', name: 'Indian Rupee (₹)' },
  { symbol: '€', name: 'Euro (€)' },
  { symbol: '£', name: 'British Pound (£)' },
  { symbol: '¥', name: 'Japanese Yen (¥)' }
];

export const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const { login, register, demoLogin } = useFinance();
  const [mode, setMode] = useState(initialMode); // 'login' or 'register'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('$');
  const [monthlyBudget, setMonthlyBudget] = useState('3800');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      onClose();
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        username,
        email,
        password,
        currency,
        monthly_budget: parseFloat(monthlyBudget) || 3800.0
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await demoLogin();
      onClose();
    } catch (err) {
      setError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div className="brand-icon-wrapper" style={{ width: '32px', height: '32px' }}>
              <Sparkles size={16} />
            </div>
            <h3 className="card-title">
              {mode === 'login' ? 'Account Login' : 'Create New Account'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="topbar-btn"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', borderBottom: '1px solid var(--border-green)' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              padding: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: mode === 'login' ? 'var(--brand-forest)' : 'var(--text-muted)',
              borderBottom: mode === 'login' ? '3px solid var(--brand-emerald)' : 'none',
              background: mode === 'login' ? 'var(--bg-subtle)' : 'transparent'
            }}
          >
            Log In
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              padding: '12px',
              fontWeight: 700,
              fontSize: '0.9rem',
              color: mode === 'register' ? 'var(--brand-forest)' : 'var(--text-muted)',
              borderBottom: mode === 'register' ? '3px solid var(--brand-emerald)' : 'none',
              background: mode === 'register' ? 'var(--bg-subtle)' : 'transparent'
            }}
          >
            Register
          </button>
        </div>

        <div className="modal-body">
          {error && (
            <div
              style={{
                background: 'var(--expense-bg)',
                border: '1px solid #fecaca',
                color: 'var(--expense-red)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.84rem',
                marginBottom: '16px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Instant Demo Login Button */}
          <div
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              border: '1.5px dashed var(--brand-emerald)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              marginBottom: '20px',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--brand-forest)', marginBottom: '4px' }}>
              ⚡ Instant Evaluation / Reviewer Access
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
              One-click access with live pre-seeded financial accounts & ML demo records.
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Sparkles size={14} />
              <span>Launch Demo Account Instantly</span>
            </button>
          </div>

          <div style={{ textAlign: 'center', margin: '14px 0', position: 'relative' }}>
            <span style={{ background: 'white', padding: '0 10px', fontSize: '0.78rem', color: 'var(--text-muted)', position: 'relative', zIndex: 1 }}>
              or continue with your credentials
            </span>
            <div style={{ height: '1px', background: '#e2e8f0', position: 'absolute', top: '50%', left: 0, right: 0 }} />
          </div>

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label className="form-label">Email or Username</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. alex.morgan@finance.io"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name / Username</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Taylor Smith"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. taylor@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Create Password (min 6 characters)</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">Currency</label>
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
                  <label className="form-label">Monthly Target Cap</label>
                  <input
                    type="number"
                    className="form-input"
                    value={monthlyBudget}
                    onChange={(e) => setMonthlyBudget(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center', marginTop: '10px' }}
              >
                {loading ? 'Creating Account...' : 'Complete Registration'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
