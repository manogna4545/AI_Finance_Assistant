import React from 'react';
import { Menu, Sparkles, PlusCircle } from 'lucide-react';

export const MobileHeader = ({ onMenuClick, onQuickAdd, pageTitle }) => {
  return (
    <header className="mobile-header">
      <button
        onClick={onMenuClick}
        className="topbar-btn"
        aria-label="Open navigation menu"
      >
        <Menu size={22} color="var(--brand-forest)" />
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div
          className="brand-icon-wrapper"
          style={{ width: '32px', height: '32px' }}
        >
          <Sparkles size={16} />
        </div>
        <span
          style={{
            fontWeight: 800,
            fontSize: '1rem',
            color: 'var(--brand-forest)'
          }}
        >
          {pageTitle || 'AI Finance'}
        </span>
      </div>

      <button
        onClick={onQuickAdd}
        className="btn btn-primary btn-sm"
        style={{ padding: '6px 10px' }}
        aria-label="Add transaction"
      >
        <PlusCircle size={16} />
        <span>Add</span>
      </button>
    </header>
  );
};
