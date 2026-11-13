import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, DollarSign, Calendar, Tag, FileText } from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Gift', 'Refund', 'Other'];
const EXPENSE_CATEGORIES = ['Housing', 'Groceries', 'Dining Out', 'Transportation', 'Utilities', 'Subscriptions', 'Healthcare', 'Entertainment', 'Shopping', 'Other'];

export const TransactionModal = ({ isOpen, onClose, editTransaction = null }) => {
  const { user, addTransaction, updateTransaction } = useFinance();

  const [type, setType] = useState('expense');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Groceries');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type || 'expense');
      setTitle(editTransaction.title || '');
      setAmount(editTransaction.amount ? String(editTransaction.amount) : '');
      setCategory(editTransaction.category || 'Groceries');
      setDate(editTransaction.date || new Date().toISOString().split('T')[0]);
      setDescription(editTransaction.description || '');
    } else {
      setType('expense');
      setTitle('');
      setAmount('');
      setCategory('Groceries');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
    setError('');
  }, [editTransaction, isOpen]);

  // Adjust default category if type flips
  const handleTypeChange = (newType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory('Salary');
    } else {
      setCategory('Groceries');
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a valid transaction title.');
      return;
    }
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Please enter a valid positive numerical amount.');
      return;
    }

    const payload = {
      title: title.trim(),
      amount: parsedAmount,
      type,
      category,
      date,
      description: description.trim()
    };

    if (editTransaction) {
      updateTransaction(editTransaction.id, payload);
    } else {
      addTransaction(payload);
    }

    onClose();
  };

  const categoryOptions = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="card-title">
            {editTransaction ? 'Edit Transaction' : 'Record New Transaction'}
          </h3>
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

            {/* Type Switcher */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '18px' }}>
              <button
                type="button"
                onClick={() => handleTypeChange('expense')}
                className={`btn ${type === 'expense' ? 'btn-danger' : 'btn-outline'}`}
                style={{ fontWeight: 700 }}
              >
                <ArrowDownRight size={18} />
                <span>Expense</span>
              </button>
              <button
                type="button"
                onClick={() => handleTypeChange('income')}
                className={`btn ${type === 'income' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontWeight: 700 }}
              >
                <ArrowUpRight size={18} />
                <span>Income</span>
              </button>
            </div>

            {/* Title */}
            <div className="form-group">
              <label className="form-label">Title / Merchant</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Grocery Store, Client Invoice, Rent"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Amount & Date */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label className="form-label">Amount ({user?.currency || '$'})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="form-input"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description / Notes */}
            <div className="form-group">
              <label className="form-label">Notes (Optional)</label>
              <textarea
                className="form-textarea"
                rows="2"
                placeholder="Additional details, tax invoice number, receipt notes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
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
              {editTransaction ? 'Save Changes' : 'Record Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
