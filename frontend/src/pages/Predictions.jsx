import React from 'react';
import {
  TrendingUp,
  BrainCircuit,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Calendar,
  CheckCircle,
  Cpu
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid
} from 'recharts';
import { useFinance } from '../context/FinanceContext';
import { DemoBanner } from '../components/DemoBanner';

export const Predictions = () => {
  const { user, predictionData, totalExpenses, isBackendConnected } = useFinance();
  const currency = user?.currency || '$';

  return (
    <div>
      {/* Demo Notice Banner */}
      <DemoBanner
        message={
          isBackendConnected
            ? "Live Scikit-Learn Engine Active: Predictions are computed dynamically via linear regression and moving momentum from your actual database records."
            : "Demo ML Predictions: These forecasts illustrate how our Scikit-Learn time-series models project future spending based on seasonal historical clusters once connected to the Flask backend."
        }
      />

      {/* Header Overview */}
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
          marginBottom: '28px',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, var(--brand-forest) 0%, var(--brand-emerald) 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <BrainCircuit size={22} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.35rem', color: 'var(--brand-forest)' }}>
              Machine Learning Expense Forecasting
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span className="stat-badge positive" style={{ fontSize: '0.72rem' }}>
                Scikit-Learn Predictive Model (Simulated)
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Sample Demo Data • 90-day Horizon
              </span>
            </div>
          </div>
        </div>

        <p style={{ fontSize: '0.88rem', color: 'var(--text-body)', lineHeight: 1.6, maxWidth: '900px' }}>
          Our regression algorithm evaluates past expenditure momentum, recurring billing cycles, and seasonal spikes. Below is the projected cash requirement for upcoming months to prevent overdraft and optimize savings.
        </p>
      </div>

      {/* Forecast Chart */}
      <div className="card" style={{ marginBottom: '28px' }}>
        <div className="card-header">
          <div>
            <h3 className="card-title">Projected Monthly Expense Trajectory</h3>
            <div className="card-subtitle">
              Solid line represents recorded history; dashed green area displays ML confidence intervals
            </div>
          </div>
          <span className="stat-badge neutral">Confidence Band: 90%</span>
        </div>

        <div style={{ width: '100%', height: 340 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={predictionData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} domain={[2000, 3500]} />
              <Tooltip
                formatter={(val, name) => [`${currency}${val}`, name]}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: 'var(--border-green)',
                  borderRadius: '8px',
                  boxShadow: 'var(--shadow-card)'
                }}
              />
              <Legend iconType="circle" />
              {/* Actual history bar/line */}
              <Bar dataKey="actual" name="Historical Outflows" fill="#94a3b8" barSize={36} radius={[4, 4, 0, 0]} />
              {/* Predicted trend */}
              <Line
                type="monotone"
                dataKey="predicted"
                name="ML Predicted Outflow"
                stroke="#059669"
                strokeWidth={3}
                strokeDasharray="4 4"
                dot={{ r: 5, fill: '#059669' }}
                activeDot={{ r: 7 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Forecast Cards */}
      <h3 style={{ fontSize: '1.1rem', color: 'var(--brand-forest)', marginBottom: '18px' }}>
        Upcoming Month Estimates
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '28px'
        }}
      >
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, color: 'var(--brand-forest)', fontSize: '1.05rem' }}>December 2026</span>
            <span className="stat-badge positive">88% Confident</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-forest)', marginBottom: '4px' }}>
            {currency}2,890.00
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Expected +13.5% surge driven by anticipated holiday dining, travel expenses, and seasonal shopping.
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, color: 'var(--brand-forest)', fontSize: '1.05rem' }}>January 2027</span>
            <span className="stat-badge positive">82% Confident</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-forest)', marginBottom: '4px' }}>
            {currency}2,720.00
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Stabilization phase as discretionary recreational purchases decline after the new year holidays.
          </p>
        </div>

        <div className="card" style={{ borderLeft: '4px solid #8b5cf6' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontWeight: 800, color: 'var(--brand-forest)', fontSize: '1.05rem' }}>February 2027</span>
            <span className="stat-badge neutral">79% Confident</span>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-forest)', marginBottom: '4px' }}>
            {currency}2,640.00
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Baseline run-rate returns to fixed cost parameters: housing, utilities, and standard nutrition.
          </p>
        </div>
      </div>

      {/* Backend Integration Architecture Note */}
      <div
        className="card"
        style={{
          border: '1.5px dashed var(--border-green)',
          backgroundColor: '#fafefc'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
          <Cpu size={20} color="var(--brand-emerald)" />
          <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: 'var(--brand-forest)' }}>
            Backend ML Pipeline Specification
          </h4>
        </div>
        <p style={{ fontSize: '0.84rem', color: 'var(--text-body)', lineHeight: 1.6 }}>
          When connected to the Flask API endpoint (<code style={{ background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>GET /api/predictions</code>), the model uses <strong style={{ color: 'var(--brand-forest)' }}>scikit-learn LinearRegression & Ridge algorithms</strong> along with historical Pandas data frames to compute real-time dynamic forecasts from your database records.
        </p>
      </div>
    </div>
  );
};
