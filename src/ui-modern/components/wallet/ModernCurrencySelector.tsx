import { motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';

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
  loading?: boolean;
}

export const ModernCurrencySelector: React.FC<ModernCurrencySelectorProps> = ({
  selectedCurrency,
  onCurrencySelect,
  availableCurrencies,
  disabled = false,
  label,
  onDropdownToggle,
  variant = 'primary',
  loading = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const dropdownBg = variant === 'primary' ? 'rgba(18, 18, 18, 0.98)' : 'rgba(36, 36, 36, 0.98)';
  const buttonBg = variant === 'primary' ? '#121212' : '#242424';

  const toggleDropdown = (open: boolean) => {
    setIsOpen(open);
    onDropdownToggle?.(open);
    if (!open) {
      setSearchQuery(''); // Clear search when closing dropdown
    }
  };

  // Filter currencies based on search query
  const filteredCurrencies = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableCurrencies;
    }

    const query = searchQuery.toLowerCase().trim();
    return availableCurrencies.filter(
      (currency) => currency.symbol.toLowerCase().includes(query) || currency.name.toLowerCase().includes(query)
    );
  }, [availableCurrencies, searchQuery]);

  // Skeleton component for loading state
  const SkeletonItem = () => (
    <div
      style={{
        width: '100%',
        background: 'transparent',
        borderRadius: '10px',
        padding: '10px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
      <div
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: '15px',
            width: '60%',
            borderRadius: '4px',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
            marginBottom: '4px'
          }}
        />
        <div
          style={{
            height: '11px',
            width: '40%',
            borderRadius: '4px',
            background:
              'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite'
          }}
        />
      </div>
    </div>
  );

  const handleCurrencyClick = (currency: Currency) => {
    if (!currency.disabled) {
      onCurrencySelect(currency);
      toggleDropdown(false);
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes shimmer {
            0% {
              background-position: -200% 0;
            }
            100% {
              background-position: 200% 0;
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
        `}
      </style>
      <div style={{ position: 'relative', width: 'auto' }}>
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
          onClick={() => !disabled && !loading && toggleDropdown(!isOpen)}
          disabled={disabled || loading}
          style={{
            width: 'auto',
            background: buttonBg,
            border: isOpen ? '1px solid var(--modern-accent-primary)' : '1px solid rgba(255, 255, 255, 0.14)',
            borderRadius: '9999px',
            padding: '6px 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: disabled || loading ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.5 : 1,
            transition: 'all 0.2s ease'
          }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {loading && !selectedCurrency ? (
              // Skeleton loader for button
              <>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    minWidth: '18px',
                    borderRadius: '50%',
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite'
                  }}
                />
                <div
                  style={{
                    height: '14px',
                    width: '60px',
                    borderRadius: '4px',
                    background:
                      'linear-gradient(90deg, rgba(255,255,255,0.1) 25%, rgba(255,255,255,0.2) 50%, rgba(255,255,255,0.1) 75%)',
                    backgroundSize: '200% 100%',
                    animation: 'shimmer 1.5s infinite'
                  }}
                />
              </>
            ) : selectedCurrency ? (
              <>
                <div
                  style={{
                    width: '18px',
                    height: '18px',
                    minWidth: '18px',
                    minHeight: '18px',
                    maxWidth: '18px',
                    maxHeight: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    flexShrink: 0,
                    boxSizing: 'border-box'
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
              zIndex: 999
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
              zIndex: 1000,
              maxHeight: '280px',
              overflowY: 'auto',
              boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6)'
            }}>
            {/* Search Input */}
            <div style={{ padding: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  color: '#ffffff',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    toggleDropdown(false);
                  }
                }}
              />
            </div>

            {/* Currency List */}
            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {loading ? (
                // Show skeleton loading items
                Array.from({ length: 5 }).map((_, index) => <SkeletonItem key={`skeleton-${index}`} />)
              ) : filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((currency, index) => (
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
                        width: '20px',
                        height: '20px',
                        minWidth: '20px',
                        minHeight: '20px',
                        maxWidth: '20px',
                        maxHeight: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative',
                        flexShrink: 0,
                        boxSizing: 'border-box'
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
                ))
              ) : (
                <div
                  style={{
                    padding: '20px',
                    textAlign: 'center',
                    color: 'rgba(255, 255, 255, 0.5)',
                    fontSize: '14px'
                  }}>
                  No tokens found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
};
