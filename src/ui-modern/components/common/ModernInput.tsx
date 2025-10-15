import { motion } from 'framer-motion';
import React, { forwardRef } from 'react';

interface ModernInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  error?: boolean;
  helperText?: string;
}

export const ModernInput = forwardRef<HTMLInputElement, ModernInputProps>(
  (
    {
      variant = 'primary',
      size = 'medium',
      fullWidth = true,
      error = false,
      helperText,
      className = '',
      style = {},
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'primary':
          return {
            background: 'var(--modern-bg-secondary)',
            border: error ? '1px solid #ff4757' : '1px solid rgba(255, 255, 255, 0.1)',
            color: 'white'
          };
        case 'secondary':
          return {
            background: 'rgba(255, 255, 255, 0.05)',
            border: error ? '1px solid #ff4757' : '1px solid rgba(255, 255, 255, 0.05)',
            color: 'rgba(255, 255, 255, 0.8)'
          };
        default:
          return {};
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'small':
          return {
            padding: '8px 12px',
            fontSize: '14px',
            height: '36px'
          };
        case 'medium':
          return {
            padding: '12px 16px',
            fontSize: '15px',
            height: '44px'
          };
        case 'large':
          return {
            padding: '16px 20px',
            fontSize: '16px',
            height: '52px'
          };
        default:
          return {};
      }
    };

    const baseStyles = {
      borderRadius: '8px',
      outline: 'none',
      transition: 'all 0.3s ease',
      fontFamily:
        '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif',
      width: fullWidth ? '100%' : 'auto',
      ...getVariantStyles(),
      ...getSizeStyles(),
      ...style
    };

    const focusStyles = {
      border: error ? '1px solid #ff4757' : '1px solid var(--modern-accent-primary)',
      boxShadow: error ? '0 0 0 3px rgba(255, 71, 87, 0.1)' : '0 0 0 3px rgba(114, 227, 173, 0.1)'
    };

    return (
      <div style={{ width: fullWidth ? '100%' : 'auto' }}>
        <motion.input
          ref={ref}
          className={`modern-input ${className}`}
          style={baseStyles}
          whileFocus={focusStyles}
          placeholder={props.placeholder}
          {...props}
        />
        {helperText && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: '12px',
              color: error ? '#ff4757' : 'rgba(255, 255, 255, 0.6)',
              marginTop: '4px',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
            }}>
            {helperText}
          </motion.div>
        )}
      </div>
    );
  }
);

ModernInput.displayName = 'ModernInput';
