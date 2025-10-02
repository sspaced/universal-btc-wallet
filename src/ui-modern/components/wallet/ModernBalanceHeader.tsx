import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { ChainType } from '@/shared/constant';
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

  // Convert satoshis to BTC
  const satoshisToAmount = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8);
  };

  const totalAmount = satoshisToAmount(accountBalance.totalBalance);

  const { intPart, decPart, displayAmount } = useMemo(() => {
    const [intPart, decPart] = totalAmount.split('.');

    // For very small amounts, show more decimal places
    const numValue = parseFloat(totalAmount);
    let displayAmount;

    if (numValue < 0.0001) {
      displayAmount = numValue.toFixed(8);
    } else if (numValue < 0.001) {
      displayAmount = numValue.toFixed(6);
    } else if (numValue < 0.01) {
      displayAmount = numValue.toFixed(5);
    } else {
      displayAmount = numValue.toFixed(4);
    }

    const result = {
      intPart,
      decPart: decPart || '00000000',
      displayAmount
    };

    // Debug log
    console.log('=== DECIMAL CALCULATION DEBUG ===');
    console.log('numValue:', numValue);
    console.log('displayAmount:', result.displayAmount);
    console.log('================================');

    return result;
  }, [totalAmount]);

  const isBTCChain =
    chainType === ChainType.BITCOIN_MAINNET ||
    chainType === ChainType.BITCOIN_TESTNET ||
    chainType === ChainType.BITCOIN_TESTNET4 ||
    chainType === ChainType.BITCOIN_SIGNET;

  // Debug logs
  useEffect(() => {
    console.log('=== ModernBalanceHeader DEBUG ===');
    console.log('Account balance received:', accountBalance);
    console.log('Total balance:', accountBalance.totalBalance);
    console.log('Available balance:', accountBalance.availableBalance);
    console.log('Unavailable balance:', accountBalance.unavailableBalance);
    console.log('Total amount (BTC):', totalAmount);
    console.log('Display amount:', displayAmount);
    console.log('================================');
  }, [accountBalance, totalAmount, displayAmount]);

  // Mock price change data (TODO: fetch from API)
  const priceChange = '+$1.51';
  const percentageChange = '+0.08%';
  const isPositive = true;

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
          marginBottom: '8px'
        }}>
        {!isBalanceHidden ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '4px'
            }}>
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
              color: isPositive ? '#34c759' : '#ff3b30'
            }}>
            {priceChange}
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isPositive ? '#34c759' : '#ff3b30',
              backgroundColor: isPositive ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.15)',
              padding: '2px 8px',
              borderRadius: '6px'
            }}>
            {percentageChange}
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
