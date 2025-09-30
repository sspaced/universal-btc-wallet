import { motion } from 'framer-motion';
import React from 'react';

export interface ModernCardProps {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  'data-testid'?: string;
}

const paddingClasses = {
  none: { padding: '0' },
  sm: { padding: '12px' },
  md: { padding: '16px' },
  lg: { padding: '24px' },
  xl: { padding: '32px' }
};

export const ModernCard: React.FC<ModernCardProps> = ({
  children,
  padding = 'md',
  className = '',
  onClick,
  hoverable = false,
  'data-testid': testId,
  ...props
}) => {
  const classes = ['apple-card', className].filter(Boolean).join(' ');

  const cardStyle = {
    ...paddingClasses[padding],
    cursor: onClick ? 'pointer' : 'default'
  };

  const CardComponent = hoverable ? motion.div : 'div';
  const motionProps = hoverable
    ? {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
        transition: { duration: 0.1 }
      }
    : {};

  return (
    <CardComponent
      className={classes}
      style={cardStyle}
      onClick={onClick}
      data-testid={testId}
      {...motionProps}
      {...props}>
      {children}
    </CardComponent>
  );
};
