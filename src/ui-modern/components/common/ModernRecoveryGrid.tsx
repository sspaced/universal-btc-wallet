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
}

export const ModernRecoveryGrid: React.FC<ModernRecoveryGridProps> = ({
  words,
  onWordClick,
  selectedIndices = [],
  copyable = false,
  blurred = false,
  title = 'Recovery Phrase'
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
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
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
          gap: '8px'
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
    </div>
  );
};
