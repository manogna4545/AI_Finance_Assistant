import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Calendar,
  Percent
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
  Cell,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { CATEGORY_COLORS } from '../data/initialData';

export const Analytics = () => {
  const {
    user,
    totalIncome,
    totalExpenses,
    savingsRate,
    categoryExpenseList,
    monthlyTrends
  } = useFinance();

  const currency = user?.currency || '$';

  // Sort categories by expenditure
  const sortedCategories = [...categoryExpenseList].sort((a, b) => b.value - a.value);

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.3rem', color: 'var(--brand-forest)' }}>
          Financial Analytics & Cashflow Trends
        </h2>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-muted)' }}>
          Detailed expenditure patterns, multi-month revenue comparisons, and category allocations
        </p>
      </div>

      {/* KPI Highlights */}
      <div className="stats-grid" style={{ marginBottom: '28px' }}>
        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon-wrapper income">
              <TrendingUp size={20} />
            </div>
            <span className="stat-badge positive">+18% vs H1</span>
          </div>
          <div className="stat-value">{currency}{totalIncome.toLocaleString()}</div>
          <div className="stat-label">Net Gross Earnings</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon-wrapper expense">
              <ArrowDownRight size={20} />
            </div>
            <span className="stat-badge neutral">Controlled</span>
          </div>
          <div className="stat-value">{currency}{totalExpenses.toLocaleString()}</div>
          <div className="stat-label">Total Outflows</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon-wrapper savings">
              <Percent size={20} />
            </div>
            <span className="stat-badge positive">Healthy</span>
          </div>
          <div className="stat-value">{savingsRate}%</div>
          <div className="stat-label">Average Savings Margin</div>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon-wrapper balance">
              <Layers size={20} />
            </div>
            <span className="stat-badge neutral">{sortedCategories.length} Types</span>
          </div>
          <div className="stat-value">{sortedCategories[0]?.name || 'Housing'}</div>
          <div className="stat-label">Top Expense Category</div>
        </div>
      </div>

      {/* Charts Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '24px',
          marginBottom: '28px'
        }}
      >
        {/* Multi-month Net Trend Line Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Net Savings Growth Trend</h3>
              <div className="card-subtitle">Historical surplus accumulation over the trailing 6 months</div>
            </div>
            <span className="stat-badge positive">Linear Trend</span>
          </div>

          <div style={{ width: '100%', height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${currency}${val}`, 'Savings']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: 'var(--border-green)',
                    borderRadius: '8px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  name="Monthly Surplus"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#059669' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Bar Chart */}
        <div className="card">
          <div className="card-header">
            <div>
              <h3 className="card-title">Category Spending Distribution</h3>
              <div className="card-subtitle">Direct expenditure comparison by lifestyle group</div>
            </div>
            <span className="stat-badge neutral">Aggregated</span>
          </div>

          <div style={{ width: '100%', height: 290 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sortedCategories}
                layout="vertical"
                margin={{ top: 5, right: 20, left: 35, bottom: 5 }}
              >
                <XAxis type="number" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${currency}${val}`, 'Amount']}
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: 'var(--border-green)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="value" name="Amount" fill="#10b981" radius={[0, 4, 4, 0]}>
                  {sortedCategories.map((entry, index) => (
                    <Cell key={`bar-cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="card">
        <div className="card-header">
          <div>
            <h3 className="card-title">Comprehensive Expense Allocation</h3>
            <div className="card-subtitle">Exact amounts and proportional percentages of monthly expenditures</div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="finance-table">
            <thead>
              <tr>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Total Outflow</th>
                <th style={{ textAlign: 'right' }}>% of Total Outflows</th>
                <th>Share Meter</th>
              </tr>
            </thead>
            <tbody>
              {sortedCategories.map((cat) => {
                const pct = totalExpenses > 0 ? Math.round((cat.value / totalExpenses) * 100) : 0;
                return (
                  <tr key={cat.name}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: CATEGORY_COLORS[cat.name] || '#10b981'
                          }}
                        />
                        <span style={{ fontWeight: 700, color: 'var(--brand-forest)' }}>{cat.name}</span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>
                      {currency}{Number(cat.value).toFixed(2)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {pct}%
                    </td>
                    <td style={{ width: '35%' }}>
                      <div className="progress-track" style={{ margin: 0, height: '8px' }}>
                        <div
                          className="progress-fill"
                          style={{
                            width: `${pct}%`,
                            backgroundColor: CATEGORY_COLORS[cat.name] || '#10b981'
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
