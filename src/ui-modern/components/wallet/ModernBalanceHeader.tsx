import { motion } from 'framer-motion';
import React, { useMemo, useState } from 'react';

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
  onRefresh,
}) => {
  const chainType = useChainType();
  const btcUnit = useBTCUnit();
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);

  // Convert satoshis to BTC
  const satoshisToAmount = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8);
  };

  const totalAmount = satoshisToAmount(accountBalance.totalBalance);

  const { intPart, decPart } = useMemo(() => {
    const [intPart, decPart] = totalAmount.split('.');
    return {
      intPart,
      decPart: decPart || '00000000',
    };
  }, [totalAmount]);

  const isBTCChain =
    chainType === ChainType.BITCOIN_MAINNET ||
    chainType === ChainType.BITCOIN_TESTNET ||
    chainType === ChainType.BITCOIN_TESTNET4 ||
    chainType === ChainType.BITCOIN_SIGNET;

  // Mock price change data (TODO: fetch from API)
  const priceChange = '+$1.51';
  const percentageChange = '+0.08%';
  const isPositive = true;

  return (
    <div
      style={{
        padding: '24px 20px',
        background: 'transparent',
      }}
    >
      {/* Balance Display */}
      <div
        style={{
          textAlign: 'center',
          marginBottom: '8px',
        }}
      >
        {!isBalanceHidden ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'center',
              gap: '4px',
            }}
          >
            <span
              style={{
                fontSize: '48px',
                fontWeight: '700',
                color: '#ffffff',
                letterSpacing: '-1px',
                lineHeight: 1,
              }}
            >
              {intPart}
            </span>
            <span
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: 'rgba(255, 255, 255, 0.6)',
                letterSpacing: '-0.5px',
              }}
            >
              .{decPart.substring(0, 3)}
            </span>
            <span
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.8)',
                marginLeft: '8px',
                letterSpacing: '-0.5px',
              }}
            >
              {btcUnit}
            </span>
          </div>
        ) : (
          <div
            style={{
              fontSize: '48px',
              color: 'rgba(255, 255, 255, 0.3)',
              letterSpacing: '8px',
            }}
          >
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
            marginBottom: '16px',
          }}
        >
          <span
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isPositive ? '#34c759' : '#ff3b30',
            }}
          >
            {priceChange}
          </span>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: isPositive ? '#34c759' : '#ff3b30',
              backgroundColor: isPositive ? 'rgba(52, 199, 89, 0.15)' : 'rgba(255, 59, 48, 0.15)',
              padding: '2px 8px',
              borderRadius: '6px',
            }}
          >
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
          gap: '12px',
        }}
      >
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
            justifyContent: 'center',
          }}
        >
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
              justifyContent: 'center',
            }}
          >
            <RefreshIcon size={18} />
          </motion.button>
        )}
      </div>
    </div>
  );
};
