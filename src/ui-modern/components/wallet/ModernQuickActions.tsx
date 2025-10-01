import { motion } from 'framer-motion';
import React from 'react';

interface ActionButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ModernQuickActionsProps {
  onSend: () => void;
  onReceive: () => void;
  onBuy: () => void;
  onExchange: () => void;
}

export const ModernQuickActions: React.FC<ModernQuickActionsProps> = ({
  onSend,
  onReceive,
  onBuy,
  onExchange,
}) => {
  const actions: ActionButton[] = [
    {
      id: 'receive',
      label: 'Receive',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4"
          />
        </svg>
      ),
      onClick: onReceive,
    },
    {
      id: 'send',
      label: 'Send',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8l4 4m0 0l-4 4m4-4H3"
          />
        </svg>
      ),
      onClick: onSend,
    },
    {
      id: 'exchange',
      label: 'Exchange',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      ),
      onClick: onExchange,
      disabled: false, // Neutre pour l'instant
    },
    {
      id: 'buy',
      label: 'Buy',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      onClick: onBuy,
    },
  ];

  return (
    <div
      style={{
        padding: '0 20px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}
      >
        {actions.map((action) => (
          <motion.button
            key={action.id}
            whileTap={{ scale: action.disabled ? 1 : 0.95 }}
            onClick={action.onClick}
            disabled={action.disabled}
            style={{
              background: action.disabled
                ? 'rgba(255, 255, 255, 0.03)'
                : 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              padding: '16px 8px',
              cursor: action.disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
              opacity: action.disabled ? 0.5 : 1,
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: action.disabled
                  ? 'rgba(255, 255, 255, 0.05)'
                  : 'linear-gradient(135deg, rgba(0, 122, 255, 0.2) 0%, rgba(0, 122, 255, 0.1) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: action.disabled ? 'rgba(255, 255, 255, 0.3)' : '#007aff',
                transition: 'all 0.2s ease',
              }}
            >
              {action.icon}
            </div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: action.disabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
              }}
            >
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
