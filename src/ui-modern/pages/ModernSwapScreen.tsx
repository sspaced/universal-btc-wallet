import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance } from '@/ui/state/accounts/hooks';

import { ModernButton } from '../components/common/ModernButton';
import { ModernHeader } from '../components/layout/ModernHeader';
import { Currency } from '../components/wallet/ModernCurrencySelector';
import { ModernSwapButton } from '../components/wallet/ModernSwapButton';
import { ModernSwapCard } from '../components/wallet/ModernSwapCard';

export const ModernSwapScreen: React.FC = () => {
  const navigate = useNavigate();
  const accountBalance = useAccountBalance();

  // States
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);

  // Use real BTC balance from wallet
  const btcBalance = accountBalance?.amount || '0';

  const [fromCurrency, setFromCurrency] = useState<Currency>({
    symbol: 'BTC',
    name: 'Bitcoin',
    balance: btcBalance,
    icon: <span style={{ fontSize: '18px' }}>₿</span>
  });
  const [toCurrency, setToCurrency] = useState<Currency>({
    symbol: 'USDT',
    name: 'Tether',
    balance: '0',
    icon: <span style={{ fontSize: '18px' }}>₮</span>
  });

  // Available currencies - Use real balance for BTC from wallet
  const availableCurrencies: Currency[] = [
    { symbol: 'BTC', name: 'Bitcoin', balance: btcBalance, icon: <span style={{ fontSize: '18px' }}>₿</span> },
    { symbol: 'USDT', name: 'Tether', balance: '0', icon: <span style={{ fontSize: '18px' }}>₮</span> },
    { symbol: 'USDC', name: 'USD Coin', balance: '0', icon: <span style={{ fontSize: '18px' }}>◉</span> },
    { symbol: 'ETH', name: 'Ethereum', balance: '0', icon: <span style={{ fontSize: '18px' }}>Ξ</span> },
    { symbol: 'LTC', name: 'Litecoin', balance: '0', icon: <span style={{ fontSize: '18px' }}>Ł</span> }
  ];

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
      // Mock exchange rate - in real app, this would come from an API
      const mockRate = fromCurrency.symbol === 'BTC' && toCurrency.symbol === 'USDT' ? 45000 : 1;
      setToAmount((parseFloat(value) * mockRate).toFixed(2));
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value) {
      // Reverse calculation
      const mockRate = fromCurrency.symbol === 'BTC' && toCurrency.symbol === 'USDT' ? 45000 : 1;
      setFromAmount((parseFloat(value) / mockRate).toFixed(8));
    } else {
      setFromAmount('');
    }
  };

  const handleFromCurrencySelect = (currency: Currency) => {
    setFromCurrency(currency);
    // Recalculate amounts if both are set
    if (fromAmount) {
      const mockRate = currency.symbol === 'BTC' && toCurrency.symbol === 'USDT' ? 45000 : 1;
      setToAmount((parseFloat(fromAmount) * mockRate).toFixed(2));
    }
  };

  const handleToCurrencySelect = (currency: Currency) => {
    setToCurrency(currency);
    // Recalculate amounts if both are set
    if (fromAmount) {
      const mockRate = fromCurrency.symbol === 'BTC' && currency.symbol === 'USDT' ? 45000 : 1;
      setToAmount((parseFloat(fromAmount) * mockRate).toFixed(2));
    }
  };

  const canSwap = fromAmount && toAmount && parseFloat(fromAmount) > 0;

  const handleSwap = () => {
    if (canSwap) {
      console.log('Executing swap:', {
        from: { currency: fromCurrency.symbol, amount: fromAmount },
        to: { currency: toCurrency.symbol, amount: toAmount }
      });
      // Here you would implement the actual swap logic
      // For now, just show a success message or navigate back
      navigate('MainScreen');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121212',
        display: 'flex',
        flexDirection: 'column'
      }}>
      {/* Header */}
      <ModernHeader
        title="Swap"
        onBack={() => navigate('MainScreen')}
        showBackButton={true}
      />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>

        {/* From Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{ position: 'relative', zIndex: fromDropdownOpen ? 10 : toDropdownOpen ? 1 : 2 }}>
          <ModernSwapCard
            type="pay"
            amount={fromAmount}
            onAmountChange={handleFromAmountChange}
            selectedCurrency={fromCurrency}
            onCurrencySelect={handleFromCurrencySelect}
            availableCurrencies={availableCurrencies}
            label="You pay"
            placeholder="0.00"
            balance={fromCurrency.balance}
            onDropdownToggle={setFromDropdownOpen}
          />
        </motion.div>

        {/* Swap Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            margin: '-10px 0',
            position: 'relative',
            zIndex: fromDropdownOpen || toDropdownOpen ? 0 : 5
          }}>
          <ModernSwapButton
            onSwap={handleSwapCurrencies}
            disabled={!fromAmount || !toAmount}
          />
        </motion.div>

        {/* To Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{ position: 'relative', zIndex: toDropdownOpen ? 10 : fromDropdownOpen ? 1 : 2 }}>
          <ModernSwapCard
            type="receive"
            amount={toAmount}
            onAmountChange={handleToAmountChange}
            selectedCurrency={toCurrency}
            onCurrencySelect={handleToCurrencySelect}
            availableCurrencies={availableCurrencies}
            label="You receive"
            placeholder="0.00"
            balance={toCurrency.balance}
            onDropdownToggle={setToDropdownOpen}
          />
        </motion.div>

        {/* Rate Info */}
        {fromAmount && toAmount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              padding: '16px 20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Exchange Rate
              </span>
              <span style={{ fontSize: '15px', color: '#ffffff', fontWeight: '500' }}>
                1 {fromCurrency.symbol} ≈ {fromCurrency.symbol === 'BTC' && toCurrency.symbol === 'USDT' ? '45,000' : '1.00'} {toCurrency.symbol}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Fee
              </span>
              <span style={{ fontSize: '15px', color: '#34c759', fontWeight: '500' }}>
                0.1%
              </span>
            </div>
          </motion.div>
        )}

        {/* Swap Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <ModernButton
            variant="primary"
            size="large"
            fullWidth
            disabled={!canSwap}
            onClick={handleSwap}>
            {canSwap ? 'Review Swap' : 'Enter amount'}
          </ModernButton>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          style={{
            textAlign: 'center',
            padding: '20px 0'
          }}>
          <p style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.5)',
            lineHeight: '1.4',
            margin: 0
          }}>
            Swaps are processed instantly using decentralized exchanges.
            <br />
            Always verify the exchange rate before confirming.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
