import { motion } from 'framer-motion';
import React from 'react';

export interface ModernButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary' | 'destructive' | 'plain';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  'data-testid'?: string;
}

// Apple's exact button styling
const baseClasses = 'apple-button';

const variantClasses = {
  primary: 'apple-button-primary',
  secondary: 'apple-button-secondary',
  tertiary: 'apple-button-tertiary',
  destructive: 'apple-button-destructive',
  plain: 'apple-button-plain'
};

const sizeClasses = {
  small: 'apple-button-small',
  medium: 'apple-button-medium',
  large: 'apple-button-large'
};

export const ModernButton: React.FC<ModernButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  className = '',
  style = {},
  'data-testid': testId,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const classes = [baseClasses, variantClasses[variant], sizeClasses[size], className].filter(Boolean).join(' ');

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    outline: 'none',
    opacity: isDisabled ? 0.4 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    width: fullWidth ? '100%' : 'auto',
    fontWeight: '600',
    ...style
  };

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <motion.button
      className={classes}
      style={buttonStyle}
      onClick={handleClick}
      disabled={isDisabled}
      type={type}
      data-testid={testId}
      whileHover={!isDisabled ? { scale: 1.01 } : {}}
      whileTap={!isDisabled ? { scale: 0.97 } : {}}
      transition={{ duration: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}>
      {leftIcon && !loading && <span style={{ marginRight: '8px', flexShrink: 0 }}>{leftIcon}</span>}

      {loading && (
        <div
          style={{
            marginRight: '8px',
            height: '16px',
            width: '16px',
            borderRadius: '50%',
            border: '2px solid white',
            borderTop: '2px solid transparent',
            animation: 'spin 1s linear infinite'
          }}
        />
      )}

      <span style={{ flex: leftIcon || rightIcon ? 1 : 'none' }}>{children}</span>

      {rightIcon && !loading && <span style={{ marginLeft: '8px', flexShrink: 0 }}>{rightIcon}</span>}
    </motion.button>
  );
};
