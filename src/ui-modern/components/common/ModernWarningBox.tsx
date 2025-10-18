import { motion } from 'framer-motion';
import React from 'react';

export interface ModernWarningBoxProps {
  title?: string;
  message: string | React.ReactNode;
  variant?: 'warning' | 'danger' | 'info';
  icon?: React.ReactNode;
  items?: string[];
  children?: React.ReactNode;
}

export const ModernWarningBox: React.FC<ModernWarningBoxProps> = ({
  title,
  message,
  variant = 'warning',
  icon,
  items,
  children
}) => {
  const colors = {
    warning: {
      bg: 'rgba(255, 159, 10, 0.1)',
      border: 'rgba(255, 159, 10, 0.3)',
      text: '#FF9F0A',
      icon: '⚠️'
    },
    danger: {
      bg: 'rgba(255, 59, 48, 0.1)',
      border: 'rgba(255, 59, 48, 0.3)',
      text: '#FF3B30',
      icon: '🚨'
    },
    info: {
      bg: 'rgba(10, 132, 255, 0.1)',
      border: 'rgba(10, 132, 255, 0.3)',
      text: '#0A84FF',
      icon: 'ℹ️'
    }
  };

  const currentColor = colors[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: currentColor.bg,
        border: `1px solid ${currentColor.border}`,
        borderRadius: '12px',
        padding: '16px',
        marginBottom: '16px'
      }}>
      <div style={{ display: 'flex', gap: '12px' }}>
        {/* Icon */}
        <div style={{ fontSize: '20px', flexShrink: 0 }}>{icon || currentColor.icon}</div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {title && (
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: currentColor.text,
                marginBottom: '8px',
                letterSpacing: '-0.022em'
              }}>
              {title}
            </div>
          )}

          <div
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.8)',
              lineHeight: '1.5',
              letterSpacing: '-0.022em'
            }}>
            {message}
          </div>

          {items && items.length > 0 && (
            <ul
              style={{
                marginTop: '12px',
                marginBottom: 0,
                paddingLeft: '20px',
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.6'
              }}>
              {items.map((item, index) => (
                <li key={index} style={{ marginBottom: '6px' }}>
                  {item}
                </li>
              ))}
            </ul>
          )}

          {children && <div style={{ marginTop: '12px' }}>{children}</div>}
        </div>
      </div>
    </motion.div>
  );
};

