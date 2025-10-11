import { useCallback, useEffect, useState } from 'react';

import { FeeRate } from '@/background/service/feeService';

export interface UseDynamicFeesReturn {
  feeRates: FeeRate[];
  selectedFeeRate: number;
  selectedLevel: 'slow' | 'medium' | 'fast' | 'priority';
  isLoading: boolean;
  lastUpdate: Date | null;
  error: string | null;
  setSelectedFeeRate: (feeRate: number) => void;
  setSelectedLevel: (level: 'slow' | 'medium' | 'fast' | 'priority') => void;
  refreshFees: () => Promise<void>;
  getFeeRateForLevel: (level: 'slow' | 'medium' | 'fast' | 'priority') => number;
}

export const useDynamicFees = (): UseDynamicFeesReturn => {
  const [feeRates, setFeeRates] = useState<FeeRate[]>([]);
  const [selectedFeeRate, setSelectedFeeRate] = useState<number>(8); // Default medium
  const [selectedLevel, setSelectedLevel] = useState<'slow' | 'medium' | 'fast' | 'priority'>('medium');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Simuler l'appel au service (à remplacer par l'appel réel au FeeService)
  const fetchFees = useCallback(async (): Promise<FeeRate[]> => {
    try {
      console.log('Fetching dynamic fees...');

      // Simuler un appel à l'API Mempool.space
      const response = await fetch('https://mempool.space/api/v1/fees/recommended', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Mempool fees response:', data);

      // Convertir en format FeeRate
      const fees: FeeRate[] = [
        {
          feeRate: data.economyFee || 1,
          label: 'Slow',
          timeEstimate: '1-2 hours',
          color: '#10B981'
        },
        {
          feeRate: data.hourFee || 5,
          label: 'Medium',
          timeEstimate: '30-60 min',
          color: '#F59E0B'
        },
        {
          feeRate: data.halfHourFee || 10,
          label: 'Fast',
          timeEstimate: '10-30 min',
          color: '#EF4444'
        },
        {
          feeRate: data.fastestFee || 20,
          label: 'Priority',
          timeEstimate: 'Next block',
          color: '#8B5CF6'
        }
      ];

      return fees;
    } catch (error) {
      console.error('Error fetching fees from Mempool.space:', error);

      // Retourner des fees par défaut en cas d'erreur
      return [
        {
          feeRate: 1,
          label: 'Slow',
          timeEstimate: '1-2 hours',
          color: '#10B981'
        },
        {
          feeRate: 5,
          label: 'Medium',
          timeEstimate: '30-60 min',
          color: '#F59E0B'
        },
        {
          feeRate: 10,
          label: 'Fast',
          timeEstimate: '10-30 min',
          color: '#EF4444'
        },
        {
          feeRate: 20,
          label: 'Priority',
          timeEstimate: 'Next block',
          color: '#8B5CF6'
        }
      ];
    }
  }, []);

  // Charger les fees au montage
  useEffect(() => {
    const loadFees = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const fees = await fetchFees();
        setFeeRates(fees);
        setLastUpdate(new Date());

        // Sélectionner le niveau medium par défaut
        const mediumFee = fees.find((f) => f.label === 'Medium') || fees[1];
        if (mediumFee) {
          setSelectedFeeRate(mediumFee.feeRate);
          setSelectedLevel('medium');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load fees');
        console.error('Error loading fees:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadFees();
  }, [fetchFees]);

  // Auto-refresh des fees toutes les 5 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const fees = await fetchFees();
        setFeeRates(fees);
        setLastUpdate(new Date());
        setError(null);
      } catch (err) {
        console.error('Error auto-refreshing fees:', err);
      }
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchFees]);

  const refreshFees = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fees = await fetchFees();
      setFeeRates(fees);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh fees');
      console.error('Error refreshing fees:', err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFees]);

  const getFeeRateForLevel = useCallback(
    (level: 'slow' | 'medium' | 'fast' | 'priority'): number => {
      const levelMap = {
        slow: 0,
        medium: 1,
        fast: 2,
        priority: 3
      };

      const fee = feeRates[levelMap[level]];
      return fee?.feeRate || 5; // Fallback
    },
    [feeRates]
  );

  const handleSetSelectedFeeRate = useCallback(
    (feeRate: number) => {
      setSelectedFeeRate(feeRate);

      // Trouver le niveau correspondant
      const fee = feeRates.find((f) => f.feeRate === feeRate);
      if (fee) {
        const levelMap = {
          Slow: 'slow' as const,
          Medium: 'medium' as const,
          Fast: 'fast' as const,
          Priority: 'priority' as const
        };
        setSelectedLevel(levelMap[fee.label] || 'medium');
      }
    },
    [feeRates]
  );

  const handleSetSelectedLevel = useCallback(
    (level: 'slow' | 'medium' | 'fast' | 'priority') => {
      setSelectedLevel(level);

      const feeRate = getFeeRateForLevel(level);
      setSelectedFeeRate(feeRate);
    },
    [getFeeRateForLevel]
  );

  return {
    feeRates,
    selectedFeeRate,
    selectedLevel,
    isLoading,
    lastUpdate,
    error,
    setSelectedFeeRate: handleSetSelectedFeeRate,
    setSelectedLevel: handleSetSelectedLevel,
    refreshFees,
    getFeeRateForLevel
  };
};
