import React, { useState } from 'react';
import { X, Target, DollarSign } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const AVAILABLE_CATEGORIES = [
  'Housing',
  'Groceries',
  'Dining Out',
  'Transportation',
  'Utilities',
  'Subscriptions',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Travel',
  'Other'
];

export const BudgetModal = ({ isOpen, onClose }) => {
  const { user, addBudget } = useFinance();
  const [category, setCategory] = useState('Entertainment');
  const [limit, setLimit] = useState('');
  const [color, setColor] = useState('#10b981');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedLimit = parseFloat(limit);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      setError('Please provide a valid budget limit greater than zero.');
      return;
    }

    addBudget({
      category,
      limit: parsedLimit,
      color
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">Set Category Budget Target</h3>
          <button
            onClick={onClose}
            className="topbar-btn"
            style={{ width: '32px', height: '32px' }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
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
                  fontWeight: 600
                }}
              >
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Monthly Limit ({user?.currency || '$'})</label>
              <input
                type="number"
                step="1"
                min="10"
                className="form-input"
                placeholder="e.g. 450"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Indicator Color</label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  style={{ width: '48px', height: '38px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{color}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
            >
              Create Budget Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
