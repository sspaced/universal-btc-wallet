import { motion } from 'framer-motion';
import React from 'react';

export interface ModernSuccessMessageProps {
  message: string;
  onDismiss?: () => void;
  showIcon?: boolean;
  autoHide?: boolean;
  autoHideDelay?: number;
}

export const ModernSuccessMessage: React.FC<ModernSuccessMessageProps> = ({
  message,
  onDismiss,
  showIcon = true,
  autoHide = false,
  autoHideDelay = 3000
}) => {
  React.useEffect(() => {
    if (autoHide && onDismiss) {
      const timer = setTimeout(() => {
        onDismiss();
      }, autoHideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, autoHideDelay, onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        backgroundColor: 'rgba(52, 199, 89, 0.1)',
        border: '1px solid rgba(52, 199, 89, 0.3)',
        borderRadius: '8px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        backdropFilter: 'blur(10px)'
      }}>
      {showIcon && (
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, duration: 0.2 }}>
          <motion.svg
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34C759"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </motion.svg>
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
            color: '#34C759',
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
            color: '#34C759',
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
