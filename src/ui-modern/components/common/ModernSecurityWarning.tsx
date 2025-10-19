import { motion } from 'framer-motion';
import React from 'react';

import { WarningIcon } from './Icons';

export interface ModernSecurityWarningProps {
  title?: string;
  message: string;
  variant?: 'warning' | 'error' | 'info';
  icon?: React.ReactNode;
  className?: string;
}

export const ModernSecurityWarning: React.FC<ModernSecurityWarningProps> = ({
  title,
  message,
  variant = 'warning',
  icon,
  className = ''
}) => {
  const getColors = () => {
    switch (variant) {
      case 'error':
        return {
          border: 'rgba(255, 59, 48, 0.5)',
          background: 'rgba(255, 59, 48, 0.08)',
          icon: '#ff3b30',
          text: 'rgba(255, 255, 255, 0.9)'
        };
      case 'info':
        return {
          border: 'rgba(114, 227, 173, 0.5)',
          background: 'rgba(114, 227, 173, 0.08)',
          icon: 'var(--modern-accent-primary)',
          text: 'rgba(255, 255, 255, 0.9)'
        };
      case 'warning':
      default:
        return {
          border: 'rgba(255, 204, 0, 0.5)',
          background: 'rgba(255, 204, 0, 0.08)',
          icon: '#ffcc00',
          text: 'rgba(255, 255, 255, 0.9)'
        };
    }
  };

  const colors = getColors();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
      style={{
        padding: '8px 10px',
        backgroundColor: colors.background,
        border: `1.5px solid ${colors.border}`,
        borderRadius: '8px',
        display: 'flex',
        gap: '8px',
        backdropFilter: 'blur(10px)'
      }}>
      {/* Icon */}
      <div
        style={{
          flexShrink: 0,
          width: '16px',
          height: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: colors.icon
        }}>
        {icon || <WarningIcon style={{ width: '16px', height: '16px' }} />}
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        {title && (
          <div
            style={{
              fontSize: '12px',
              fontWeight: '600',
              color: colors.text,
              marginBottom: '1px',
              letterSpacing: '-0.08px'
            }}>
            {title}
          </div>
        )}
        <div
          style={{
            fontSize: '11px',
            fontWeight: '400',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.3',
            letterSpacing: '-0.08px'
          }}>
          {message}
        </div>
      </div>
    </motion.div>
  );
};
