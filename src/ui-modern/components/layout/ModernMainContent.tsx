import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

interface ModernMainContentProps {
  children: ReactNode;
  noPadding?: boolean;
}

export const ModernMainContent: React.FC<ModernMainContentProps> = ({ children, noPadding = false }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: noPadding ? '0px' : '88px', // Space for bottom navigation (64px + 8px margin + 16px extra)
        background: 'var(--modern-bg-primary)',
        scrollbarWidth: 'none', // Firefox
        msOverflowStyle: 'none' // IE and Edge
      }}
      className="hide-scrollbar">
      {children}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </motion.div>
  );
};
