import React from 'react';

export interface ButtonProps {
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
  'data-testid'?: string;
}

// Apple's exact button styling
const baseClasses = 'apple-button inline-flex items-center justify-center border-0 cursor-pointer outline-none disabled:opacity-50 disabled:cursor-not-allowed';

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

export const Button: React.FC<ButtonProps> = ({
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
  'data-testid': testId,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const classes = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    fullWidth ? 'w-full' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (!isDisabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      className={classes}
      onClick={handleClick}
      disabled={isDisabled}
      type={type}
      data-testid={testId}
      {...props}
    >
      {leftIcon && !loading && (
        <span className="mr-2 flex-shrink-0">
          {leftIcon}
        </span>
      )}

      {loading && (
        <div className="mr-2 h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
      )}

      <span className={`${leftIcon || rightIcon ? 'flex-1' : ''}`}>
        {children}
      </span>

      {rightIcon && !loading && (
        <span className="ml-2 flex-shrink-0">
          {rightIcon}
        </span>
      )}
    </button>
  );
};