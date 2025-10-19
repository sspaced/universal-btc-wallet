import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../common/Card';

export interface BalanceProps {
  balance: string;
  unit: 'BTC' | 'sats';
  usdValue?: string;
  isLoading?: boolean;
  isHidden?: boolean;
  onToggleVisibility?: () => void;
  className?: string;
}

export const Balance: React.FC<BalanceProps> = ({
  balance,
  unit,
  usdValue,
  isLoading = false,
  isHidden = false,
  onToggleVisibility,
  className = ''
}) => {
  const [showUnit, setShowUnit] = useState<'BTC' | 'sats' | 'USD'>('BTC');

  const formatBalance = (value: string, displayUnit: string) => {
    if (isHidden) return '••••••';

    const numValue = parseFloat(value);

    switch (displayUnit) {
      case 'BTC':
        return `${(numValue / 100000000).toFixed(8)} BTC`;
      case 'sats':
        return `${numValue.toLocaleString()} sats`;
      case 'USD':
        return usdValue ? `$${parseFloat(usdValue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '--';
      default:
        return value;
    }
  };

  const getDisplayValue = () => {
    if (isLoading) return 'Loading...';
    return formatBalance(balance, showUnit);
  };

  const cycleUnit = () => {
    if (showUnit === 'BTC') setShowUnit('sats');
    else if (showUnit === 'sats') setShowUnit('USD');
    else setShowUnit('BTC');
  };

  return (
    <Card padding="lg" className={`apple-card ${className}`}>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium" style={{ color: 'var(--apple-secondary-label)' }}>
            Total Balance
          </span>

          <div className="flex items-center space-x-2">
            {/* Unit Toggle */}
            <button
              onClick={cycleUnit}
              className="apple-button apple-button-tertiary apple-button-small"
              style={{
                backgroundColor: 'var(--apple-gray-6)',
                color: 'var(--apple-blue)',
                fontSize: '12px',
                minHeight: '24px',
                padding: '4px 8px'
              }}
            >
              {showUnit}
            </button>

            {/* Visibility Toggle */}
            {onToggleVisibility && (
              <button
                onClick={onToggleVisibility}
                className="p-1 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                style={{ backgroundColor: 'var(--apple-gray-6)' }}
                aria-label={isHidden ? 'Show balance' : 'Hide balance'}
              >
                {isHidden ? (
                  <EyeIcon className="w-4 h-4" style={{ color: 'var(--apple-secondary-label)' }} />
                ) : (
                  <EyeSlashIcon className="w-4 h-4" style={{ color: 'var(--apple-secondary-label)' }} />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Balance Display */}
        <div className="mb-2">
          <div
            className="text-3xl font-bold"
            style={{
              color: 'var(--apple-label)',
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", system-ui, sans-serif',
              fontWeight: '700',
              letterSpacing: '-0.022em'
            }}
          >
            {getDisplayValue()}
          </div>
        </div>

        {/* Secondary Info */}
        {!isLoading && !isHidden && showUnit !== 'USD' && usdValue && (
          <div
            className="text-sm"
            style={{ color: 'var(--apple-secondary-label)' }}
          >
            ≈ ${parseFloat(usdValue).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })} USD
          </div>
        )}

        {/* Loading Animation */}
        {isLoading && (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-xl"
            style={{ backgroundColor: 'var(--apple-system-background)' }}
          >
            <div className="flex space-x-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--apple-blue)' }}
                  animate={{
                    y: [-4, 4, -4],
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.1,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Simple icon components (you can replace with your preferred icon library)
const EyeIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const EyeSlashIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
  </svg>
);