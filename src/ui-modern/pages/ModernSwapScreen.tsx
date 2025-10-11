import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance } from '@/ui/state/accounts/hooks';

import { ModernButton } from '../components/common/ModernButton';
import { ModernHeader } from '../components/layout/ModernHeader';
import { Currency } from '../components/wallet/ModernCurrencySelector';
import { ModernSwapButton } from '../components/wallet/ModernSwapButton';
import { ModernSwapCard } from '../components/wallet/ModernSwapCard';
import { useSimplicityTokens } from '../hooks/useSimplicityTokens';
import { useAssets } from '../providers/AssetProvider';

export const ModernSwapScreen: React.FC = () => {
  const navigate = useNavigate();
  const accountBalance = useAccountBalance();
  const { assets: userAssets, loading: assetsLoading } = useAssets();
  const { tokens: simplicityTokens, loading: simplicityLoading } = useSimplicityTokens();

  // States
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const [slippage, setSlippage] = useState(1);

  // Use real BTC balance from wallet
  const btcBalance = accountBalance?.amount || '0';

  // Initialize currencies with first available asset or default BTC
  const [fromCurrency, setFromCurrency] = useState<Currency>(() => {
    if (parseFloat(btcBalance) > 0) {
      return {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: btcBalance,
        icon: <span style={{ fontSize: '18px' }}>₿</span>
      };
    }
    // Fallback to first available asset
    return {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: '0',
      icon: <span style={{ fontSize: '18px' }}>₿</span>
    };
  });

  const [toCurrency, setToCurrency] = useState<Currency>({
    symbol: 'BTC人生',
    name: 'BTC人生',
    balance: '0',
    icon: <span style={{ fontSize: '18px' }}>⚡</span>
  });

  // Convert user assets to currencies for the "from" selector
  const availableFromCurrencies: Currency[] = useMemo(() => {
    const currencies: Currency[] = [];

    // Add BTC first if user has BTC balance
    if (parseFloat(btcBalance) > 0) {
      currencies.push({
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: btcBalance,
        icon: <span style={{ fontSize: '18px' }}>₿</span>
      });
    }

    // Add other assets that user owns (filter out BTC as it's already added)
    userAssets.forEach((asset) => {
      if (asset.type !== 'btc' && parseFloat(asset.amount) > 0) {
        // Get appropriate icon based on asset type
        let icon = <span style={{ fontSize: '18px' }}>●</span>;
        if (asset.type === 'rune') {
          icon = <span style={{ fontSize: '18px' }}>ᚱ</span>;
        } else if (asset.type === 'ordinal') {
          icon = <span style={{ fontSize: '18px' }}>◉</span>;
        } else if (asset.type === 'brc20') {
          icon = <span style={{ fontSize: '18px' }}>₮</span>;
        } else if (asset.type === 'alkane') {
          icon = <span style={{ fontSize: '18px' }}>⚡</span>;
        } else if (asset.type === 'cat20') {
          icon = <span style={{ fontSize: '18px' }}>🐱</span>;
        } else if (asset.type === 'cat721') {
          icon = <span style={{ fontSize: '18px' }}>🎨</span>;
        }

        currencies.push({
          symbol: asset.symbol || asset.name,
          name: asset.name,
          balance: asset.amount,
          icon: icon
        });
      }
    });

    return currencies;
  }, [userAssets, btcBalance]);

  // Convert Simplicity tokens to currencies for the "to" selector
  const availableToCurrencies: Currency[] = useMemo(() => {
    const currencies: Currency[] = [];

    // Add Simplicity tokens from API
    simplicityTokens.forEach((token) => {
      // Filter out tokens with 0 current supply or very low supply
      if (parseFloat(token.current_supply) > 0 && parseFloat(token.current_supply) > 100) {
        currencies.push({
          symbol: token.ticker,
          name: token.ticker,
          balance: '0', // User doesn't own these tokens initially
          icon: <span style={{ fontSize: '18px' }}>⚡</span> // Simplicity icon
        });
      }
    });

    return currencies;
  }, [simplicityTokens]);

  // Update fromCurrency when assets are loaded and available
  useEffect(() => {
    if (!assetsLoading && availableFromCurrencies.length > 0) {
      // If current fromCurrency is not in available currencies, update it
      const currentFromExists = availableFromCurrencies.some((currency) => currency.symbol === fromCurrency.symbol);

      if (!currentFromExists) {
        setFromCurrency(availableFromCurrencies[0]);
      }
    }
  }, [availableFromCurrencies, assetsLoading, fromCurrency.symbol]);

  // Update toCurrency when Simplicity tokens are loaded
  useEffect(() => {
    if (!simplicityLoading && availableToCurrencies.length > 0) {
      // If current toCurrency is not in available currencies, update it
      const currentToExists = availableToCurrencies.some((currency) => currency.symbol === toCurrency.symbol);

      if (!currentToExists) {
        setToCurrency(availableToCurrencies[0]);
      }
    }
  }, [availableToCurrencies, simplicityLoading, toCurrency.symbol]);

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
      const calculatedAmount = parseFloat(value) * mockRate;
      setToAmount(calculatedAmount.toString());
    } else {
      setToAmount('');
    }
  };

  const handleToAmountChange = (value: string) => {
    setToAmount(value);
    if (value) {
      // Reverse calculation
      const mockRate = fromCurrency.symbol === 'BTC' && toCurrency.symbol === 'USDT' ? 45000 : 1;
      const calculatedAmount = parseFloat(value) / mockRate;
      setFromAmount(calculatedAmount.toString());
    } else {
      setFromAmount('');
    }
  };

  const handleFromCurrencySelect = (currency: Currency) => {
    setFromCurrency(currency);
    // Recalculate amounts if both are set
    if (fromAmount) {
      const mockRate = currency.symbol === 'BTC' && toCurrency.symbol === 'USDT' ? 45000 : 1;
      const calculatedAmount = parseFloat(fromAmount) * mockRate;
      setToAmount(calculatedAmount.toString());
    }
  };

  const handleToCurrencySelect = (currency: Currency) => {
    setToCurrency(currency);
    // Recalculate amounts if both are set
    if (fromAmount) {
      const mockRate = fromCurrency.symbol === 'BTC' && currency.symbol === 'USDT' ? 45000 : 1;
      const calculatedAmount = parseFloat(fromAmount) * mockRate;
      setToAmount(calculatedAmount.toString());
    }
  };

  const canSwap = fromAmount && toAmount && parseFloat(fromAmount) > 0;

  const handleSwap = () => {
    if (canSwap) {
      console.log('Executing swap:', {
        from: { currency: fromCurrency.symbol, amount: fromAmount },
        to: { currency: toCurrency.symbol, amount: toAmount }
      });
      // Navigate to swap confirmation screen
      navigate('ModernSwapConfirmationScreen', {
        state: {
          fromCurrency: fromCurrency.symbol,
          toCurrency: toCurrency.symbol,
          fromAmount: fromAmount,
          toAmount: toAmount
        }
      });
    }
  };

  return (
    <div
      style={{
        height: '100vh',
        background: '#121212',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
      {/* Header */}
      <ModernHeader title="Swap" onBack={() => navigate('MainScreen')} showBackButton={true} />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '8px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
          overflow: 'hidden'
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
            availableCurrencies={availableFromCurrencies}
            label="Vendre"
            placeholder="0"
            balance={fromCurrency.balance}
            onDropdownToggle={setFromDropdownOpen}
            slippage={slippage}
            onSlippageChange={setSlippage}
            showSlippageSettings={true}
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
            margin: '0',
            position: 'relative',
            zIndex: fromDropdownOpen || toDropdownOpen ? 0 : 50
          }}>
          <ModernSwapButton onSwap={handleSwapCurrencies} disabled={false} />
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
            availableCurrencies={availableToCurrencies}
            label="Acheter"
            placeholder="0"
            balance={toCurrency.balance}
            onDropdownToggle={setToDropdownOpen}
          />
        </motion.div>

        {/* Review Swap Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          style={{ marginTop: '10px' }}>
          <ModernButton variant="primary" size="large" fullWidth disabled={!canSwap} onClick={handleSwap}>
            {canSwap ? 'Review Swap' : 'Enter amount'}
          </ModernButton>
        </motion.div>

        {/* Rate Info */}
        {fromAmount && toAmount && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '6px',
              padding: '6px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              marginTop: '8px'
            }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>Rate</span>
              <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '500' }}>
                1 {fromCurrency.symbol} ≈{' '}
                {fromCurrency.symbol === 'BTC' && toCurrency.symbol === 'USDT' ? '45,000' : '1.00'} {toCurrency.symbol}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>Slippage</span>
                <span style={{ fontSize: '12px', color: 'var(--modern-accent-primary)', fontWeight: '500' }}>
                  {slippage}%
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1px' }}>
                <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>Fee</span>
                <span style={{ fontSize: '12px', color: '#34c759', fontWeight: '500' }}>0.1%</span>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
