import { motion } from 'framer-motion';
import React from 'react';

export interface FeeOption {
  id: string;
  label: string;
  rate: number;
  description?: string;
  estimatedTime?: string;
  color?: string;
}

export interface ModernFeeSelectorProps {
  selectedRate: number;
  onRateChange: (rate: number) => void;
  options?: FeeOption[];
  disabled?: boolean;
  showEstimatedTime?: boolean;
}

const defaultOptions: FeeOption[] = [
  {
    id: 'slow',
    label: 'Slow',
    rate: 1,
    description: 'Lowest fee',
    estimatedTime: '~30 min'
  },
  {
    id: 'normal',
    label: 'Normal',
    rate: 5,
    description: 'Recommended',
    estimatedTime: '~10 min'
  },
  {
    id: 'fast',
    label: 'Fast',
    rate: 10,
    description: 'Highest priority',
    estimatedTime: '~5 min'
  }
];

export const ModernFeeSelector: React.FC<ModernFeeSelectorProps> = ({
  selectedRate,
  onRateChange,
  options = defaultOptions,
  disabled = false,
  showEstimatedTime = true
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      {/* Label */}
      <motion.label
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          display: 'block',
          fontSize: '13px',
          fontWeight: '600',
          color: '#ffffff',
          marginBottom: '12px',
          letterSpacing: '-0.08px'
        }}>
        Network Fee
      </motion.label>

      {/* Fee Options */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        {options.map((option, index) => {
          const isSelected = selectedRate === option.rate;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              onClick={() => !disabled && onRateChange(option.rate)}
              onMouseDown={(e) => e.preventDefault()}
              disabled={disabled}
              style={{
                flex: 1,
                padding: '16px 12px',
                borderRadius: '8px',
                border: '1.5px solid',
                borderColor: isSelected ? option.color || '#34c759' : 'rgba(255, 255, 255, 0.2)',
                backgroundColor: isSelected ? `${option.color || '#34c759'}20` : 'rgba(255, 255, 255, 0.06)',
                color: '#ffffff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.5 : 1,
                position: 'relative',
                overflow: 'hidden',
                outline: 'none'
              }}>
              {/* Selection indicator */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: option.color || '#34c759'
                  }}
                />
              )}

              {/* Option content */}
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.9)'
                  }}>
                  {option.label}
                </div>

                {option.description && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      marginBottom: '2px'
                    }}>
                    {option.description}
                  </div>
                )}

                {showEstimatedTime && option.estimatedTime && (
                  <div
                    style={{
                      fontSize: '10px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontWeight: '500'
                    }}>
                    {option.estimatedTime}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Fee Rate Display */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.04)',
          borderRadius: '8px',
          padding: '12px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>Fee Rate</span>
          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '600' }}>{selectedRate} sat/vB</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
          <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)' }}>Estimated Fee</span>
          <span style={{ fontSize: '12px', color: '#ffffff', fontWeight: '600' }}>
            ~{Math.round(selectedRate * 0.25 * 100) / 100} sats
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
};
