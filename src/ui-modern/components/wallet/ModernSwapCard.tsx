import { motion } from 'framer-motion';
import React from 'react';

import { ModernInput } from '../common/ModernInput';
import { Currency, ModernCurrencySelector } from './ModernCurrencySelector';

interface ModernSwapCardProps {
  type: 'pay' | 'receive';
  amount: string;
  onAmountChange: (amount: string) => void;
  selectedCurrency: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  availableCurrencies: Currency[];
  label: string;
  placeholder?: string;
  disabled?: boolean;
  showQuickAmounts?: boolean;
  onQuickAmount?: (percentage: number) => void;
  balance?: string;
  onDropdownToggle?: (isOpen: boolean) => void;
  zIndex?: number;
}

export const ModernSwapCard: React.FC<ModernSwapCardProps> = ({
  type,
  amount,
  onAmountChange,
  selectedCurrency,
  onCurrencySelect,
  availableCurrencies,
  label,
  placeholder = '0',
  disabled = false,
  showQuickAmounts = false,
  onQuickAmount,
  balance,
  onDropdownToggle,
  zIndex = 1
}) => {
  const isPay = type === 'pay';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      style={{
        background: 'rgba(28, 28, 30, 0.8)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '20px',
        position: 'relative',
        overflow: 'visible',
        zIndex
      }}>
      {/* Label */}
      <div
        style={{
          fontSize: '13px',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.7)',
          marginBottom: '12px',
          letterSpacing: '-0.08px'
        }}>
        {label}
      </div>

      {/* Amount Input */}
      <div style={{ marginBottom: '16px' }}>
        <ModernInput
          value={amount}
          onChange={onAmountChange}
          placeholder={placeholder}
          type="number"
          disabled={disabled}
        />
      </div>

      {/* Currency Selector and Quick Amounts */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ flex: 1 }}>
          <ModernCurrencySelector
            selectedCurrency={selectedCurrency}
            onCurrencySelect={onCurrencySelect}
            availableCurrencies={availableCurrencies}
            disabled={disabled}
            onDropdownToggle={onDropdownToggle}
          />
        </div>

        {showQuickAmounts && onQuickAmount && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickAmount(0.5)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}>
              50%
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onQuickAmount(1)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                fontSize: '12px',
                fontWeight: '600',
                color: '#ffffff',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}>
              Max
            </motion.button>
          </div>
        )}
      </div>

      {/* Balance Info */}
      {balance && (
        <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
          <span
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.08px'
            }}>
            Balance: {balance}
          </span>
        </div>
      )}
    </motion.div>
  );
};
