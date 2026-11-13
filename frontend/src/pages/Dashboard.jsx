import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  Calendar
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { StatCard } from '../components/StatCard';
import { DemoBanner } from '../components/DemoBanner';
import { CATEGORY_COLORS } from '../data/initialData';
import { Link } from 'react-router-dom';

export const Dashboard = ({ onOpenTransactionModal }) => {
  const {
    user,
    totalBalance,
    totalIncome,
    totalExpenses,
    savingsRate,
    transactions,
    budgets,
    categoryExpenseList,
    monthlyTrends,
    budgetProgress,
    deleteTransaction,
    isBackendConnected,
    isAuthenticated
  } = useFinance();

  const currency = user?.currency || '$';

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  // Categories near or exceeding budget limit
  const overBudgetItems = budgets.filter((b) => (b.spent || 0) >= (b.monthly_limit || b.limit || 0) * 0.9);

  return (
    <div>
      <DemoBanner
        message={
          isBackendConnected
            ? `Production Flask Backend Live: Connected to database for ${isAuthenticated ? (user?.username || user?.email) : 'Active User'}.`
            : "Running with client-side cache. Connected to configurable Flask REST API when backend server is running."
        }
        actionText="Add New Entry"
        onAction={onOpenTransactionModal}
      />

      {/* 4 Summary Stat Cards */}
      <div className="stats-grid">
        <StatCard
          icon={Wallet}
          type="balance"
          title="Total Cash Balance"
          value={`${currency}${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Net liquidity across accounts"
          badgeText="Active"
          badgeStatus="neutral"
        />

        <StatCard
          icon={TrendingUp}
          type="income"
          title="Total Income"
          value={`${currency}${totalIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Total earnings recorded"
          badgeText="+12.4% MoM"
          badgeStatus="positive"
        />

        <StatCard
          icon={TrendingDown}
          type="expense"
          title="Total Expenses"
          value={`${currency}${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Outflows & bills paid"
          badgeText="-4.2% MoM"
          badgeStatus="negative"
        />

        <StatCard
          icon={PiggyBank}
          type="savings"
          title="Savings Rate"
          value={`${savingsRate}%`}
          subtext="Target goal: 35%+"
          badgeText={savingsRate >= 30 ? 'On Track' : 'Needs Review'}
          badgeStatus={savingsRate >= 30 ? 'positive' : 'negative'}
        />
      </div>

      {/* Overspending Alerts */}
      {overBudgetItems.length > 0 && (
        <div
          style={{
            background: 'var(--warning-bg)',
            border: '1px solid #fde68a',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 20px',
            marginBottom: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              background: '#fef3c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--warning-amber)',
              flexShrink: 0
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, color: '#92400e', fontSize: '0.92rem' }}>
              Budget Threshold Warning ({overBudgetItems.length} categories)
            </div>
            <div style={{ fontSize: '0.82rem', color: '#b45309', marginTop: '2px' }}>
              {overBudgetItems
                .map((b) => `${b.category} (${currency}${b.spent} of ${currency}${b.limit})`)
                .join(', ')}
            </div>
          </div>
          <Link to="/budgets" className="btn btn-secondary btn-sm" style={{ background: 'white' }}>
            View Budgets
          </Link>
        </div>
      )}

      {/* Row 1: Monthly Cashflow Bar Chart & Expense Category Donut */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '28px'
        }}
      >
        {/* Income vs Expenses Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Income vs Expenses</h3>
              <div className="card-subtitle">Monthly cash flow trends for the last 6 months</div>
            </div>
            <span className="stat-badge neutral">Monthly Flow</span>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${currency}${val}`, undefined]}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: 'var(--border-green)',
                    borderRadius: '8px',
                    boxShadow: 'var(--shadow-card)'
                  }}
                />
                <Legend iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Category Donut */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Expenses by Category</h3>
              <div className="card-subtitle">Distribution of outlays across lifestyle categories</div>
            </div>
            <Link to="/analytics" style={{ fontSize: '0.82rem', color: 'var(--brand-emerald)', fontWeight: 700 }}>
              Full Details
            </Link>
          </div>

          <div style={{ width: '100%', height: 280 }}>
            {categoryExpenseList.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryExpenseList}
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryExpenseList.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={CATEGORY_COLORS[entry.name] || '#10b981'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val) => [`${currency}${val}`, 'Spent']}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      borderColor: 'var(--border-green)',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend iconType="circle" layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No expense data recorded
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Recent Transactions & AI Insights / Budget Progress */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px'
        }}
      >
        {/* Recent Transactions List */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Recent Transactions</h3>
              <div className="card-subtitle">Latest account debits and credits</div>
            </div>
            <Link to="/transactions" className="btn btn-secondary btn-sm">
              <span>View All</span>
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="table-responsive">
            <table className="finance-table">
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Category</th>
                  <th>Date</th>
                  <th style={{ textAlign: 'right' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentTransactions.map((tx) => {
                  const isIncome = (tx.type || tx.transaction_type) === 'income';
                  const amt = Number(tx.amount || 0);
                  return (
                    <tr key={tx.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: 'var(--radius-sm)',
                              background: isIncome ? 'var(--income-bg)' : 'var(--expense-bg)',
                              color: isIncome ? 'var(--income-green)' : 'var(--expense-red)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}
                          >
                            {isIncome ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{tx.title}</div>
                            {tx.description && (
                              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                                {tx.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-full)',
                            backgroundColor: 'var(--bg-subtle)',
                            color: 'var(--brand-forest)',
                            border: '1px solid var(--border-green)'
                          }}
                        >
                          {tx.category}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {tx.date}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className={isIncome ? 'amount-income' : 'amount-expense'}>
                          {isIncome ? '+' : '-'}{currency}{amt.toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Financial Insights & Monthly Budget Progress */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Monthly Budget Progress Card */}
          <div className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">Monthly Budget Consumption</h3>
                <div className="card-subtitle">Total overall spending vs budget cap</div>
              </div>
              <span className="stat-badge positive">{budgetProgress}% Utilized</span>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.86rem', fontWeight: 600 }}>
                <span style={{ color: 'var(--text-muted)' }}>Spent so far</span>
                <span style={{ color: 'var(--brand-forest)' }}>
                  {currency}{totalExpenses.toLocaleString()} / {currency}{(user?.monthlyBudget || 3800).toLocaleString()}
                </span>
              </div>
              <div className="progress-track" style={{ height: '10px' }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(budgetProgress, 100)}%`,
                    backgroundColor: budgetProgress > 90 ? 'var(--expense-red)' : 'var(--brand-emerald)'
                  }}
                />
              </div>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Remaining safe spending limit for this month: <strong>{currency}{Math.max(0, (user?.monthlyBudget || 3800) - totalExpenses).toLocaleString()}</strong>
            </p>
          </div>

          {/* AI Financial Insights Card */}
          <div
            className="card"
            style={{
              background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
              borderColor: 'var(--border-green)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--brand-forest)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--brand-forest)' }}>
                  AI Assistant Intelligence
                </h4>
                <div style={{ fontSize: '0.74rem', color: 'var(--brand-emerald)', fontWeight: 700 }}>
                  Active Analysis Model
                </div>
              </div>
            </div>

            <div
              style={{
                fontSize: '0.85rem',
                color: 'var(--brand-forest)',
                lineHeight: 1.5,
                background: 'white',
                padding: '14px',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-green)',
                marginBottom: '14px'
              }}
            >
              "You have saved <strong>{savingsRate}%</strong> of your income this month. Food and dining out expenditures rose by 14% over last week. Reducing two takeout meals will keep you within your target surplus of {currency}500+."
            </div>

            <Link
              to="/ai-assistant"
              className="btn btn-primary btn-sm"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <Sparkles size={14} />
              <span>Ask AI Financial Assistant</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
