import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { FeeRate } from '@/background/service/feeService';
import { useI18n } from '@/ui/hooks/useI18n';

interface DynamicFeeSelectorProps {
  selectedFeeRate: number;
  onFeeRateChange: (feeRate: number) => void;
  onFeeLevelChange: (level: 'slow' | 'medium' | 'fast' | 'priority') => void;
  loading?: boolean;
  className?: string;
}

export const DynamicFeeSelector: React.FC<DynamicFeeSelectorProps> = ({
  selectedFeeRate,
  onFeeRateChange,
  onFeeLevelChange,
  loading = false,
  className = ''
}) => {
  const { t } = useI18n();
  const [feeRates, setFeeRates] = useState<FeeRate[]>([]);
  const [selectedLevel, setSelectedLevel] = useState<'slow' | 'medium' | 'fast' | 'priority'>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Simuler le chargement des fees (à remplacer par l'appel au service)
  useEffect(() => {
    const loadFees = async () => {
      setIsLoading(true);
      try {
        // Simuler un appel API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Fees simulés (à remplacer par l'appel au FeeService)
        const mockFees: FeeRate[] = [
          {
            feeRate: 2,
            label: 'Slow',
            timeEstimate: '1-2 hours',
            color: '#10B981'
          },
          {
            feeRate: 8,
            label: 'Medium',
            timeEstimate: '30-60 min',
            color: '#F59E0B'
          },
          {
            feeRate: 15,
            label: 'Fast',
            timeEstimate: '10-30 min',
            color: '#EF4444'
          },
          {
            feeRate: 25,
            label: 'Priority',
            timeEstimate: 'Next block',
            color: '#8B5CF6'
          }
        ];

        setFeeRates(mockFees);
        setLastUpdate(new Date());

        // Sélectionner le niveau medium par défaut
        onFeeRateChange(mockFees[1].feeRate);
        onFeeLevelChange('medium');
      } catch (error) {
        console.error('Error loading fees:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFees();
  }, [onFeeRateChange, onFeeLevelChange]);

  const handleLevelSelect = (level: 'slow' | 'medium' | 'fast' | 'priority', feeRate: number) => {
    setSelectedLevel(level);
    onFeeRateChange(feeRate);
    onFeeLevelChange(level);
  };

  const refreshFees = async () => {
    setIsLoading(true);
    try {
      // Simuler le refresh
      await new Promise((resolve) => setTimeout(resolve, 500));
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error refreshing fees:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && feeRates.length === 0) {
    return (
      <div className={`fee-selector-loading ${className}`}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
          <div
            style={{
              width: '20px',
              height: '20px',
              border: '2px solid rgba(255, 255, 255, 0.3)',
              borderTop: '2px solid #F7931A',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              marginRight: '10px'
            }}
          />
          Loading network fees...
        </div>
      </div>
    );
  }

  return (
    <div className={`dynamic-fee-selector ${className}`}>
      {/* Header avec refresh */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '12px'
        }}>
        <h3
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0
          }}>
          Network Fee
        </h3>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {lastUpdate && (
            <span
              style={{
                fontSize: '10px',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}

          <button
            onClick={refreshFees}
            disabled={isLoading}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255, 255, 255, 0.6)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#F7931A';
              e.currentTarget.style.backgroundColor = 'rgba(247, 147, 26, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255, 255, 255, 0.6)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              style={{
                transform: isLoading ? 'rotate(360deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}>
              <path
                d="M4 12a8 8 0 018-8V2.5L16 6l-4 3.5V8a6 6 0 00-6 6h-2zm16 0a8 8 0 01-8 8v1.5L8 18l4-3.5V16a6 6 0 006-6h2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Options de fees */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '8px'
        }}>
        {feeRates.map((fee, index) => {
          const level = ['slow', 'medium', 'fast', 'priority'][index] as 'slow' | 'medium' | 'fast' | 'priority';
          const isSelected = selectedLevel === level;

          return (
            <motion.button
              key={level}
              onClick={() => handleLevelSelect(level, fee.feeRate)}
              disabled={loading}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${fee.color}20, ${fee.color}10)`
                  : 'rgba(255, 255, 255, 0.05)',
                border: `1px solid ${isSelected ? fee.color : 'rgba(255, 255, 255, 0.1)'}`,
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}>
              {/* Indicateur de sélection */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: fee.color
                  }}
                />
              )}

              <div style={{ textAlign: 'left' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    marginBottom: '4px'
                  }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: fee.color
                    }}
                  />
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: isSelected ? fee.color : '#ffffff'
                    }}>
                    {fee.label}
                  </span>
                </div>

                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: '700',
                    color: '#ffffff',
                    marginBottom: '2px'
                  }}>
                  {fee.feeRate} sat/vB
                </div>

                <div
                  style={{
                    fontSize: '10px',
                    color: 'rgba(255, 255, 255, 0.6)'
                  }}>
                  {fee.timeEstimate}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Informations supplémentaires */}
      <div
        style={{
          marginTop: '12px',
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.03)',
          borderRadius: '6px',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
        <div
          style={{
            fontSize: '11px',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center'
          }}>
          Fees are updated in real-time from the Bitcoin network
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .dynamic-fee-selector {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 16px;
        }
        
        .fee-selector-loading {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
        }
      `}</style>
    </div>
  );
};
