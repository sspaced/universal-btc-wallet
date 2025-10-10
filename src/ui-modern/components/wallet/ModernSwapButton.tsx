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
        margin: '-20px 0'
      }}>
      <motion.button
        whileHover={!isDisabled ? { scale: 1.05 } : {}}
        whileTap={!isDisabled ? { scale: 0.95 } : {}}
        onClick={onSwap}
        disabled={isDisabled}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: isDisabled ? 'rgba(255, 255, 255, 0.1)' : 'linear-gradient(135deg, #007aff 0%, #5856d6 100%)',
          border: 'none',
          cursor: isDisabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: isDisabled ? 'none' : '0 8px 32px rgba(0, 122, 255, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
          zIndex: 10,
          position: 'relative',
          opacity: isDisabled ? 0.5 : 1,
          transition: 'all 0.3s ease'
        }}>
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid #ffffff',
              borderRadius: '50%'
            }}
          />
        ) : (
          <motion.div
            style={{
              color: '#ffffff',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
              transform: 'rotate(90deg)'
            }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </motion.div>
        )}
      </motion.button>

      {/* Glow effect */}
      {!isDisabled && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            position: 'absolute',
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 122, 255, 0.2) 0%, transparent 70%)',
            zIndex: 1
          }}
        />
      )}
    </motion.div>
  );
};
