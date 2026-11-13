import React from 'react';
import { Inbox, Plus } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Records Found',
  description = 'There are no items matching your criteria yet.',
  actionText,
  onAction
}) => {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-subtle)',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px dashed var(--border-green)',
        margin: '16px 0'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--brand-emerald)',
          marginBottom: '16px',
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.12)'
        }}
      >
        <Icon size={26} />
      </div>

      <h4 style={{ fontSize: '1.1rem', color: 'var(--brand-forest)', marginBottom: '6px' }}>
        {title}
      </h4>
      <p style={{ fontSize: '0.86rem', color: 'var(--text-muted)', maxWidth: '380px', marginBottom: actionText ? '20px' : '0' }}>
        {description}
      </p>

      {actionText && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          <Plus size={16} />
          <span>{actionText}</span>
        </button>
      )}
    </div>
  );
};
