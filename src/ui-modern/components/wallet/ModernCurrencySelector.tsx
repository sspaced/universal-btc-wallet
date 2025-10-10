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
}

export const ModernCurrencySelector: React.FC<ModernCurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencySelect,
  availableCurrencies,
  disabled = false,
  label
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleCurrencyClick = (currency: Currency) => {
    if (!currency.disabled) {
      onCurrencySelect(currency);
      setIsOpen(false);
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%' }}>
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
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: '100%',
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1.5px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '8px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: disabled ? 'not-allowed' : 'pointer',
          opacity: disabled ? 0.5 : 1,
          transition: 'all 0.2s ease'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {selectedCurrency ? (
            <>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
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
              <div>
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#ffffff',
                    letterSpacing: '-0.022em'
                  }}>
                  {selectedCurrency.symbol}
                </div>
                {selectedCurrency.balance && (
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginTop: '2px'
                    }}>
                    Balance: {selectedCurrency.balance}
                  </div>
                )}
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

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
            left: 0,
            right: 0,
            marginTop: '8px',
            background: 'rgba(28, 28, 30, 0.95)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '8px',
            zIndex: 1000,
            maxHeight: '200px',
            overflowY: 'auto'
          }}>
          {availableCurrencies.map((currency, index) => (
            <motion.button
              key={currency.symbol}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCurrencyClick(currency)}
              disabled={currency.disabled}
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                cursor: currency.disabled ? 'not-allowed' : 'pointer',
                opacity: currency.disabled ? 0.5 : 1,
                transition: 'background-color 0.2s ease'
              }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.1)',
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
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#ffffff',
                    letterSpacing: '-0.022em'
                  }}>
                  {currency.symbol}
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    marginTop: '2px'
                  }}>
                  {currency.name}
                </div>
              </div>
              {currency.balance && (
                <div
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.5)',
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
