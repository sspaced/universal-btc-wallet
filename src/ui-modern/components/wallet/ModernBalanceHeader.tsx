import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { ChainType } from '@/shared/constant';
import { usePrice } from '@/ui/provider/PriceProvider';
import { useBTCUnit, useChainType } from '@/ui/state/settings/hooks';

import { EyeIcon, EyeOffIcon, RefreshIcon } from '../common/ModernIcons';

interface ModernBalanceHeaderProps {
  accountBalance: {
    totalBalance: number;
    availableBalance: number;
    unavailableBalance: number;
  };
  enableRefresh?: boolean;
  onRefresh?: () => void;
}

export const ModernBalanceHeader: React.FC<ModernBalanceHeaderProps> = ({
  accountBalance,
  enableRefresh = false,
  onRefresh
}) => {
  const chainType = useChainType();
  const btcUnit = useBTCUnit();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false); // Back to hover mode
  const { coinPrice, isLoadingCoinPrice } = usePrice();

  // State for price change data
  const [priceChange, setPriceChange] = useState<{
    change24h: number;
    changePercent: number;
  } | null>(null);

  // Fetch Bitcoin price change data
  const fetchPriceChange = async () => {
    try {
      // Use CoinGecko API for Bitcoin price change data
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true'
      );
      const data = await response.json();

      if (data.bitcoin) {
        const currentPrice = data.bitcoin.usd;
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
          changePercent: changePercent
        });
      }
    } catch (error) {
      console.error('Failed to fetch price change data:', error);
      // Fallback to mock data
      setPriceChange({
        change24h: 1.51,
        changePercent: 0.08
      });
    }
  };

  // Convert satoshis to BTC
  const satoshisToAmount = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8);
  };

  const totalAmount = satoshisToAmount(accountBalance.availableBalance);

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

  // Calculate price change display
  const priceChangeDisplay = useMemo(() => {
    if (!priceChange) {
      return {
        changeText: '+$1.51',
        percentageText: '+0.08%',
        isPositive: true
      };
    }

    const isPositive = priceChange.changePercent >= 0;
    const changeText = `${isPositive ? '+' : ''}$${Math.abs(priceChange.change24h).toFixed(2)}`;
    const percentageText = `${isPositive ? '+' : ''}${priceChange.changePercent.toFixed(2)}%`;

    return {
      changeText,
      percentageText,
      isPositive
    };
  }, [priceChange]);

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
          position: 'relative'
        }}>
        {!isBalanceHidden ? (
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
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}>
            <span
              style={{
                fontSize: '36px',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '-0.5px',
                lineHeight: 1
              }}>
              {displayAmount}
            </span>
            <span
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.8)',
                marginLeft: '6px',
                letterSpacing: '-0.5px'
              }}>
              {btcUnit}
            </span>
          </div>
        ) : (
          <div
            style={{
              fontSize: '36px',
              color: 'rgba(255, 255, 255, 0.3)',
              letterSpacing: '6px'
            }}>
            ••••••
          </div>
        )}

        {/* Balance Details Tooltip - Positioned with left: 20% */}
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: -10, scaleY: 0 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: -10, scaleY: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: '100%',
              left: '20%',
              marginTop: '4px',
              width: 'fit-content',
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '6px',
              padding: '8px 12px',
              minWidth: '200px',
              zIndex: 1000,
              backdropFilter: 'blur(8px)',
              transformOrigin: 'top center'
            }}>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
              <span>Available </span>
              <span style={{ color: '#34c759', fontWeight: '500' }}>
                {balanceDetails.available} {btcUnit}
              </span>
            </div>
            {accountBalance.unavailableBalance > 0 && (
              <div
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginTop: '4px',
                  textAlign: 'center',
                  lineHeight: '1.4'
                }}>
                <span>Unavailable </span>
                <span style={{ color: '#ff9500', fontWeight: '500' }}>
                  {balanceDetails.unavailable} {btcUnit}
                </span>
              </div>
            )}
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.7)',
                marginTop: '4px',
                paddingTop: '4px',
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
              <span>Total </span>
              <span style={{ color: '#ffffff', fontWeight: '500' }}>
                {balanceDetails.total} {btcUnit}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Price Change */}
      {!isBalanceHidden && (
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
      )}

      {/* Actions Row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px'
        }}>
        {/* Hide/Show Balance */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsBalanceHidden(!isBalanceHidden)}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          {isBalanceHidden ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </motion.button>

        {/* Refresh Button */}
        {enableRefresh && onRefresh && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              padding: '6px 10px',
              cursor: 'pointer',
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <RefreshIcon size={18} />
          </motion.button>
        )}
      </div>
    </div>
  );
};
