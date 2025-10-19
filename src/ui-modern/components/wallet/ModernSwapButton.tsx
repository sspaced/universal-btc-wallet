import { motion } from 'framer-motion';
import React from 'react';

interface ModernSwapButtonProps {
  onSwap: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const ModernSwapButton: React.FC<ModernSwapButtonProps> = ({ onSwap, disabled = false, loading = false }) => {
  const isDisabled = disabled || loading;

  return (
    <motion.div
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        margin: '-24px 0'
      }}>
      <motion.button
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        onClick={onSwap}
        disabled={isDisabled}
        style={{
          width: '45px',
          height: '45px',
          borderRadius: '13px',
          background: '#242424',
          border: '4px solid #121212',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'none',
          position: 'relative',
          opacity: isDisabled ? 0.6 : 1,
          transition: 'all 0.3s ease'
        }}>
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%'
            }}
          />
        ) : (
          <motion.div style={{ color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 5v14m0 0l4-4m-4 4l-4-4" />
            </svg>
          </motion.div>
        )}
      </motion.button>

      {/* No glow for the modern dark pill design */}
    </motion.div>
  );
};
