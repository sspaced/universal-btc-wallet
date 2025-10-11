import { motion } from 'framer-motion';
import React from 'react';

export interface ModernHeaderProps {
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  showBackButton?: boolean;
  rightElement?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const ModernHeader: React.FC<ModernHeaderProps> = ({
  title,
  subtitle,
  onBack,
  showBackButton = false,
  rightElement,
  className = '',
  style = {}
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`modern-header ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        backgroundColor: 'var(--modern-bg-primary)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        ...style
      }}>
      {/* Left side - Back button */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '44px' }}>
        {showBackButton && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--modern-bg-secondary)',
              border: 'none',
              cursor: 'pointer',
              color: '#ffffff'
            }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 19l-7-7 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.button>
        )}
      </div>

      {/* Center - Title and subtitle */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: 1,
          textAlign: 'center'
        }}>
        {title && (
          <h1
            style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#ffffff',
              margin: 0,
              letterSpacing: '-0.3px'
            }}>
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: '2px 0 0 0',
              fontWeight: '400'
            }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Right side - Custom element */}
      <div style={{ display: 'flex', alignItems: 'center', minWidth: '44px', justifyContent: 'flex-end' }}>
        {rightElement}
      </div>
    </motion.div>
  );
};
