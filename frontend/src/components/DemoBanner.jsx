import React from 'react';
import { Sparkles, Info } from 'lucide-react';

export const DemoBanner = ({ message, actionText, onAction }) => {
  return (
    <div className="demo-banner">
      <div className="demo-banner-content">
        <span className="demo-pill">Internship Demo</span>
        <span>
          {message ||
            'Currently running with interactive client-side demo state. Connected to configurable Flask REST API when live.'}
        </span>
      </div>

      {actionText && onAction && (
        <button
          onClick={onAction}
          className="btn btn-secondary btn-sm"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
