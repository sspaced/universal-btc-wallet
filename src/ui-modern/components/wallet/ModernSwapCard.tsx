import { motion } from 'framer-motion';
import React from 'react';

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

  // Style to hide number input arrows
  const hideNumberInputArrows = `
    input[type="number"]::-webkit-inner-spin-button,
    input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
    input[type="number"] {
      -moz-appearance: textfield;
    }
  `;

  return (
    <>
      <style>{hideNumberInputArrows}</style>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        style={{
          background: isPay ? 'var(--modern-bg-primary)' : 'var(--modern-bg-secondary)',
          backdropFilter: 'blur(12px)',
          border: isPay ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          borderRadius: '14px',
          padding: '10px 16px',
          position: 'relative',
          overflow: 'visible',
          zIndex
        }}>
        {/* Label */}
        <div
          style={{
            fontSize: '11px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.6)',
            marginBottom: '4px',
            letterSpacing: '-0.2px'
          }}>
          {label}
        </div>

        {/* Amount Input and Currency Selector in same row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          {/* Amount Input - Direct input without sub-box */}
          <input
            type="number"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: isPay ? '36px' : '42px',
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              letterSpacing: '-0.5px',
              padding: 0,
              margin: 0,
              width: '100%'
            }}
          />

          {/* Currency Selector on the right */}
          <div style={{ flexShrink: 0 }}>
            <ModernCurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencySelect={onCurrencySelect}
              availableCurrencies={availableCurrencies}
              disabled={disabled}
              onDropdownToggle={onDropdownToggle}
              variant={isPay ? 'primary' : 'secondary'}
            />
          </div>
        </div>

        {/* Balance Info */}
        {balance && (
          <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
            <span
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '-0.2px'
              }}>
              Balance: {balance}
            </span>
          </div>
        )}
      </motion.div>
    </>
  );
};
