import { motion } from 'framer-motion';
import React from 'react';

import { ModernWordBox } from './ModernWordBox';

export interface ModernRecoveryGridProps {
  words: string[];
  onWordClick?: (word: string, index: number) => void;
  selectedIndices?: number[];
  copyable?: boolean;
  blurred?: boolean;
  title?: string;
  showCopyButton?: boolean;
  onCopyAll?: () => void;
}

export const ModernRecoveryGrid: React.FC<ModernRecoveryGridProps> = ({
  words,
  onWordClick,
  selectedIndices = [],
  copyable = false,
  blurred = false,
  title = 'Recovery Phrase',
  showCopyButton = false,
  onCopyAll
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  return (
    <div
      style={{
        width: '100%',
        padding: '14px',
        backgroundColor: 'var(--modern-bg-secondary)',
        borderRadius: '10px',
        border: 'none'
      }}>
      {/* Title */}
      {title && (
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '12px',
            textAlign: 'center',
            letterSpacing: '-0.3px'
          }}>
          {title}
        </h3>
      )}

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '8px',
          marginBottom: showCopyButton ? '12px' : '0'
        }}>
        {words.map((word, index) => (
          <motion.div key={index} variants={itemVariants}>
            <ModernWordBox
              word={word}
              index={index}
              selected={selectedIndices.includes(index)}
              onClick={onWordClick ? () => onWordClick(word, index) : undefined}
              copyable={copyable}
              blurred={blurred}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Copy All Button - Integrated */}
      {showCopyButton && onCopyAll && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.3 }}
          onClick={onCopyAll}
          style={{
            width: '100%',
            padding: '10px 16px',
            backgroundColor: 'var(--modern-bg-tertiary)',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            letterSpacing: '-0.08px',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(114, 227, 173, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--modern-bg-tertiary)';
          }}
          onMouseDown={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(114, 227, 173, 0.15)';
          }}
          onMouseUp={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(114, 227, 173, 0.1)';
          }}>
          Copy All Words
        </motion.button>
      )}
    </div>
  );
};
