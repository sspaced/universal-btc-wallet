import { motion } from 'framer-motion';
import React from 'react';

export interface ModernRFBToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  disabled?: boolean;
  title?: string;
  description?: string;
}

export const ModernRFBToggle: React.FC<ModernRFBToggleProps> = ({
  enabled,
  onToggle,
  disabled = false,
  title = 'Replace-By-Fee (RBF)',
  description = 'Allow fee bumping after sending'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px',
        backdropFilter: 'blur(10px)'
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '4px'
            }}>
            {title}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.6)',
              lineHeight: '1.4'
            }}>
            {description}
          </motion.div>
        </div>

        <motion.button
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={() => !disabled && onToggle(!enabled)}
          disabled={disabled}
          style={{
            width: '44px',
            height: '24px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: enabled ? 'var(--modern-accent-primary)' : 'rgba(255, 255, 255, 0.2)',
            cursor: disabled ? 'not-allowed' : 'pointer',
            position: 'relative',
            transition: 'background-color 0.2s ease',
            opacity: disabled ? 0.5 : 1
          }}>
          <motion.div
            animate={{ x: enabled ? 22 : 2 }}
            transition={{
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: '#ffffff',
              position: 'absolute',
              top: '2px',
              left: '2px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
            }}
          />
        </motion.button>
      </div>

      {/* Info icon with tooltip */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: 'rgba(52, 199, 89, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(52, 199, 89, 0.2)'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#34c759"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <span
            style={{
              fontSize: '11px',
              color: '#34c759',
              fontWeight: '500'
            }}>
            RBF allows you to increase the fee after sending if the transaction is taking too long to confirm.
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
