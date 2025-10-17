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
        backgroundColor: selected ? 'rgba(114, 227, 173, 0.1)' : 'var(--modern-bg-tertiary)',
        border: 'none',
        borderRadius: '8px',
        cursor: onClick || copyable ? 'pointer' : 'default',
        transition: 'all 0.2s',
        height: '44px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(10px)'
      }}
      className={onClick || copyable ? 'hover-lift' : ''}>
      {/* Index number */}
      <div
        style={{
          position: 'absolute',
          top: '6px',
          fontSize: '10px',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.5)',
          letterSpacing: '-0.08px'
        }}>
        {index + 1}
      </div>

      {/* Word */}
      <div
        style={{
          fontSize: '11px',
          fontWeight: '500',
          color: '#ffffff',
          textAlign: 'center',
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          letterSpacing: '0.01em',
          filter: blurred ? 'blur(4px)' : 'none',
          userSelect: 'text',
          WebkitUserSelect: 'text',
          wordBreak: 'break-word',
          marginTop: '8px'
        }}>
        {word || '(empty)'}
      </div>
    </motion.div>
  );
};
