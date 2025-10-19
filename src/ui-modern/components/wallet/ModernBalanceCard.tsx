import { motion } from 'framer-motion';
import React from 'react';

import { satoshisToAmount } from '@/ui/utils';

export interface ModernBalanceCardProps {
  availableBalance: number; // in satoshis
  unavailableBalance?: number; // in satoshis
  btcUnit?: string;
  showUnavailable?: boolean;
  onUnlockClick?: () => void;
  canUnlock?: boolean;
  unavailableTooltip?: string;
}

export const ModernBalanceCard: React.FC<ModernBalanceCardProps> = ({
  availableBalance,
  unavailableBalance = 0,
  btcUnit = 'BTC',
  showUnavailable = false,
  onUnlockClick,
  canUnlock = true,
  unavailableTooltip = 'These funds are locked and cannot be spent'
}) => {
  const availableAmount = satoshisToAmount(availableBalance);
  const unavailableAmount = satoshisToAmount(unavailableBalance);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px',
        backdropFilter: 'blur(10px)'
      }}>
      {/* Available Balance */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: showUnavailable ? '12px' : '0'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#34C759'
            }}
          />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#ffffff' }}>Available</span>
        </div>
        <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>
          {availableAmount} {btcUnit}
        </span>
      </motion.div>

      {/* Unavailable Balance */}
      {showUnavailable && unavailableBalance > 0 && (
        <>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            style={{
              height: '1px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              margin: '12px 0',
              transformOrigin: 'left'
            }}
          />

          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255, 255, 255, 0.5)'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ fontSize: '14px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.7)' }}>
                  Unavailable
                </span>
                <motion.div
                  whileHover={{ scale: 1.2 }}
                  style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'help'
                  }}
                  title={unavailableTooltip}>
                  <span style={{ fontSize: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>?</span>
                </motion.div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)' }}>
                {unavailableAmount} {btcUnit}
              </span>

              {canUnlock && onUnlockClick && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onUnlockClick}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--modern-accent-primary)',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(114, 227, 173, 0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(114, 227, 173, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(114, 227, 173, 0.1)';
                  }}>
                  Unlock
                </motion.button>
              )}
            </div>
          </motion.div>
        </>
      )}

      {/* Total Balance Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        style={{
          marginTop: '12px',
          paddingTop: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
        <span style={{ fontSize: '13px', fontWeight: '600', color: 'rgba(255, 255, 255, 0.8)' }}>Total Balance</span>
        <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.8)', fontWeight: '500' }}>
          {satoshisToAmount(availableBalance + unavailableBalance)} {btcUnit}
        </span>
      </motion.div>
    </motion.div>
  );
};
