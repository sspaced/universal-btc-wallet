import { motion } from 'framer-motion';
import React from 'react';

export interface ModernLoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  text?: string;
  showText?: boolean;
}

export const ModernLoadingSpinner: React.FC<ModernLoadingSpinnerProps> = ({
  size = 'medium',
  color = 'var(--modern-accent-primary)',
  text = 'Loading...',
  showText = false
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: 16, height: 16, strokeWidth: 2 };
      case 'large':
        return { width: 32, height: 32, strokeWidth: 3 };
      default:
        return { width: 24, height: 24, strokeWidth: 2.5 };
    }
  };

  const { width, height, strokeWidth } = getSize();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px'
      }}>
      {/* Spinner */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{
          width,
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <svg
          width={width}
          height={height}
          viewBox="0 0 24 24"
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      </motion.div>

      {/* Loading Text */}
      {showText && text && (
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          style={{
            margin: 0,
            fontSize: size === 'small' ? '12px' : size === 'large' ? '16px' : '14px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.8)',
            textAlign: 'center'
          }}>
          {text}
        </motion.p>
      )}
    </motion.div>
  );
};
