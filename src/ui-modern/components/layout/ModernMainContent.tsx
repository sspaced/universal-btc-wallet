import { motion } from 'framer-motion';
import React, { ReactNode } from 'react';

interface ModernMainContentProps {
  children: ReactNode;
}

export const ModernMainContent: React.FC<ModernMainContentProps> = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        paddingBottom: '80px', // Space for bottom navigation
        background: '#000000',
      }}
      className="hide-scrollbar"
    >
      {children}
      <style jsx>{`
        .hide-scrollbar {
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }
      `}</style>
    </motion.div>
  );
};
