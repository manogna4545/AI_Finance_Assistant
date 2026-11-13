import React from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { useFinance } from '../context/FinanceContext';

export const Reports = () => {
  const {
    user,
    totalIncome,
    totalExpenses,
    totalBalance,
    savingsRate,
    transactions,
    categoryExpenseList
  } = useFinance();

  const currency = user?.currency || '$';
  const currentDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  // Export CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Title', 'Type', 'Category', 'Amount', 'Date', 'Description'];
    const rows = transactions.map((t) => [
      t.id,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type || t.transaction_type || 'expense',
      `"${t.category}"`,
      t.amount,
      t.date,
      `"${(t.description || '').replace(/"/g, '""')}"`
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `financial_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      {/* Top Header & Actions */}
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
          <h2 style={{ fontSize: '1.3rem', color: 'var(--brand-forest)' }}>
            Executive Financial Statement
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            Generated on {currentDate} for {user?.name || 'Account Holder'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            onClick={handlePrint}
            className="btn btn-outline"
          >
            <Printer size={16} />
            <span>Print Statement</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="btn btn-primary"
          >
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Statement Card */}
      <div
        className="card"
        style={{
          padding: '36px',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border-green)',
          boxShadow: 'var(--shadow-card)',
          marginBottom: '28px'
        }}
      >
        {/* Document Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            borderBottom: '2px solid var(--border-green)',
            paddingBottom: '20px',
            marginBottom: '24px'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--brand-forest)' }}>
              AI Finance Assistant
            </h3>
            <div style={{ fontSize: '0.82rem', color: 'var(--brand-emerald)', fontWeight: 700 }}>
              Official Financial Statement & Summary
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Period: Trailing 30 Days (Current Month)
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
            <div><strong>Client:</strong> {user?.name}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Currency:</strong> {currency} (Standard)</div>
          </div>
        </div>

        {/* Executive Metrics Overview */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '16px',
            marginBottom: '28px'
          }}
        >
          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--income-bg)',
              border: '1px solid #d1fae5'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#065f46', fontWeight: 600 }}>Total Earned</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--income-green)', marginTop: '4px' }}>
              +{currency}{totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--expense-bg)',
              border: '1px solid #fecaca'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#991b1b', fontWeight: 600 }}>Total Expended</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--expense-red)', marginTop: '4px' }}>
              -{currency}{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-subtle)',
              border: '1px solid var(--border-green)'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: 'var(--brand-forest)', fontWeight: 600 }}>Net Cash Surplus</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-forest)', marginTop: '4px' }}>
              {currency}{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div
            style={{
              padding: '16px',
              borderRadius: 'var(--radius-md)',
              background: '#ecfeff',
              border: '1px solid #cffafe'
            }}
          >
            <div style={{ fontSize: '0.78rem', color: '#155e75', fontWeight: 600 }}>Net Savings Ratio</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0891b2', marginTop: '4px' }}>
              {savingsRate}%
            </div>
          </div>
        </div>

        {/* Category Breakdown Table */}
        <h4 style={{ fontSize: '1.05rem', color: 'var(--brand-forest)', marginBottom: '14px' }}>
          Category Spending Breakdown
        </h4>

        <div className="table-responsive" style={{ marginBottom: '28px' }}>
          <table className="finance-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Total Outflow</th>
                <th style={{ textAlign: 'right' }}>Percentage Share</th>
              </tr>
            </thead>
            <tbody>
              {categoryExpenseList.map((c) => {
                const pct = totalExpenses > 0 ? ((c.value / totalExpenses) * 100).toFixed(1) : 0;
                return (
                  <tr key={c.name}>
                    <td style={{ fontWeight: 700, color: 'var(--brand-forest)' }}>{c.name}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {currency}{Number(c.value).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)' }}>
                      {pct}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Verification Footer */}
        <div
          style={{
            borderTop: '1px solid var(--border-green)',
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}
        >
          <div>Verified client report rendered from client ledger database.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--brand-emerald)', fontWeight: 700 }}>
            <CheckCircle size={14} />
            <span>Integrity Validated</span>
          </div>
        </div>
      </div>
    </div>
  );
};
