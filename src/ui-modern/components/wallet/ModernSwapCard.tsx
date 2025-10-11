import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import React, { useState } from 'react';

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
  slippage?: number;
  onSlippageChange?: (value: number) => void;
  showSlippageSettings?: boolean;
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
  zIndex = 1,
  slippage,
  onSlippageChange,
  showSlippageSettings = false
}) => {
  const isPay = type === 'pay';
  const [isHovered, setIsHovered] = useState(false);
  const [showCustomSlippage, setShowCustomSlippage] = useState(false);
  const [customSlippageValue, setCustomSlippageValue] = useState('');
  const [maxSlippage, setMaxSlippage] = useState(slippage || 1);
  const [isMaxSelected, setIsMaxSelected] = useState(false);

  // Calculate font size based on amount length
  const getFontSize = () => {
    const length = amount.length;
    const baseSizePay = 36;
    const baseSizeReceive = 42;
    const baseSize = isPay ? baseSizePay : baseSizeReceive;

    if (length <= 6) return baseSize;
    if (length <= 10) return baseSize * 0.8;
    if (length <= 15) return baseSize * 0.65;
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

  const handleCustomSlippageSubmit = () => {
    if (customSlippageValue && !isNaN(parseFloat(customSlippageValue))) {
      const newMaxSlippage = parseFloat(customSlippageValue);
      setMaxSlippage(newMaxSlippage);
      setShowCustomSlippage(false);
      setCustomSlippageValue('');
    }
  };

  return (
    <>
      <style>{hideNumberInputArrows}</style>

      {/* Settings Button for Max Slippage */}
      {showSlippageSettings && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '6px', position: 'relative' }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCustomSlippage(!showCustomSlippage)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              color: 'rgba(255, 255, 255, 0.7)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <SlidersHorizontal size={14} />
          </motion.button>

          {/* Custom Slippage Dropdown */}
          {showCustomSlippage && (
            <>
              {/* Invisible overlay to close on outside click */}
              <div
                onClick={() => setShowCustomSlippage(false)}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  zIndex: 99998
                }}
              />
              {/* Horizontal Input expanding from button */}
              <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                transition={{ duration: 0.2 }}
                style={{
                  position: 'absolute',
                  top: 0,
                  right: '34px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '0 10px',
                  gap: '4px',
                  zIndex: 99999
                }}>
                <input
                  type="number"
                  value={customSlippageValue}
                  onChange={(e) => {
                    const value = e.target.value;
                    setCustomSlippageValue(value);
                    if (value && !isNaN(parseFloat(value))) {
                      setMaxSlippage(parseFloat(value));
                    }
                  }}
                  placeholder="Max Slippage"
                  autoFocus
                  style={{
                    width: '90px',
                    background: 'transparent',
                    border: 'none',
                    color: '#ffffff',
                    fontSize: '11px',
                    outline: 'none'
                  }}
                />
                <span
                  style={{
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                  %
                </span>
              </motion.div>
            </>
          )}
        </div>
      )}

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
                  zIndex: 100
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
