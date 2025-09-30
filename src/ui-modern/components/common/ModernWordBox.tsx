import { motion } from 'framer-motion';
import React from 'react';

export interface ModernWordBoxProps {
  word: string;
  index: number;
  selected?: boolean;
  onClick?: () => void;
  copyable?: boolean;
  blurred?: boolean;
}

export const ModernWordBox: React.FC<ModernWordBoxProps> = ({
  word,
  index,
  selected = false,
  onClick,
  copyable = false,
  blurred = false
}) => {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (copyable) {
      navigator.clipboard.writeText(word);
    }
  };

  return (
    <motion.div
      whileHover={onClick || copyable ? { scale: 1.02, y: -2 } : {}}
      whileTap={onClick || copyable ? { scale: 0.98 } : {}}
      transition={{ duration: 0.15 }}
      onClick={handleClick}
      style={{
        position: 'relative',
        padding: '6px 8px',
        backgroundColor: selected ? 'rgba(0, 122, 255, 0.1)' : 'rgba(255, 255, 255, 0.08)',
        border: selected ? '1.5px solid rgba(0, 122, 255, 0.5)' : '1.5px solid rgba(255, 255, 255, 0.15)',
        borderRadius: '8px',
        cursor: onClick || copyable ? 'pointer' : 'default',
        transition: 'all 0.2s',
        height: '36px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        backdropFilter: 'blur(10px)'
      }}
      className={onClick || copyable ? 'hover-lift' : ''}>
      {/* Index number */}
      <div
        style={{
          position: 'absolute',
          top: '4px',
          left: '6px',
          fontSize: '9px',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.4)',
          letterSpacing: '-0.08px'
        }}>
        {index + 1}
      </div>

      {/* Word */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: '500',
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: "'SF Mono', 'Monaco', 'Courier New', monospace",
          letterSpacing: '0.01em',
          filter: blurred ? 'blur(4px)' : 'none',
          userSelect: 'none'
        }}>
        {word}
      </div>
    </motion.div>
  );
};
