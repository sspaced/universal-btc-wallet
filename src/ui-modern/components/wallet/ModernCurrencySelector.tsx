import { motion } from 'framer-motion';
import React, { useState } from 'react';

export interface Currency {
  symbol: string;
  name: string;
  icon: React.ReactNode;
  balance?: string;
  disabled?: boolean;
}

interface ModernCurrencySelectorProps {
  selectedCurrency: Currency | null;
  onCurrencySelect: (currency: Currency) => void;
  availableCurrencies: Currency[];
  disabled?: boolean;
  label?: string;
  onDropdownToggle?: (isOpen: boolean) => void;
  variant?: 'primary' | 'secondary';
}

export const ModernCurrencySelector: React.FC<ModernCurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencySelect,
  availableCurrencies,
  disabled = false,
  label,
  onDropdownToggle,
  variant = 'primary'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const dropdownBg = variant === 'primary' ? 'rgba(18, 18, 18, 0.98)' : 'rgba(36, 36, 36, 0.98)';
  const buttonBg = variant === 'primary' ? '#121212' : '#242424';

  const toggleDropdown = (open: boolean) => {
    setIsOpen(open);
    onDropdownToggle?.(open);
  };

  const handleCurrencyClick = (currency: Currency) => {
    if (!currency.disabled) {
      onCurrencySelect(currency);
      toggleDropdown(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: 'auto', zIndex: isOpen ? 1000 : 'auto' }}>
      {label && (
        <div
          style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '8px',
            letterSpacing: '-0.08px'
          }}>
          {label}
        </div>
      )}

      <motion.button
        whileTap={{ scale: disabled ? 1 : 0.98 }}
        onClick={() => !disabled && toggleDropdown(!isOpen)}
        disabled={disabled}
        style={{
          width: 'auto',
          background: buttonBg,
          border: isOpen ? '1px solid var(--modern-accent-primary)' : '1px solid rgba(255, 255, 255, 0.14)',
          borderRadius: '9999px',
          padding: '6px 10px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {selectedCurrency ? (
            <>
              <div
                style={{
                  width: '22px',
                  height: '22px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                {selectedCurrency.icon}
                {selectedCurrency.disabled && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'rgba(255, 59, 48, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white'
                    }}>
                    ✕
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ffffff',
                    letterSpacing: '-0.022em'
                  }}>
                  {selectedCurrency.symbol}
                </div>
              </div>
            </>
          ) : (
            <div
              style={{
                fontSize: '16px',
                fontWeight: '500',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '-0.022em'
              }}>
              Select currency
            </div>
          )}
        </div>

        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          style={{
            color: 'rgba(255, 255, 255, 0.5)',
            display: 'flex',
            alignItems: 'center'
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          onClick={() => toggleDropdown(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 9998
          }}
        />
      )}

      {/* Dropdown */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '6px',
            minWidth: '220px',
            background: dropdownBg,
            backdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            borderRadius: '12px',
            padding: '6px',
            zIndex: 9999,
            maxHeight: '280px',
            overflowY: 'auto',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)'
          }}>
          {availableCurrencies.map((currency, index) => (
            <motion.button
              key={currency.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleCurrencyClick(currency)}
              disabled={currency.disabled}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderRadius: '10px',
                padding: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: currency.disabled ? 'not-allowed' : 'pointer',
                opacity: currency.disabled ? 0.5 : 1,
                transition: 'background-color 0.15s ease'
              }}>
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative'
                }}>
                {currency.icon}
                {currency.disabled && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '-2px',
                      left: '-2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'rgba(255, 59, 48, 0.8)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '8px',
                      color: 'white'
                    }}>
                    ✕
                  </div>
                )}
              </div>
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#ffffff',
                    letterSpacing: '-0.022em'
                  }}>
                  {currency.symbol}
                </div>
                {currency.name !== currency.symbol && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.45)',
                      marginTop: '2px'
                    }}>
                    {currency.name}
                  </div>
                )}
              </div>
              {currency.balance && parseFloat(currency.balance) > 0 && (
                <div
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.45)',
                    textAlign: 'right'
                  }}>
                  {currency.balance}
                </div>
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </div>
  );
};
