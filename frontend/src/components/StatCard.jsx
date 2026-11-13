import React from 'react';

export const StatCard = ({
  icon: Icon,
  type = 'balance',
  title,
  value,
  subtext,
  badgeText,
  badgeStatus = 'neutral'
}) => {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className={`stat-icon-wrapper ${type}`}>
          {Icon && <Icon size={22} />}
        </div>
        {badgeText && (
          <span className={`stat-badge ${badgeStatus}`}>
            {badgeText}
          </span>
        )}
      </div>

      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{title}</div>
        {subtext && (
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            {subtext}
          </div>
        )}
      </div>
    </div>
  );
};
