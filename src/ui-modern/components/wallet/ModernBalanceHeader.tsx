import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { usePrice } from '@/ui/provider/PriceProvider';
import { useBTCUnit, useChainType } from '@/ui/state/settings/hooks';

import { useAssets } from '../../providers/AssetProvider';
import { RefreshIcon } from '../common/ModernIcons';

interface ModernBalanceHeaderProps {
  accountBalance: {
    totalBalance: number;
    availableBalance: number;
    unavailableBalance: number;
  };
  enableRefresh?: boolean;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  isSwitching?: boolean;
}

export const ModernBalanceHeader: React.FC<ModernBalanceHeaderProps> = ({
  accountBalance,
  enableRefresh = false,
  onRefresh,
  isRefreshing = false,
  isSwitching = false
}) => {
  const chainType = useChainType();
  const btcUnit = useBTCUnit();
  const [showTooltip, setShowTooltip] = useState(false); // Back to hover mode
  const { coinPrice, isLoadingCoinPrice } = usePrice();
  const { assets, loading: assetsLoading } = useAssets();

  // State for price change data
  const [priceChange, setPriceChange] = useState<{
    change24h: number;
    changePercent: number;
    currentPrice: number;
    currentPriceEUR: number;
  } | null>(null);

  // Fetch Bitcoin price change data
  const fetchPriceChange = async () => {
    try {
      // Use CoinGecko API for Bitcoin price change data in both USD and EUR
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd,eur&include_24hr_change=true'
      );
      const data = await response.json();

      if (data.bitcoin) {
        const currentPrice = data.bitcoin.usd;
        const currentPriceEUR = data.bitcoin.eur;
        const changePercent = data.bitcoin.usd_24h_change || 0;

        // Calculate absolute change in USD
        // changePercent = (currentPrice - oldPrice) / oldPrice * 100
        // So: oldPrice = currentPrice / (1 + changePercent/100)
        const oldPrice = currentPrice / (1 + changePercent / 100);
        const change24h = currentPrice - oldPrice;

        console.log('=== PRICE CHANGE CALCULATION DEBUG ===');
        console.log('Current price:', currentPrice);
        console.log('Change percent:', changePercent);
        console.log('Old price (calculated):', oldPrice);
        console.log('Change 24h (absolute):', change24h);
        console.log('========================================');

        setPriceChange({
          change24h: change24h,
          changePercent: changePercent,
          currentPrice: currentPrice,
          currentPriceEUR: currentPriceEUR
        });
      }
    } catch (error) {
      console.error('Failed to fetch price change data:', error);
      // Fallback to mock data
      setPriceChange({
        change24h: 1.51,
        changePercent: 0.08,
        currentPrice: 50000,
        currentPriceEUR: 46000
      });
    }
  };

  // Convert satoshis to BTC
  const satoshisToAmount = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8);
  };

  const totalAmount = satoshisToAmount(accountBalance.availableBalance);

  // Calculate total portfolio value in USD (sum of all assets)
  const usdValue = useMemo(() => {
    if (assetsLoading || assets.length === 0) {
      // Fallback to BTC-only calculation if assets are not loaded yet
      if (!priceChange) return '0.00';
      const btcAmount = parseFloat(totalAmount);
      const usdAmount = btcAmount * priceChange.currentPrice;
      return usdAmount.toFixed(2);
    }

    // Calculate the sum of all assets' USD values
    const totalUSD = assets.reduce((sum, asset) => {
      // Extract numeric value from usdValue (format: "$123.45")
      const usdValueStr = asset.usdValue.replace('$', '').replace(',', '');
      const usdValue = parseFloat(usdValueStr) || 0;
      return sum + usdValue;
    }, 0);

    return totalUSD.toFixed(2);
  }, [assets, assetsLoading, totalAmount, priceChange]);

  // Calculate detailed balance amounts for tooltip
  const balanceDetails = useMemo(() => {
    const availableAmount = satoshisToAmount(accountBalance.availableBalance);
    const unavailableAmount = satoshisToAmount(accountBalance.unavailableBalance);
    const totalAmount = satoshisToAmount(accountBalance.totalBalance);

    return {
      available: availableAmount,
      unavailable: unavailableAmount,
      total: totalAmount
    };
  }, [accountBalance]);

  const { intPart, decPart, displayAmount } = useMemo(() => {
    const [intPart, decPart] = totalAmount.split('.');

    // For very small amounts, show more decimal places
    const numValue = parseFloat(totalAmount);
    let displayAmount;

    if (numValue < 0.001) {
      displayAmount = numValue.toFixed(8); // Show 8 decimals for very small amounts
    } else if (numValue < 0.01) {
      displayAmount = numValue.toFixed(6);
    } else if (numValue < 0.1) {
      displayAmount = numValue.toFixed(5);
    } else {
      displayAmount = numValue.toFixed(4);
    }

    // Debug log for decimal calculation
    console.log('=== DECIMAL CALCULATION DEBUG ===');
    console.log('numValue:', numValue);
    console.log('numValue < 0.001:', numValue < 0.001);
    console.log('numValue < 0.01:', numValue < 0.01);
    console.log('numValue < 0.1:', numValue < 0.1);
    console.log('displayAmount:', displayAmount);
    console.log('================================');

    const result = {
      intPart,
      decPart: decPart || '00000000',
      displayAmount
    };

    return result;
  }, [totalAmount]);

  const isBTCChain =
    chainType === ChainType.BITCOIN_MAINNET ||
    chainType === ChainType.BITCOIN_TESTNET ||
    chainType === ChainType.BITCOIN_TESTNET4 ||
    chainType === ChainType.BITCOIN_SIGNET;

  // Fetch price change data on component mount
  useEffect(() => {
    fetchPriceChange();
  }, []);

  // Debug logs
  useEffect(() => {
    console.log('=== ModernBalanceHeader DEBUG ===');
    console.log('Account balance received:', accountBalance);
    console.log('Total balance:', accountBalance.totalBalance);
    console.log('Available balance:', accountBalance.availableBalance);
    console.log('Unavailable balance:', accountBalance.unavailableBalance);
    console.log('Available amount (BTC):', totalAmount);
    console.log('Display amount:', displayAmount);
    console.log('Price change data:', priceChange);
    console.log('================================');
  }, [accountBalance, totalAmount, displayAmount, priceChange]);

  // Calculate price change display based on wallet value in USD
  const priceChangeDisplay = useMemo(() => {
    if (!priceChange) {
      return {
        changeText: '+$1.51',
        percentageText: '+0.08%',
        isPositive: true
      };
    }

    // Calculate wallet value change based on BTC amount
    const walletBTCAmount = parseFloat(totalAmount);

    // Use the current USD price from the API response
    const effectiveCurrentPriceUSD = priceChange.currentPrice;

    const currentWalletValueUSD = walletBTCAmount * effectiveCurrentPriceUSD;

    // Calculate previous wallet value (24h ago) - using USD price change
    const previousPriceUSD = effectiveCurrentPriceUSD / (1 + priceChange.changePercent / 100);
    const previousWalletValueUSD = walletBTCAmount * previousPriceUSD;

    // Calculate wallet value change in USD
    const walletValueChange = currentWalletValueUSD - previousWalletValueUSD;
    const walletValueChangePercent =
      previousWalletValueUSD > 0 ? (walletValueChange / previousWalletValueUSD) * 100 : 0;

    const isPositive = walletValueChange >= 0;
    const changeText = `${isPositive ? '+' : ''}$${Math.abs(walletValueChange).toFixed(2)}`;
    const percentageText = `${isPositive ? '+' : ''}${walletValueChangePercent.toFixed(2)}%`;

    console.log('=== WALLET VALUE CHANGE CALCULATION (USD) ===');
    console.log('Wallet BTC amount:', walletBTCAmount);
    console.log('priceChange.currentPrice:', priceChange.currentPrice);
    console.log('priceChange.changePercent:', priceChange.changePercent);
    console.log('Previous USD price:', previousPriceUSD);
    console.log('Current wallet value USD:', currentWalletValueUSD);
    console.log('Previous wallet value USD:', previousWalletValueUSD);
    console.log('Wallet value change USD:', walletValueChange);
    console.log('Wallet value change percent:', walletValueChangePercent);
    console.log('============================================');

    return {
      changeText,
      percentageText,
      isPositive
    };
  }, [priceChange, totalAmount, coinPrice]);

  return (
    <div
      style={{
        padding: '24px 20px',
        background: 'transparent'
      }}>
      {/* Balance Display */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '8px',
          position: 'relative',
          width: '100%'
        }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '4px',
            cursor: 'pointer',
            width: '100%'
          }}
          onMouseEnter={() => !isSwitching && setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}>
          {isSwitching ? (
            // Skeleton loader pendant le switch
            <div
              style={{
                width: '200px',
                height: '44px',
                background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
                borderRadius: '8px'
              }}
            />
          ) : (
            <span
              style={{
                fontSize: '36px',
                fontWeight: '500',
                color: '#ffffff',
                letterSpacing: '-0.5px',
                lineHeight: 1
              }}>
              ${usdValue}
            </span>
          )}
        </div>
        
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>

        {/* Portfolio Breakdown Tooltip */}
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '5%',
              marginTop: '4px',
              width: 'fit-content',
              maxWidth: 'calc(100vw - 40px)',
              backgroundColor: 'rgba(0, 0, 0, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '16px',
              minWidth: '280px',
              zIndex: 1000,
              backdropFilter: 'blur(8px)',
              transformOrigin: 'top left'
            }}>
            <div
              style={{
                fontSize: '16px',
                fontWeight: '600',
                marginBottom: '12px',
                color: '#ffffff',
                textAlign: 'center'
              }}>
              Portfolio Breakdown
            </div>

            {/* BTC Balance Details */}
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                lineHeight: '1.4',
                marginBottom: '8px'
              }}>
              <span>BTC Available </span>
              <span style={{ color: '#34c759', fontWeight: '500' }}>
                {balanceDetails.available} {btcUnit}
              </span>
            </div>

            {accountBalance.unavailableBalance > 0 && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  textAlign: 'center',
                  lineHeight: '1.4',
                  marginBottom: '8px'
                }}>
                <span>BTC Unavailable </span>
                <span style={{ color: '#ff9500', fontWeight: '500' }}>
                  {balanceDetails.unavailable} {btcUnit}
                </span>
              </div>
            )}

            {/* Assets breakdown */}
            {!assetsLoading && assets.length > 0 && (
              <>
                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingTop: '8px',
                    marginTop: '8px'
                  }}>
                  {assets.slice(0, 5).map((asset) => {
                    const usdValueStr = asset.usdValue.replace('$', '').replace(',', '');
                    const usdValue = parseFloat(usdValueStr) || 0;
                    return (
                      <div
                        key={asset.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          marginBottom: '4px',
                          fontSize: '12px'
                        }}>
                        <span style={{ color: 'rgba(255, 255, 255, 0.8)', textTransform: 'capitalize' }}>
                          {asset.type === 'btc' ? 'Bitcoin' : asset.name}
                        </span>
                        <span style={{ color: '#ffffff', fontWeight: '500' }}>${usdValue.toFixed(2)}</span>
                      </div>
                    );
                  })}
                  {assets.length > 5 && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        textAlign: 'center',
                        marginTop: '4px'
                      }}>
                      +{assets.length - 5} more assets
                    </div>
                  )}
                </div>

                <div
                  style={{
                    borderTop: '1px solid rgba(255, 255, 255, 0.2)',
                    paddingTop: '8px',
                    marginTop: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}>
                  <span style={{ color: '#ffffff' }}>Total Portfolio</span>
                  <span style={{ color: '#34C759' }}>${usdValue}</span>
                </div>
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Price Change */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          marginBottom: '16px'
        }}>
        <span
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: priceChangeDisplay.isPositive ? '#34c759' : '#ff3b30'
          }}>
          {priceChangeDisplay.changeText}
        </span>
        <span
          style={{
            fontSize: '14px',
            fontWeight: '500',
            color: priceChangeDisplay.isPositive ? '#34c759' : '#ff3b30',
            backgroundColor: priceChangeDisplay.isPositive ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.15)',
            padding: '2px 8px',
            borderRadius: '6px'
          }}>
          {priceChangeDisplay.percentageText}
        </span>
      </div>

      {/* Actions Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
        {/* Refresh Button */}
        {enableRefresh && onRefresh && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            disabled={isRefreshing}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              color: isRefreshing ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.7)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isRefreshing ? 0.6 : 1
            }}>
            <motion.div
              animate={isRefreshing ? { rotate: 360 } : { rotate: 0 }}
              transition={isRefreshing ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0.2 }}>
              <RefreshIcon size={18} />
            </motion.div>
          </motion.button>
        )}
      </div>
    </div>
  );
};
