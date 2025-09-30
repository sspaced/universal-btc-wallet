import React from 'react';
import { motion } from 'framer-motion';

export interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  'data-testid'?: string;
}

const baseClasses = 'rounded-2xl transition-all duration-200';

const variantClasses = {
  default: 'bg-white dark:bg-gray-900 shadow-sm border border-gray-200 dark:border-gray-800',
  outlined: 'bg-transparent border-2 border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-900 shadow-xl border border-gray-100 dark:border-gray-800',
  glass: 'bg-white/10 dark:bg-gray-900/10 backdrop-blur-xl border border-white/20 dark:border-gray-700/30'
};

const paddingClasses = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
  xl: 'p-8'
};

const hoverClasses = 'hover:shadow-lg hover:-translate-y-1 cursor-pointer';

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'md',
  className = '',
  hover = false,
  onClick,
  'data-testid': testId,
  ...props
}) => {
  const isClickable = !!onClick || hover;

  const classes = [
    baseClasses,
    variantClasses[variant],
    paddingClasses[padding],
    isClickable ? hoverClasses : '',
    className
  ].filter(Boolean).join(' ');

  const Component = motion.div;

  return (
    <Component
      className={classes}
      onClick={onClick}
      data-testid={testId}
      whileHover={isClickable ? {
        scale: 1.02,
        transition: { duration: 0.2 }
      } : {}}
      whileTap={isClickable ? {
        scale: 0.98,
        transition: { duration: 0.1 }
      } : {}}
      {...props}
    >
      {children}
    </Component>
  );
};