import { motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';

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
  slippage?: number;
  onSlippageChange?: (value: number) => void;
  showSlippageSettings?: boolean;
  btcPrice?: number;
  tokenPrice?: number;
  loading?: boolean;
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
  slippage,
  onSlippageChange,
  showSlippageSettings = false,
  btcPrice = 0,
  tokenPrice = 0,
  loading = false
}) => {
  const isPay = type === 'pay';
  const [isHovered, setIsHovered] = useState(false);
  const [maxSlippage, setMaxSlippage] = useState(slippage || 1);
  const [isMaxSelected, setIsMaxSelected] = useState(false);

  // Calculate USD value
  const usdValue = useMemo(() => {
    if (!amount || parseFloat(amount) === 0) return '0.00';

    const amountNum = parseFloat(amount);

    if (!selectedCurrency) return '0.00';

    // For BTC
    if (selectedCurrency.symbol === 'BTC') {
      if (btcPrice > 0) {
        const usd = amountNum * btcPrice;
        return usd.toFixed(2);
      }
      return '0.00';
    }

    // For tokens - use tokenPrice (in satoshis per token)
    if (tokenPrice > 0) {
      // Calculate value in satoshis
      const valueInSats = amountNum * tokenPrice;
      // Convert satoshis to BTC then to USD
      const btcValue = valueInSats / 100000000;
      const usd = btcValue * btcPrice;
      return usd.toFixed(2);
    }

    return '0.00';
  }, [amount, selectedCurrency, btcPrice, tokenPrice]);

  // Simple function to get display amount (no formatting, just pass through)
  const getDisplayAmount = (amountStr: string) => {
    return amountStr || '0';
  };

  // Handle input change - pass through directly
  const handleAmountChange = (value: string) => {
    // Pass the value directly to allow normal number input
    onAmountChange(value);
  };

  // Calculate font size based on amount length with more granular scaling
  const getFontSize = () => {
    const length = amount.length;
    const baseSizePay = 36;
    const baseSizeReceive = 42;
    const baseSize = isPay ? baseSizePay : baseSizeReceive;

    // More granular scaling for better readability
    if (length <= 4) return baseSize;
    if (length <= 6) return baseSize * 0.95;
    if (length <= 8) return baseSize * 0.9;
    if (length <= 10) return baseSize * 0.85;
    if (length <= 12) return baseSize * 0.8;
    if (length <= 15) return baseSize * 0.75;
    if (length <= 18) return baseSize * 0.7;
    if (length <= 22) return baseSize * 0.65;
    if (length <= 26) return baseSize * 0.6;
    if (length <= 30) return baseSize * 0.55;
    return baseSize * 0.5;
  };

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

  const slippageOptions = [
    { label: '0.5%', value: 0.5 },
    { label: '1%', value: 1 },
    { label: '2%', value: 2 },
    { label: 'Max', value: maxSlippage }
  ];

  const handleSlippageClick = (option: { label: string; value: number }) => {
    if (option.label === 'Max') {
      // Max button uses the maxSlippage value set via the settings overlay
      setIsMaxSelected(true);
      if (onSlippageChange) {
        onSlippageChange(maxSlippage);
      }
      return;
    }
    // Other buttons deselect Max
    setIsMaxSelected(false);
    if (onSlippageChange) {
      onSlippageChange(option.value);
    }
  };

  return (
    <>
      <style>{hideNumberInputArrows}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          background: isPay ? 'var(--modern-bg-primary)' : 'var(--modern-bg-secondary)',
          backdropFilter: 'blur(12px)',
          border: isPay ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
          borderRadius: '14px',
          padding: '10px 16px',
          position: 'relative',
          overflow: 'visible'
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
            type="text"
            value={amount}
            onChange={(e) => handleAmountChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: '#ffffff',
              fontSize: `${getFontSize()}px`,
              fontWeight: '600',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
              letterSpacing: '-0.5px',
              padding: 0,
              margin: 0,
              width: '100%',
              transition: 'font-size 0.2s ease'
            }}
          />

          {/* Currency Selector on the right with slippage buttons */}
          <div style={{ flexShrink: 0, position: 'relative' }}>
            {/* Slippage Buttons (visible on hover, positioned above selector) */}
            {isHovered && showSlippageSettings && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  bottom: '100%',
                  right: 0,
                  display: 'flex',
                  gap: '3px',
                  marginBottom: '8px',
                  zIndex: 60
                }}>
                {slippageOptions.map((option) => {
                  const isSelected =
                    option.label === 'Max' ? isMaxSelected : !isMaxSelected && slippage === option.value;
                  return (
                    <motion.button
                      key={option.label}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleSlippageClick(option)}
                      style={{
                        background: 'transparent',
                        border: isSelected
                          ? '1px solid var(--modern-accent-primary)'
                          : '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '10px',
                        padding: '3px 7px',
                        color: isSelected ? 'var(--modern-accent-primary)' : '#ffffff',
                        fontSize: '9px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        whiteSpace: 'nowrap'
                      }}>
                      {option.label}
                    </motion.button>
                  );
                })}
              </motion.div>
            )}

            <ModernCurrencySelector
              selectedCurrency={selectedCurrency}
              onCurrencySelect={onCurrencySelect}
              availableCurrencies={availableCurrencies}
              disabled={disabled}
              onDropdownToggle={onDropdownToggle}
              variant={isPay ? 'primary' : 'secondary'}
              loading={loading}
            />
          </div>
        </div>

        {/* Balance Info and USD Price */}
        <div style={{ marginTop: '4px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* USD Price on the left */}
          <span
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.5)',
              letterSpacing: '-0.2px'
            }}>
            ${usdValue}
          </span>

          {/* Balance on the right */}
          {selectedCurrency && balance && (
            <span
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '-0.2px'
              }}>
              Balance: {balance}
            </span>
          )}
        </div>
      </motion.div>
    </>
  );
};
