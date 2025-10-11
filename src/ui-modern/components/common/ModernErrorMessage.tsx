import { motion } from 'framer-motion';
import React from 'react';

export interface ModernErrorMessageProps {
  message: string;
  type?: 'error' | 'warning' | 'info';
  onDismiss?: () => void;
  showIcon?: boolean;
}

export const ModernErrorMessage: React.FC<ModernErrorMessageProps> = ({
  message,
  type = 'error',
  onDismiss,
  showIcon = true
}) => {
  const getColors = () => {
    switch (type) {
      case 'error':
        return {
          background: 'rgba(255, 59, 48, 0.1)',
          border: 'rgba(255, 59, 48, 0.3)',
          text: '#ff3b30',
          icon: '#ff3b30'
        };
      case 'warning':
        return {
          background: 'rgba(255, 149, 0, 0.1)',
          border: 'rgba(255, 149, 0, 0.3)',
          text: '#ff9500',
          icon: '#ff9500'
        };
      case 'info':
        return {
          background: 'rgba(114, 227, 173, 0.1)',
          border: 'rgba(114, 227, 173, 0.3)',
          text: 'var(--modern-accent-primary)',
          icon: 'var(--modern-accent-primary)'
        };
      default:
        return {
          background: 'rgba(255, 59, 48, 0.1)',
          border: 'rgba(255, 59, 48, 0.3)',
          text: '#ff3b30',
          icon: '#ff3b30'
        };
    }
  };

  const colors = getColors();

  const getIcon = () => {
    switch (type) {
      case 'error':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.icon}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        );
      case 'warning':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.icon}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke={colors.icon}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        backgroundColor: colors.background,
        border: `1px solid ${colors.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(10px)'
      }}>
      {showIcon && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.2 }}>
          {getIcon()}
        </motion.div>
      )}

      <div style={{ flex: 1 }}>
        <motion.p
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.3 }}
          style={{
            margin: 0,
            fontSize: '14px',
            fontWeight: '500',
            color: colors.text,
            lineHeight: '1.4'
          }}>
          {message}
        </motion.p>
      </div>

      {onDismiss && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: colors.text,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
};
