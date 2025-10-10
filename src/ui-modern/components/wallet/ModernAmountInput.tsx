import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { amountToSatoshis, satoshisToAmount } from '@/ui/utils';

import { ModernInput } from '../common/ModernInput';

export interface ModernAmountInputProps {
  value: string;
  onChange: (amount: string) => void;
  placeholder?: string;
  label?: string;
  maxAmount?: number; // in satoshis
  btcUnit?: string;
  error?: string;
  disabled?: boolean;
  onMaxClick?: () => void;
  showUsdValue?: boolean;
  usdPrice?: number;
}

export const ModernAmountInput: React.FC<ModernAmountInputProps> = ({
  value,
  onChange,
  placeholder = '0.00',
  label = 'Amount',
  maxAmount = 0,
  btcUnit = 'BTC',
  error,
  disabled = false,
  onMaxClick,
  showUsdValue = true,
  usdPrice = 50000 // Default BTC price
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [usdValue, setUsdValue] = useState<string>('');

  // Calculate USD value
  useEffect(() => {
    if (value && showUsdValue) {
      try {
        const satoshis = amountToSatoshis(value);
        const btcAmount = satoshis / 100000000;
        const usd = btcAmount * usdPrice;
        setUsdValue(usd.toFixed(2));
      } catch {
        setUsdValue('');
      }
    } else {
      setUsdValue('');
    }
  }, [value, usdPrice, showUsdValue]);

  const handleChange = (newValue: string) => {
    // Only allow numbers and decimal point
    const sanitized = newValue.replace(/[^0-9.]/g, '');

    // Prevent multiple decimal points
    const parts = sanitized.split('.');
    if (parts.length > 2) {
      return;
    }

    // Limit decimal places to 8 (satoshi precision)
    if (parts[1] && parts[1].length > 8) {
      return;
    }

    onChange(sanitized);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const maxAmountFormatted = maxAmount > 0 ? satoshisToAmount(maxAmount) : '0';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      {/* Label with USD value */}
      <div style={{ marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: '#ffffff',
              letterSpacing: '-0.08px'
            }}>
            {label}
          </label>
          {usdValue && showUsdValue && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                fontWeight: '500'
              }}>
              ≈ ${usdValue} USD
            </motion.span>
          )}
        </div>
      </div>

      {/* Input with Max button */}
      <div style={{ position: 'relative' }}>
        <ModernInput
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          type="text"
          error={error}
          rightIcon={
            onMaxClick &&
            maxAmount > 0 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onMaxClick}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#34c759',
                  fontSize: '12px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(52, 199, 89, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(52, 199, 89, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(52, 199, 89, 0.1)';
                }}>
                MAX
              </motion.button>
            )
          }
        />

        {/* Available balance hint */}
        {maxAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            style={{
              marginTop: '6px',
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)',
              textAlign: 'right'
            }}>
            Available: {maxAmountFormatted} {btcUnit}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
