import { motion } from 'framer-motion';
import React from 'react';

export interface ModernAddressTypeCardProps {
  label: string;
  address: string;
  checked: boolean;
  balance?: string;
  inscriptionCount?: number;
  onClick?: () => void;
  loading?: boolean;
}

export const ModernAddressTypeCard: React.FC<ModernAddressTypeCardProps> = ({
  label,
  address,
  checked,
  balance,
  inscriptionCount,
  onClick,
  loading = false
}) => {
  const hasAssets =
    balance && balance !== '--' && balance !== '0' && balance !== '0.00000000' && parseFloat(balance) > 0;

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.01, y: -2 } : {}}
      whileTap={onClick ? { scale: 0.99 } : {}}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      style={{
        width: '100%',
        padding: '16px',
        backgroundColor: 'var(--modern-bg-secondary)',
        border: checked ? '2px solid var(--modern-accent-primary)' : '2px solid var(--modern-border-color)',
        borderRadius: '8px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s',
        backdropFilter: 'blur(10px)'
      }}>
      {/* Header with label */}
      <div
        style={{
          marginBottom: '8px'
        }}>
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#ffffff',
            letterSpacing: '-0.2px'
          }}>
          {label}
        </div>
      </div>

      {/* Address */}
      <div
        style={{
          fontSize: '12px',
          fontWeight: '400',
          color: 'rgba(255, 255, 255, 0.6)',
          fontFamily: '\'SF Mono\', \'Monaco\', \'Courier New\', monospace',
          marginBottom: hasAssets ? '12px' : '0',
          wordBreak: 'break-all',
          letterSpacing: '-0.1px'
        }}>
        {address || (loading ? 'Loading...' : '--')}
      </div>

      {/* Assets section */}
      {hasAssets && balance && parseFloat(balance) > 0 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '10px 12px',
            backgroundColor: 'var(--modern-bg-tertiary)',
            borderRadius: '8px'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                letterSpacing: '-0.2px'
              }}>
              {balance} BTC
            </span>
          </div>
          {inscriptionCount && inscriptionCount > 0 && (
            <span
              style={{
                fontSize: '12px',
                fontWeight: '600',
                color: 'var(--modern-accent-primary)',
                letterSpacing: '-0.1px'
              }}>
              {inscriptionCount} Inscriptions
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
