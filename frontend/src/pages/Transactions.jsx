import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  Edit2,
  Trash2,
  Calendar,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';
import { EmptyState } from '../components/EmptyState';
import { TransactionModal } from '../components/TransactionModal';

export const Transactions = ({ onOpenTransactionModal }) => {
  const { user, transactions, deleteTransaction } = useFinance();
  const currency = user?.currency || '$';

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editTx, setEditTx] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Extract unique categories
  const categories = Array.from(new Set(transactions.map((t) => t.category)));

  // Filtered transactions
  const filtered = transactions.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(search.toLowerCase())) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;

    return matchesSearch && matchesType && matchesCategory;
  });

  const handleEdit = (tx) => {
    setEditTx(tx);
    setIsModalOpen(true);
  };

  const handleAddNew = (defaultType = 'expense') => {
    setEditTx(null);
    setIsModalOpen(true);
  };

  return (
    <div>
      {/* Top action row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '24px'
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--brand-forest)' }}>
            Financial Ledger & History
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Total {transactions.length} records • Real-time search, category breakdown, and ledger balance
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={() => handleAddNew('expense')}
            className="btn btn-outline"
            style={{ borderColor: 'var(--expense-red)', color: 'var(--expense-red)' }}
          >
            <ArrowDownRight size={16} />
            <span>Add Expense</span>
          </button>
          <button
            onClick={() => handleAddNew('income')}
            className="btn btn-primary"
          >
            <Plus size={16} />
            <span>Add Income</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Card */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px 20px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '14px',
            alignItems: 'center'
          }}
        >
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search
              size={18}
              color="var(--text-muted)"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Search by title, description, or tag..."
              className="form-input"
              style={{ paddingLeft: '38px' }}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              className="form-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">All Cashflow Types</option>
              <option value="income">Income Only (+)</option>
              <option value="expense">Expenses Only (-)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Clear Filters */}
          {(search || typeFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setTypeFilter('all');
                setCategoryFilter('all');
              }}
              className="btn btn-secondary btn-sm"
              style={{ height: '42px' }}
            >
              <X size={14} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filtered.length > 0 ? (
          <div className="table-responsive">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Category</th>
                  <th>Type</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                  <th style={{ textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-md)',
                            background: tx.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
                            color: tx.type === 'income' ? 'var(--income-green)' : 'var(--expense-red)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}
                        >
                          {tx.type === 'income' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--brand-forest)' }}>
                            {tx.title}
                          </div>
                          {tx.description && (
                            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                              {tx.description}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '0.78rem',
                          fontWeight: 600,
                          padding: '3px 10px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--bg-subtle)',
                          color: 'var(--brand-forest)',
                          border: '1px solid var(--border-green)'
                        }}
                      >
                        {tx.category}
                      </span>
                    </td>

                    <td>
                      <span
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: tx.type === 'income' ? 'var(--income-green)' : 'var(--expense-red)'
                        }}
                      >
                        {tx.type}
                      </span>
                    </td>

                    <td style={{ color: 'var(--text-muted)', fontSize: '0.84rem' }}>
                      {tx.date}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 800
                        }}
                        className={tx.type === 'income' ? 'amount-income' : 'amount-expense'}
                      >
                        {tx.type === 'income' ? '+' : '-'}{currency}{Number(tx.amount).toFixed(2)}
                      </span>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'inline-flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEdit(tx)}
                          className="topbar-btn"
                          style={{ width: '30px', height: '30px' }}
                          title="Edit transaction"
                          aria-label="Edit"
                        >
                          <Edit2 size={14} color="var(--brand-forest)" />
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="topbar-btn"
                          style={{ width: '30px', height: '30px', color: 'var(--expense-red)' }}
                          title="Delete transaction"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: '24px' }}>
            <EmptyState
              title="No Matching Transactions Found"
              description="Try adjusting your search criteria, category filters, or record a new transaction."
              actionText="Add Transaction"
              onAction={() => handleAddNew('expense')}
            />
          </div>
        )}
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editTransaction={editTx}
      />
    </div>
  );
};
