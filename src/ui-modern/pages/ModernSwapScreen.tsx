import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useNavigate } from '@/ui/pages/MainRoute';
import { usePrice } from '@/ui/provider/PriceProvider';
import { useAccountBalance } from '@/ui/state/accounts/hooks';
import { useWallet } from '@/ui/utils';

import { ModernButton } from '../components/common/ModernButton';
import { ModernHeader } from '../components/layout/ModernHeader';
import { Currency } from '../components/wallet/ModernCurrencySelector';
import { ModernSwapButton } from '../components/wallet/ModernSwapButton';
import { ModernSwapCard } from '../components/wallet/ModernSwapCard';
import { getAssetLogo } from '../config/asset-logos';
import { useSimplicityTokens } from '../hooks/useSimplicityTokens';
import { useAssets } from '../providers/AssetProvider';

export const ModernSwapScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const accountBalance = useAccountBalance();
  const { assets: userAssets, loading: assetsLoading } = useAssets();
  const { tokens: simplicityTokens, loading: simplicityLoading } = useSimplicityTokens();
  const { coinPrice } = usePrice();
  const wallet = useWallet();
  const { t } = useTranslation();

  // Get selected asset from navigation state
  const selectedAsset = (location.state as any)?.selectedAsset;

  console.log('ModernSwapScreen - Selected asset:', selectedAsset);

  // States
  const [fromAmount, setFromAmount] = useState('');
  const [toAmount, setToAmount] = useState('');
  const [fromDropdownOpen, setFromDropdownOpen] = useState(false);
  const [toDropdownOpen, setToDropdownOpen] = useState(false);
  const [slippage, setSlippage] = useState(1);

  // Token price states
  const [fromTokenPrice, setFromTokenPrice] = useState<number>(0);
  const [toTokenPrice, setToTokenPrice] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState<Record<string, boolean>>({});

  // Use real BTC balance from wallet
  const btcBalance = accountBalance?.availableBalance ? (accountBalance.availableBalance / 100000000).toFixed(8) : '0';

  console.log('Account Balance object:', accountBalance);
  console.log('BTC Balance from account:', btcBalance);

  // Helper function to get asset icon
  const getAssetIcon = (symbol: string, name: string, type: string, size = 22) => {
    // BTC gets a special gradient icon
    if (type === 'btc' || symbol === 'BTC') {
      return (
        <div
          style={{
            width: `${size}px`,
            height: `${size}px`,
            minWidth: `${size}px`,
            minHeight: `${size}px`,
            maxWidth: `${size}px`,
            maxHeight: `${size}px`,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f7931a 0%, #ffb347 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.floor(size * 0.6)}px`,
            fontWeight: 'bold',
            color: '#ffffff',
            flexShrink: 0,
            boxSizing: 'border-box'
          }}>
          ₿
        </div>
      );
    }

    // Try to get asset logo from config
    const logoPath = getAssetLogo(symbol, name, type);
    if (logoPath) {
      return (
        <img
          src={logoPath}
          alt={name}
          style={{
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }

    // Fallback to text with first letter
    return (
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: `${Math.floor(size * 0.4)}px`,
          fontWeight: '600'
        }}>
        {symbol?.charAt(0) || name.charAt(0)}
      </div>
    );
  };

  // Function to fetch token price from the API
  const fetchTokenPrice = useCallback(
    async (symbol: string, type: 'from' | 'to') => {
      if (symbol === 'BTC') {
        return;
      }

      setPriceLoading((prev) => ({ ...prev, [symbol]: true }));

      try {
        const priceMap = await wallet.getSimplicitysPrice([symbol]);
        const price = priceMap[symbol];
        const priceValue = price ? price.curPrice : 0;

        console.log(`Token price for ${symbol}:`, priceValue);

        if (type === 'from') {
          setFromTokenPrice(priceValue);
        } else {
          setToTokenPrice(priceValue);
        }
      } catch (error) {
        console.error('Failed to fetch token price for', symbol, error);
        if (type === 'from') {
          setFromTokenPrice(0);
        } else {
          setToTokenPrice(0);
        }
      } finally {
        setPriceLoading((prev) => ({ ...prev, [symbol]: false }));
      }
    },
    [wallet]
  );

  // Initialize currencies with selected asset or default BTC
  const [fromCurrency, setFromCurrency] = useState<Currency>(() => {
    // If we have a selected asset from navigation, use it
    if (selectedAsset) {
      return {
        symbol: selectedAsset.symbol,
        name: selectedAsset.name,
        balance: selectedAsset.amount,
        icon: getAssetIcon(selectedAsset.symbol, selectedAsset.name, selectedAsset.type)
      };
    }

    // Otherwise, use BTC if available
    if (parseFloat(btcBalance) > 0) {
      return {
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: btcBalance,
        icon: getAssetIcon('BTC', 'Bitcoin', 'btc')
      };
    }
    // Fallback to first available asset
    return {
      symbol: 'BTC',
      name: 'Bitcoin',
      balance: '0',
      icon: getAssetIcon('BTC', 'Bitcoin', 'btc')
    };
  });

  // Initialize toCurrency with a placeholder - will be updated when tokens load
  const [toCurrency, setToCurrency] = useState<Currency | null>(null);

  // Convert user assets to currencies for the "from" selector - now as state
  const [availableFromCurrencies, setAvailableFromCurrencies] = useState<Currency[]>([]);
  const [availableToCurrencies, setAvailableToCurrencies] = useState<Currency[]>([]);

  // Calculate currencies from user assets
  const calculateFromCurrencies = useMemo(() => {
    const currencies: Currency[] = [];

    console.log('User assets for Sell calculation:', userAssets);
    console.log('BTC Balance:', btcBalance, 'Type:', typeof btcBalance);
    console.log('BTC Balance parsed:', parseFloat(btcBalance));

    // Add BTC first if user has BTC balance
    if (parseFloat(btcBalance) > 0) {
      console.log('Adding BTC to currencies from accountBalance');
      currencies.push({
        symbol: 'BTC',
        name: 'Bitcoin',
        balance: btcBalance,
        icon: getAssetIcon('BTC', 'Bitcoin', 'btc', 18)
      });
    } else {
      console.log('BTC balance is 0 or invalid from accountBalance, checking userAssets');
      // Fallback: check if BTC is in userAssets
      const btcAsset = userAssets.find((asset) => asset.type === 'btc' || asset.symbol === 'BTC');
      if (btcAsset && parseFloat(btcAsset.amount) > 0) {
        console.log('Adding BTC to currencies from userAssets');
        currencies.push({
          symbol: 'BTC',
          name: 'Bitcoin',
          balance: btcAsset.amount,
          icon: getAssetIcon('BTC', 'Bitcoin', 'btc', 18)
        });
      } else {
        console.log('No BTC found in userAssets either');
      }
    }

    // Add all other assets that user owns (including Simplicity tokens, BRC20, etc.)
    userAssets.forEach((asset) => {
      console.log('Processing asset for Sell:', asset);
      // Skip BTC as it's already added above, but also check if BTC is in userAssets
      if (asset.type !== 'btc' && parseFloat(asset.amount) > 0) {
        currencies.push({
          symbol: asset.symbol || asset.name,
          name: asset.name,
          balance: asset.amount,
          icon: getAssetIcon(asset.symbol || asset.name, asset.name, asset.type, 18)
        });
      } else if (asset.type === 'btc' && parseFloat(asset.amount) > 0) {
        console.log('Found BTC in userAssets, but already added above');
      }
    });

    console.log('Available currencies for Sell:', currencies);
    return currencies;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAssets, btcBalance]);

  // Calculate currencies from Simplicity tokens
  const calculateToCurrencies = useMemo(() => {
    const currencies: Currency[] = [];

    // Add Simplicity tokens from API
    simplicityTokens.forEach((token) => {
      // Filter out tokens with 0 current supply or very low supply
      if (parseFloat(token.current_supply) > 0 && parseFloat(token.current_supply) > 100) {
        currencies.push({
          symbol: token.ticker,
          name: token.ticker,
          balance: '0', // User doesn't own these tokens initially
          icon: getAssetIcon(token.ticker, token.ticker, 'simplicity', 18)
        });
      }
    });

    return currencies;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [simplicityTokens]);

  // Initialize available currencies when data is loaded
  useEffect(() => {
    if (!assetsLoading && calculateFromCurrencies.length > 0) {
      setAvailableFromCurrencies(calculateFromCurrencies);
    }
  }, [calculateFromCurrencies, assetsLoading]);

  useEffect(() => {
    if (!simplicityLoading && calculateToCurrencies.length > 0) {
      setAvailableToCurrencies(calculateToCurrencies);
    }
  }, [calculateToCurrencies, simplicityLoading]);

  // Update fromCurrency when assets are loaded and available
  useEffect(() => {
    if (!assetsLoading && availableFromCurrencies.length > 0) {
      // If we have a selected asset, try to find it in available currencies
      if (selectedAsset) {
        const selectedCurrency = availableFromCurrencies.find((currency) => currency.symbol === selectedAsset.symbol);
        if (selectedCurrency) {
          setFromCurrency(selectedCurrency);
          return;
        }
      }

      // If current fromCurrency is not in available currencies, update it
      const currentFromExists = availableFromCurrencies.some((currency) => currency.symbol === fromCurrency.symbol);

      if (!currentFromExists) {
        setFromCurrency(availableFromCurrencies[0]);
      }
    }
  }, [availableFromCurrencies, assetsLoading, fromCurrency.symbol, selectedAsset]);

  // Update toCurrency when Simplicity tokens are loaded
  useEffect(() => {
    if (!simplicityLoading && availableToCurrencies.length > 0) {
      // If toCurrency is null (initial load), set it to the first token (highest volume)
      if (!toCurrency) {
        setToCurrency(availableToCurrencies[0]);
        return;
      }

      // If current toCurrency is not in available currencies, update it
      const currentToExists = availableToCurrencies.some((currency) => currency.symbol === toCurrency.symbol);

      if (!currentToExists) {
        setToCurrency(availableToCurrencies[0]);
      }
    }
  }, [availableToCurrencies, simplicityLoading, toCurrency]);

  // Fetch price when fromCurrency changes
  useEffect(() => {
    if (fromCurrency?.symbol && fromCurrency.symbol !== 'BTC') {
      fetchTokenPrice(fromCurrency.symbol, 'from');
    } else {
      setFromTokenPrice(0);
    }
  }, [fromCurrency, fetchTokenPrice]);

  // Fetch price when toCurrency changes
  useEffect(() => {
    if (toCurrency && toCurrency.symbol && toCurrency.symbol !== 'BTC') {
      fetchTokenPrice(toCurrency.symbol, 'to');
    } else {
      setToTokenPrice(0);
    }
  }, [toCurrency, fetchTokenPrice]);

  // Function to calculate quote based on real prices
  const calculateQuote = useCallback(
    async (fromAmount: string, fromCurrency: Currency, toCurrency: Currency): Promise<string> => {
      if (!fromAmount || parseFloat(fromAmount) === 0) return '0';

      const amount = parseFloat(fromAmount);
      console.log('Calculating quote:', {
        fromAmount,
        fromCurrency: fromCurrency.symbol,
        toCurrency: toCurrency.symbol
      });

      try {
        // If both currencies are BTC, return the same amount
        if (fromCurrency.symbol === 'BTC' && toCurrency.symbol === 'BTC') {
          return fromAmount;
        }

        // If fromCurrency is BTC
        if (fromCurrency.symbol === 'BTC') {
          const btcPrice = coinPrice?.btc || 0;
          if (btcPrice === 0) return '0';

          // Calculate USD value of BTC
          const usdValue = amount * btcPrice;

          // If toCurrency is also BTC, return the same amount
          if (toCurrency.symbol === 'BTC') {
            return fromAmount;
          }

          // If toCurrency is a token, get its price
          if (toCurrency.symbol !== 'BTC') {
            const priceMap = await wallet.getSimplicitysPrice([toCurrency.symbol]);
            const tokenPrice = priceMap[toCurrency.symbol];

            if (tokenPrice && tokenPrice.curPrice > 0) {
              // Token price in satoshis per token
              const tokenPriceInSats = tokenPrice.curPrice;
              // Convert to BTC then to USD
              const tokenPriceInBTC = tokenPriceInSats / 100000000;
              const tokenPriceInUSD = tokenPriceInBTC * btcPrice;

              // Calculate number of tokens based on USD value
              const tokenAmount = usdValue / tokenPriceInUSD;
              console.log('BTC to Token calculation:', { usdValue, tokenPriceInUSD, tokenAmount });
              return tokenAmount.toFixed(8);
            }
          }
        }

        // If fromCurrency is a token
        if (fromCurrency.symbol !== 'BTC') {
          const priceMap = await wallet.getSimplicitysPrice([fromCurrency.symbol]);
          const tokenPrice = priceMap[fromCurrency.symbol];

          if (tokenPrice && tokenPrice.curPrice > 0) {
            const btcPrice = coinPrice?.btc || 0;
            if (btcPrice === 0) return '0';

            // Calculate USD value of token
            const tokenPriceInSats = tokenPrice.curPrice;
            const tokenPriceInBTC = tokenPriceInSats / 100000000;
            const tokenPriceInUSD = tokenPriceInBTC * btcPrice;
            const usdValue = amount * tokenPriceInUSD;

            // If toCurrency is BTC
            if (toCurrency.symbol === 'BTC') {
              const btcAmount = usdValue / btcPrice;
              console.log('Token to BTC calculation:', { usdValue, btcPrice, btcAmount });
              return btcAmount.toFixed(8);
            }

            // If toCurrency is another token
            if (toCurrency.symbol !== 'BTC') {
              const toPriceMap = await wallet.getSimplicitysPrice([toCurrency.symbol]);
              const toTokenPrice = toPriceMap[toCurrency.symbol];

              if (toTokenPrice && toTokenPrice.curPrice > 0) {
                const toTokenPriceInSats = toTokenPrice.curPrice;
                const toTokenPriceInBTC = toTokenPriceInSats / 100000000;
                const toTokenPriceInUSD = toTokenPriceInBTC * btcPrice;

                const toTokenAmount = usdValue / toTokenPriceInUSD;
                console.log('Token to Token calculation:', { usdValue, toTokenPriceInUSD, toTokenAmount });
                return toTokenAmount.toFixed(8);
              }
            }
          }
        }

        return '0';
      } catch (error) {
        console.error('Error calculating quote:', error);
        return '0';
      }
    },
    [coinPrice, wallet]
  );

  const handleSwapCurrencies = () => {
    // Only swap if both currencies are available
    if (!toCurrency) return;

    // Sauvegarder les valeurs actuelles
    const tempCurrency = fromCurrency;
    const tempAmount = fromAmount;
    const tempFromCurrencies = availableFromCurrencies;
    const tempToCurrencies = availableToCurrencies;

    // Inverser les devises
    setFromCurrency(toCurrency);
    setToCurrency(tempCurrency);

    // Inverser les montants
    setFromAmount(toAmount);
    setToAmount(tempAmount);

    // Inverser les listes disponibles
    setAvailableFromCurrencies(tempToCurrencies);
    setAvailableToCurrencies(tempFromCurrencies);
  };

  const handleFromAmountChange = useCallback(
    async (value: string) => {
      setFromAmount(value);
      if (value && fromCurrency && toCurrency) {
        const calculatedAmount = await calculateQuote(value, fromCurrency, toCurrency);
        setToAmount(calculatedAmount);
      } else {
        setToAmount('');
      }
    },
    [fromCurrency, toCurrency, calculateQuote]
  );

  const handleToAmountChange = useCallback(
    async (value: string) => {
      setToAmount(value);
      if (value && fromCurrency && toCurrency) {
        // For reverse calculation, we swap the currencies
        const calculatedAmount = await calculateQuote(value, toCurrency, fromCurrency);
        setFromAmount(calculatedAmount);
      } else {
        setFromAmount('');
      }
    },
    [fromCurrency, toCurrency, calculateQuote]
  );

  const handleFromCurrencySelect = useCallback(
    async (currency: Currency) => {
      setFromCurrency(currency);
      if (fromAmount && toCurrency) {
        const calculatedAmount = await calculateQuote(fromAmount, currency, toCurrency);
        setToAmount(calculatedAmount);
      }
    },
    [fromAmount, toCurrency, calculateQuote]
  );

  const handleToCurrencySelect = useCallback(
    async (currency: Currency) => {
      setToCurrency(currency);
      if (fromAmount && fromCurrency) {
        const calculatedAmount = await calculateQuote(fromAmount, fromCurrency, currency);
        setToAmount(calculatedAmount);
      }
    },
    [fromAmount, fromCurrency, calculateQuote]
  );

  const canSwap = fromAmount && toAmount && parseFloat(fromAmount) > 0;

  // Calculate real exchange rate for display
  const realExchangeRate = useMemo(() => {
    if (!fromAmount || !toAmount || parseFloat(fromAmount) === 0) return null;

    const rate = parseFloat(toAmount) / parseFloat(fromAmount);
    return rate.toFixed(6);
  }, [fromAmount, toAmount]);

  // Format rate text with truncation if too long
  const formatRateText = useMemo(() => {
    if (!realExchangeRate || !toCurrency) return '0.000000';

    const rateText = `1 ${fromCurrency.symbol} ≈ ${realExchangeRate} ${toCurrency.symbol}`;

    // If text is too long, truncate the rate number
    if (rateText.length > 50) {
      const truncatedRate = parseFloat(realExchangeRate).toExponential(2);
      return `1 ${fromCurrency.symbol} ≈ ${truncatedRate} ${toCurrency.symbol}`;
    }

    return rateText;
  }, [realExchangeRate, fromCurrency.symbol, toCurrency]);

  // Calculate font size for rate text based on length
  const getRateFontSize = useMemo(() => {
    if (!realExchangeRate) return '10px';

    const length = formatRateText.length;
    const baseSize = 10;

    // More aggressive scaling for longer text
    if (length <= 15) return `${baseSize}px`;
    if (length <= 25) return `${baseSize * 0.85}px`;
    if (length <= 35) return `${baseSize * 0.75}px`;
    if (length <= 45) return `${baseSize * 0.65}px`;
    if (length <= 55) return `${baseSize * 0.55}px`;
    return `${baseSize * 0.45}px`;
  }, [formatRateText, realExchangeRate]);

  const handleSwap = () => {
    if (canSwap && toCurrency) {
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
      <ModernHeader title={t('swap')} onBack={() => navigate('MainScreen')} showBackButton={true} />

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
          style={{
            position: 'relative',
            zIndex: fromDropdownOpen ? 200 : 10
          }}>
          <ModernSwapCard
            type="pay"
            amount={fromAmount}
            onAmountChange={handleFromAmountChange}
            selectedCurrency={fromCurrency}
            onCurrencySelect={handleFromCurrencySelect}
            availableCurrencies={availableFromCurrencies}
            label="Sell"
            placeholder="0"
            balance={fromCurrency.balance}
            onDropdownToggle={setFromDropdownOpen}
            slippage={slippage}
            onSlippageChange={setSlippage}
            showSlippageSettings={true}
            btcPrice={coinPrice?.btc || 0}
            tokenPrice={fromTokenPrice}
            loading={assetsLoading || priceLoading[fromCurrency?.symbol || '']}
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
            zIndex: 150 // Entre les cards (10) et les dropdowns (200)
          }}>
          <ModernSwapButton onSwap={handleSwapCurrencies} disabled={false} />
        </motion.div>

        {/* To Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{
            position: 'relative',
            zIndex: 10
          }}>
          <ModernSwapCard
            type="receive"
            amount={toAmount}
            onAmountChange={handleToAmountChange}
            selectedCurrency={toCurrency}
            onCurrencySelect={handleToCurrencySelect}
            availableCurrencies={availableToCurrencies}
            label="Buy"
            placeholder="0"
            balance={toCurrency?.balance}
            onDropdownToggle={setToDropdownOpen}
            btcPrice={coinPrice?.btc || 0}
            tokenPrice={toTokenPrice}
            loading={simplicityLoading || priceLoading[toCurrency?.symbol || '']}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>Rate</span>
              <span
                style={{
                  fontSize: getRateFontSize,
                  color: 'rgba(255, 255, 255, 0.5)',
                  letterSpacing: '-0.2px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '100%'
                }}
                title={formatRateText}>
                {formatRateText}
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
