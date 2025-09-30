import React, { useState, useEffect, useMemo } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import toast from 'react-hot-toast';

interface FeeRate {
  priority: 'low' | 'medium' | 'high' | 'custom';
  satPerByte: number;
  confirmationTime: string;
  label: string;
  description: string;
}

interface FeeEstimate {
  totalFee: number;
  totalFeeUSD?: number;
  effectiveFeeRate: number;
  txSize: number;
  inputCount: number;
  outputCount: number;
}

interface FeeEstimatorProps {
  amount: string;
  recipientAddress: string;
  utxos?: any[]; // In real implementation, this would be UTXO array
  onFeeChange: (feeEstimate: FeeEstimate) => void;
  className?: string;
}

export const FeeEstimator: React.FC<FeeEstimatorProps> = ({
  amount,
  recipientAddress,
  utxos = [],
  onFeeChange,
  className = ''
}) => {
  const [selectedPriority, setSelectedPriority] = useState<'low' | 'medium' | 'high' | 'custom'>('medium');
  const [customFeeRate, setCustomFeeRate] = useState<number>(10);
  const [networkFeeRates, setNetworkFeeRates] = useState<Record<string, number>>({
    low: 1,
    medium: 5,
    high: 10
  });
  const [btcToUSD, setBtcToUSD] = useState<number>(45000); // Mock price
  const [isLoadingRates, setIsLoadingRates] = useState(false);

  // Simulated fee rates with descriptions
  const feeRates: FeeRate[] = [
    {
      priority: 'low',
      satPerByte: networkFeeRates.low,
      confirmationTime: '60+ min',
      label: 'Low Priority',
      description: 'Cheapest option, slower confirmation'
    },
    {
      priority: 'medium',
      satPerByte: networkFeeRates.medium,
      confirmationTime: '10-30 min',
      label: 'Medium Priority',
      description: 'Balanced cost and speed'
    },
    {
      priority: 'high',
      satPerByte: networkFeeRates.high,
      confirmationTime: '1-10 min',
      label: 'High Priority',
      description: 'Fastest confirmation, higher cost'
    },
    {
      priority: 'custom',
      satPerByte: customFeeRate,
      confirmationTime: estimateConfirmationTime(customFeeRate),
      label: 'Custom',
      description: 'Set your own fee rate'
    }
  ];

  // Load current network fee rates
  useEffect(() => {
    const loadFeeRates = async () => {
      setIsLoadingRates(true);
      try {
        // In real implementation, fetch from fee estimation API
        // For demo, simulate network request with dynamic rates
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Simulate real-time fee rates
        const baseRate = Math.max(1, Math.floor(Math.random() * 15) + 1);
        setNetworkFeeRates({
          low: Math.max(1, Math.floor(baseRate * 0.5)),
          medium: baseRate,
          high: Math.floor(baseRate * 2)
        });
      } catch (error) {
        console.error('Failed to load fee rates:', error);
        toast.error('Failed to load current fee rates');
      } finally {
        setIsLoadingRates(false);
      }
    };

    loadFeeRates();
    // Refresh fee rates every 30 seconds
    const interval = setInterval(loadFeeRates, 30000);
    return () => clearInterval(interval);
  }, []);

  function estimateConfirmationTime(satPerByte: number): string {
    if (satPerByte >= 15) return '1-5 min';
    if (satPerByte >= 8) return '5-15 min';
    if (satPerByte >= 4) return '15-60 min';
    if (satPerByte >= 2) return '1-3 hours';
    return '3+ hours';
  }

  // Calculate transaction size and fee
  const feeEstimate = useMemo(() => {
    if (!amount || !recipientAddress || parseFloat(amount) <= 0) {
      return {
        totalFee: 0,
        totalFeeUSD: 0,
        effectiveFeeRate: 0,
        txSize: 0,
        inputCount: 0,
        outputCount: 0
      };
    }

    const amountSats = Math.floor(parseFloat(amount) * 100000000);

    // Only proceed if we have a valid amount
    if (amountSats <= 0) {
      return {
        totalFee: 0,
        totalFeeUSD: 0,
        effectiveFeeRate: 0,
        txSize: 0,
        inputCount: 0,
        outputCount: 0
      };
    }

    // Simplified UTXO selection (in real implementation, use proper coin selection)
    const mockUTXOs = [
      { value: amountSats + 50000, size: 148 }, // Assume we have sufficient UTXOs
    ];

    // Calculate transaction size
    const inputCount = mockUTXOs.length;
    const outputCount = 2; // recipient + change

    // Transaction size calculation (simplified)
    const baseSize = 10; // version, locktime, etc.
    const inputSize = inputCount * 148; // P2WPKH input
    const outputSize = outputCount * 34; // P2WPKH output
    const witnessSize = inputCount * 108; // Witness data

    // Calculate virtual size (vsize) for segwit
    const txSize = Math.ceil(baseSize + inputSize + outputSize + (witnessSize / 4));

    const currentFeeRate = selectedPriority === 'custom' ? customFeeRate : networkFeeRates[selectedPriority] || 1;
    const totalFeeSats = txSize * currentFeeRate;
    const totalFee = totalFeeSats / 100000000;
    const totalFeeUSD = totalFee * btcToUSD;

    return {
      totalFee: isFinite(totalFee) ? totalFee : 0,
      totalFeeUSD: isFinite(totalFeeUSD) ? totalFeeUSD : 0,
      effectiveFeeRate: currentFeeRate,
      txSize,
      inputCount,
      outputCount
    };
  }, [amount, recipientAddress, selectedPriority, customFeeRate, networkFeeRates, btcToUSD]);

  // Notify parent component of fee changes
  useEffect(() => {
    onFeeChange(feeEstimate);
  }, [feeEstimate, onFeeChange]);

  const handlePriorityChange = (priority: 'low' | 'medium' | 'high' | 'custom') => {
    setSelectedPriority(priority);
    if (priority === 'custom' && customFeeRate < 1) {
      setCustomFeeRate(1);
    }
  };

  const getFeeDifference = (priority: string) => {
    if (!feeEstimate.txSize || !networkFeeRates.medium) return null;

    const mediumFee = networkFeeRates.medium * feeEstimate.txSize / 100000000;
    const thisFee = networkFeeRates[priority] * feeEstimate.txSize / 100000000;

    if (mediumFee === 0 || !isFinite(mediumFee) || !isFinite(thisFee)) return null;

    const difference = ((thisFee - mediumFee) / mediumFee) * 100;

    if (Math.abs(difference) < 1) return null;
    return difference > 0 ? `+${difference.toFixed(0)}%` : `${difference.toFixed(0)}%`;
  };

  const formatBTC = (value: number) => {
    if (!isFinite(value) || value === 0) return '0 BTC';
    return value.toFixed(8).replace(/\.?0+$/, '') + ' BTC';
  };

  const formatUSD = (value: number) => {
    if (!isFinite(value) || value === 0) return '$0.00';
    return '$' + value.toFixed(2);
  };

  return (
    <Card padding="lg" className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--apple-label)' }}>
          Network Fee
        </h3>
        <div className="text-right">
          <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
            {isLoadingRates ? 'Updating...' : 'Live rates'}
          </p>
          <div className="flex items-center space-x-2">
            <p className="font-semibold" style={{ color: 'var(--apple-label)' }}>
              {formatBTC(feeEstimate.totalFee)}
            </p>
            {feeEstimate.totalFeeUSD > 0 && (
              <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                ({formatUSD(feeEstimate.totalFeeUSD)})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fee Priority Options */}
      <div className="space-y-3 mb-4">
        {feeRates.slice(0, 3).map((rate) => {
          const isSelected = selectedPriority === rate.priority;
          const feeDiff = getFeeDifference(rate.priority);

          return (
            <button
              key={rate.priority}
              onClick={() => handlePriorityChange(rate.priority)}
              className={`w-full rounded-xl text-left transition-all ${
                isSelected ? 'ring-2' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
              style={{
                backgroundColor: isSelected ? 'var(--apple-blue-light)' : 'var(--apple-gray-6)',
                ringColor: isSelected ? 'var(--apple-blue)' : 'transparent'
              }}
            >
              <div className="grid grid-cols-[auto_1fr_auto] gap-3 p-4 items-start">
                {/* Radio Button */}
                <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                  {isSelected && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
                </div>

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-base" style={{ color: 'var(--apple-label)' }}>
                      {rate.label}
                    </span>
                    {feeDiff && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        feeDiff.startsWith('+') ? 'text-orange-600 bg-orange-100' : 'text-green-600 bg-green-100'
                      }`}>
                        {feeDiff}
                      </span>
                    )}
                  </div>
                  <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                    {rate.description}
                  </p>
                </div>

                {/* Rates */}
                <div className="flex flex-col items-end gap-1">
                  <p className="text-base font-semibold whitespace-nowrap" style={{ color: 'var(--apple-label)' }}>
                    {rate.satPerByte} sat/vB
                  </p>
                  <p className="text-sm whitespace-nowrap" style={{ color: 'var(--apple-secondary-label)' }}>
                    ~{rate.confirmationTime}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Fee Input */}
      <div className="mb-4">
        <button
          onClick={() => handlePriorityChange('custom')}
          className={`w-full rounded-xl text-left transition-all ${
            selectedPriority === 'custom' ? 'ring-2' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
          }`}
          style={{
            backgroundColor: selectedPriority === 'custom' ? 'var(--apple-blue-light)' : 'var(--apple-gray-6)',
            ringColor: selectedPriority === 'custom' ? 'var(--apple-blue)' : 'transparent'
          }}
        >
          <div className="grid grid-cols-[auto_1fr_auto] gap-3 p-4 items-start">
            {/* Radio Button */}
            <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5 ${selectedPriority === 'custom' ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
              {selectedPriority === 'custom' && <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5"></div>}
            </div>

            {/* Content */}
            <div className="flex flex-col gap-1">
              <span className="font-medium text-base" style={{ color: 'var(--apple-label)' }}>
                Custom Fee Rate
              </span>
              <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                Set your own fee rate for custom timing
              </p>
            </div>

            {/* Rates */}
            <div className="flex flex-col items-end gap-1">
              <p className="text-base font-semibold whitespace-nowrap" style={{ color: 'var(--apple-label)' }}>
                {customFeeRate} sat/vB
              </p>
              <p className="text-sm whitespace-nowrap" style={{ color: 'var(--apple-secondary-label)' }}>
                ~{estimateConfirmationTime(customFeeRate)}
              </p>
            </div>
          </div>
        </button>

        {selectedPriority === 'custom' && (
          <div className="mt-3 p-3 rounded-lg" style={{ backgroundColor: 'var(--apple-gray-6)' }}>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
              Fee Rate (sat/vB)
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                value={customFeeRate}
                onChange={(e) => setCustomFeeRate(Math.max(1, parseInt(e.target.value) || 1))}
                min="1"
                max="1000"
                className="flex-1 p-3 rounded-xl border-0 text-center font-mono"
                style={{
                  backgroundColor: 'var(--apple-system-background)',
                  color: 'var(--apple-label)'
                }}
              />
              <div className="flex space-x-1">
                <button
                  onClick={() => setCustomFeeRate(Math.max(1, customFeeRate - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--apple-system-background)' }}
                >
                  <MinusIcon className="w-4 h-4" style={{ color: 'var(--apple-label)' }} />
                </button>
                <button
                  onClick={() => setCustomFeeRate(Math.min(1000, customFeeRate + 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: 'var(--apple-system-background)' }}
                >
                  <PlusIcon className="w-4 h-4" style={{ color: 'var(--apple-label)' }} />
                </button>
              </div>
            </div>

            {customFeeRate < networkFeeRates.low && (
              <p className="text-sm mt-2 text-orange-600">
                ⚠️ Very low fee rate - transaction may take hours or fail to confirm
              </p>
            )}
            {customFeeRate > networkFeeRates.high * 3 && (
              <p className="text-sm mt-2 text-orange-600">
                ⚠️ Very high fee rate - you may be overpaying significantly
              </p>
            )}
          </div>
        )}
      </div>

      {/* Transaction Details */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--apple-gray-6)' }}>
        <h4 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
          Transaction Details
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2">
            <span className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>Virtual Size</span>
            <span className="text-base font-medium" style={{ color: 'var(--apple-label)' }}>{feeEstimate.txSize} vBytes</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>Fee Rate</span>
            <span className="text-base font-medium" style={{ color: 'var(--apple-label)' }}>{feeEstimate.effectiveFeeRate} sat/vB</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>Inputs</span>
            <span className="text-base font-medium" style={{ color: 'var(--apple-label)' }}>{feeEstimate.inputCount}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>Outputs</span>
            <span className="text-base font-medium" style={{ color: 'var(--apple-label)' }}>{feeEstimate.outputCount}</span>
          </div>
        </div>

        {feeEstimate.totalFee > 0 && (
          <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--apple-separator)' }}>
            <div className="flex justify-between items-center">
              <span className="font-medium" style={{ color: 'var(--apple-label)' }}>Total Fee</span>
              <div className="text-right">
                <p className="font-medium" style={{ color: 'var(--apple-label)' }}>
                  {formatBTC(feeEstimate.totalFee)}
                </p>
                {feeEstimate.totalFeeUSD > 0 && (
                  <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                    {formatUSD(feeEstimate.totalFeeUSD)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fee Rate Refresh */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs" style={{ color: 'var(--apple-secondary-label)' }}>
          Fee rates update automatically every 30s
        </p>
        <Button
          variant="tertiary"
          size="small"
          onClick={() => window.location.reload()}
          disabled={isLoadingRates}
        >
          {isLoadingRates ? 'Updating...' : 'Refresh Rates'}
        </Button>
      </div>
    </Card>
  );
};

// Icon Components
const MinusIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
  </svg>
);

const PlusIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);