import React from 'react';

export interface LogoProps {
  className?: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'white' | 'dark' | 'blue';
}

const sizeClasses = {
  small: 'w-4 h-4',
  medium: 'w-6 h-6',
  large: 'w-8 h-8'
};

const colorStyles = {
  white: '#FFFFFF',
  dark: '#000000',
  blue: 'var(--apple-blue)'
};

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'medium',
  color = 'white'
}) => {
  const fillColor = colorStyles[color];

  return (
    <svg
      className={`${sizeClasses[size]} ${className}`}
      viewBox="0 0 18.85 11.01"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Universal Wallet Logo"
    >
      <path
        d="m9.42,0C4.22,0,0,2.46,0,5.5s4.22,5.5,9.42,5.5,9.42-2.46,9.42-5.5S14.63,0,9.42,0Zm0,9.82c-3.64,0-6.58-1.93-6.58-4.31S5.79,1.19,9.42,1.19s6.58,1.93,6.58,4.31-2.95,4.31-6.58,4.31Z"
        fill={fillColor}
      />
    </svg>
  );
};