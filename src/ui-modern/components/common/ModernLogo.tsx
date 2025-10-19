import { motion } from 'framer-motion';
import React from 'react';

export interface ModernLogoProps {
  size?: 'small' | 'medium' | 'large';
  color?: 'white' | 'black' | 'blue';
  className?: string;
  animated?: boolean;
}

const sizeClasses = {
  small: { width: '24px', height: '24px' },
  medium: { width: '32px', height: '32px' },
  large: { width: '48px', height: '48px' }
};

const colorClasses = {
  white: { color: 'white' },
  black: { color: 'black' },
  blue: { color: 'var(--modern-accent-primary)' }
};

export const ModernLogo: React.FC<ModernLogoProps> = ({
  size = 'medium',
  color = 'black',
  className = '',
  animated = false
}) => {
  const logoStyle = {
    ...sizeClasses[size],
    ...colorClasses[color]
  };

  const LogoComponent = animated ? motion.div : 'div';
  const motionProps = animated
    ? {
        initial: { scale: 0.8, opacity: 0 },
        animate: { scale: 1, opacity: 1 },
        transition: { delay: 0.2, duration: 0.5 }
      }
    : {};

  return (
    <LogoComponent style={logoStyle} {...motionProps}>
      <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '100%', height: '100%' }}>
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
      </svg>
    </LogoComponent>
  );
};
