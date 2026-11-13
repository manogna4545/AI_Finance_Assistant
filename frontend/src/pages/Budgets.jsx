import React, { useState } from 'react';
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Target,
  Sparkles,
  Edit3
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { BudgetModal } from '../components/BudgetModal';

export const Budgets = () => {
  const { user, budgets, totalExpenses, updateBudget } = useFinance();
  const currency = user?.currency || '$';
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editLimit, setEditLimit] = useState('');

  const totalLimit = budgets.reduce((acc, b) => acc + Number(b.monthly_limit || b.limit || 0), 0);
  const totalSpent = budgets.reduce((acc, b) => acc + Number(b.spent || 0), 0);
  const overallPercentage = totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0;

  const startEdit = (b) => {
    setEditingId(b.id);
    setEditLimit(String(b.monthly_limit || b.limit || 0));
  };

  const saveEdit = (id) => {
    const val = parseFloat(editLimit);
    if (!isNaN(val) && val > 0) {
      updateBudget(id, val);
    }
    setEditingId(null);
  };

  return (
    <div>
      {/* Overview Card */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          marginBottom: '28px',
          padding: '28px'
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
            marginBottom: '20px'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Target size={22} color="var(--brand-emerald)" />
              <h2 style={{ fontSize: '1.35rem', color: 'var(--brand-forest)' }}>
                Monthly Category Budgets & Targets
              </h2>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Allocated Monthly Cap: <strong>{currency}{totalLimit.toLocaleString()}</strong> • Total Spent to Date: <strong>{currency}{totalSpent.toLocaleString()}</strong>
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus size={18} />
            <span>Add Category Budget</span>
          </button>
        </div>

        {/* Global Progress Bar */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', fontWeight: 700, marginBottom: '6px' }}>
            <span style={{ color: 'var(--brand-forest)' }}>Overall Budget Consumption</span>
            <span style={{ color: overallPercentage > 90 ? 'var(--expense-red)' : 'var(--brand-forest)' }}>
              {overallPercentage}% ({currency}{Math.max(0, totalLimit - totalSpent).toLocaleString()} available)
            </span>
          </div>

          <div className="progress-track" style={{ height: '14px', background: '#dcfce7' }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(overallPercentage, 100)}%`,
                background:
                  overallPercentage > 100
                    ? 'var(--expense-red)'
                    : overallPercentage > 85
                    ? 'var(--warning-amber)'
                    : 'linear-gradient(90deg, #10b981 0%, #059669 100%)'
              }}
            />
          </div>
        </div>
      </div>

      {/* Category Budgets Grid */}
      <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-forest)', marginBottom: '18px' }}>
        Category Breakdown ({budgets.length} Targets)
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px'
        }}
      >
        {budgets.map((b) => {
          const limitVal = Number(b.monthly_limit || b.limit || 0);
          const spentVal = Number(b.spent || 0);
          const ratio = limitVal > 0 ? Math.round((spentVal / limitVal) * 100) : 0;
          const isOver = spentVal > limitVal;
          const isWarning = !isOver && ratio >= 85;

          return (
            <div
              key={b.id}
              className="card"
              style={{
                borderLeft: `5px solid ${isOver ? 'var(--expense-red)' : isWarning ? 'var(--warning-amber)' : b.color || 'var(--brand-emerald)'}`,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--brand-forest)' }}>
                    {b.category}
                  </div>
                  {isOver ? (
                    <span className="stat-badge negative" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <AlertTriangle size={12} />
                      Exceeded
                    </span>
                  ) : isWarning ? (
                    <span className="stat-badge neutral" style={{ background: '#fef3c7', color: '#92400e' }}>
                      At Risk
                    </span>
                  ) : (
                    <span className="stat-badge positive" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} />
                      Safe
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: isOver ? 'var(--expense-red)' : 'var(--brand-forest)' }}>
                    {currency}{spentVal.toLocaleString()}
                  </span>

                  {editingId === b.id ? (
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      <input
                        type="number"
                        className="form-input"
                        style={{ width: '80px', padding: '4px 6px', fontSize: '0.85rem' }}
                        value={editLimit}
                        onChange={(e) => setEditLimit(e.target.value)}
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(b.id)}
                        className="btn btn-primary btn-sm"
                        style={{ padding: '4px 8px' }}
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                        of {currency}{limitVal.toLocaleString()}
                      </span>
                      <button
                        onClick={() => startEdit(b)}
                        style={{ color: 'var(--brand-emerald)', padding: '2px' }}
                        title="Adjust limit"
                      >
                        <Edit3 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Progress bar */}
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${Math.min(ratio, 100)}%`,
                      backgroundColor: isOver
                        ? 'var(--expense-red)'
                        : isWarning
                        ? 'var(--warning-amber)'
                        : b.color || 'var(--brand-emerald)'
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  paddingTop: '12px',
                  borderTop: '1px solid #f1f5f9',
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)'
                }}
              >
                <span>{ratio}% consumed</span>
                <span>
                  {isOver
                    ? `${currency}${(b.spent - b.limit).toFixed(0)} over limit`
                    : `${currency}${(b.limit - b.spent).toFixed(0)} remaining`}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <BudgetModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
