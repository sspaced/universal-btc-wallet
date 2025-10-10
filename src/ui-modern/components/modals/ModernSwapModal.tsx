import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import { ModernButton } from '../common/ModernButton';

interface Currency {
  symbol: string;
  name: string;
  balance: string;
}

interface ModernSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ModernSwapModal: React.FC<ModernSwapModalProps> = ({ isOpen, onClose }) => {
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState<Currency>({ symbol: 'BTC', name: 'Bitcoin', balance: '0.0012' });
  const [toCurrency, setToCurrency] = useState<Currency>({ symbol: 'USDT', name: 'Tether', balance: '100.00' });

  const handleSwapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const handleFromAmountChange = (value: string) => {
    setFromAmount(value);
    if (value) {
      const mockRate = 45000;
      setToAmount((parseFloat(value) * mockRate).toFixed(2));
    } else {
      setToAmount('');
    }
  };

  const canSwap = fromAmount && toAmount;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              zIndex: 1000
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              backgroundColor: '#000000',
              borderTopLeftRadius: '20px',
              borderTopRightRadius: '20px',
              height: '75vh',
              maxHeight: '600px',
              zIndex: 1001,
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: 'none',
              overflow: 'hidden'
            }}>
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontSize: '17px',
                  fontWeight: '400',
                  cursor: 'pointer',
                  padding: 0
                }}>
                Cancel
              </button>
              <h2
                style={{
                  fontSize: '17px',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: 0
                }}>
                Swap
              </h2>
              <div style={{ width: '56px' }} />
            </div>

            {/* Content */}
            <div
              style={{
                flex: 1,
                padding: '24px 20px 20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '0',
                justifyContent: 'center'
              }}>
              {/* From Currency */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500' }}>From</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '400' }}>
                    Balance: {fromCurrency.balance}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#F7931A',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>
                      {fromCurrency.symbol}
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>{fromCurrency.name}</div>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    value={fromAmount}
                    onChange={(e) => handleFromAmountChange(e.target.value)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none',
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: '600',
                      textAlign: 'right',
                      width: '140px',
                      padding: 0
                    }}
                  />
                </div>
              </div>

              {/* Swap Button */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }}>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={handleSwapCurrencies}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                    />
                  </svg>
                </motion.button>
              </div>

              {/* To Currency */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  padding: '16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  marginBottom: '24px'
                }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px'
                  }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500' }}>To</span>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '400' }}>
                    Balance: {toCurrency.balance}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: '#26A17B',
                      flexShrink: 0
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>
                      {toCurrency.symbol}
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>{toCurrency.name}</div>
                  </div>
                  <div
                    style={{
                      color: '#ffffff',
                      fontSize: '24px',
                      fontWeight: '600',
                      textAlign: 'right',
                      width: '140px'
                    }}>
                    {toAmount || '0'}
                  </div>
                </div>
              </div>

              {/* Rate Info */}
              {fromAmount && toAmount && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '24px'
                  }}>
                  <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Rate</span>
                  <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '500' }}>
                    1 {fromCurrency.symbol} ≈ 45,000 {toCurrency.symbol}
                  </span>
                </motion.div>
              )}

              {/* Swap Button */}
              <ModernButton
                variant="primary"
                size="large"
                fullWidth
                disabled={!canSwap}
                onClick={() => {
                  console.log('Swap executed');
                  onClose();
                }}>
                {canSwap ? 'Review Swap' : 'Enter amount'}
              </ModernButton>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
