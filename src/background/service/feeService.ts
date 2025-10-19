import { createPersistStore } from '@/background/utils';
import { CHANNEL, VERSION } from '@/shared/constant';

export interface FeeRate {
  feeRate: number;
  label: string;
  timeEstimate: string;
  color: string;
}

export interface MempoolFeeResponse {
  fastestFee: number;
  halfHourFee: number;
  hourFee: number;
  economyFee: number;
  minimumFee: number;
}

export interface FeeServiceStore {
  lastFetchTime: number;
  cachedFees: FeeRate[];
}

export class FeeService {
  store!: FeeServiceStore;
  private readonly CACHE_DURATION = 60000; // 1 minute
  private readonly MEMPOOL_API_URL = 'https://mempool.space/api/v1/fees/recommended';

  init = async () => {
    this.store = await createPersistStore({
      name: 'feeService',
      template: {
        lastFetchTime: 0,
        cachedFees: []
      }
    });
  };

  /**
   * Récupère les fees recommandés depuis Mempool.space
   */
  fetchRecommendedFees = async (): Promise<FeeRate[]> => {
    try {
      console.log('Fetching recommended fees from Mempool.space...');

      const response = await fetch(this.MEMPOOL_API_URL, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'UniSat Wallet',
          'x-version': VERSION,
          'x-channel': CHANNEL
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: MempoolFeeResponse = await response.json();
      console.log('Mempool fees response:', data);

      // Convertir en format FeeRate
      const feeRates: FeeRate[] = [
        {
          feeRate: data.economyFee,
          label: 'Slow',
          timeEstimate: '1-2 hours',
          color: '#10B981' // green
        },
        {
          feeRate: data.hourFee,
          label: 'Medium',
          timeEstimate: '30-60 min',
          color: '#F59E0B' // amber
        },
        {
          feeRate: data.halfHourFee,
          label: 'Fast',
          timeEstimate: '10-30 min',
          color: '#EF4444' // red
        },
        {
          feeRate: data.fastestFee,
          label: 'Priority',
          timeEstimate: 'Next block',
          color: '#8B5CF6' // purple
        }
      ];

      // Mettre en cache
      this.store.lastFetchTime = Date.now();
      this.store.cachedFees = feeRates;

      console.log('Cached fee rates:', feeRates);
      return feeRates;
    } catch (error) {
      console.error('Error fetching recommended fees:', error);

      // Retourner les fees en cache si disponibles
      if (this.store.cachedFees.length > 0) {
        console.log('Using cached fees due to error');
        return this.store.cachedFees;
      }

      // Fallback avec des fees par défaut
      return this.getDefaultFees();
    }
  };

  /**
   * Récupère les fees (cache ou API)
   */
  getRecommendedFees = async (): Promise<FeeRate[]> => {
    const now = Date.now();
    const cacheAge = now - this.store.lastFetchTime;

    // Utiliser le cache si récent
    if (cacheAge < this.CACHE_DURATION && this.store.cachedFees.length > 0) {
      console.log('Using cached fees, age:', Math.round(cacheAge / 1000), 'seconds');
      return this.store.cachedFees;
    }

    // Récupérer de nouveaux fees
    return await this.fetchRecommendedFees();
  };

  /**
   * Fees par défaut en cas d'erreur
   */
  private getDefaultFees = (): FeeRate[] => {
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
  };

  /**
   * Force le refresh des fees
   */
  refreshFees = async (): Promise<FeeRate[]> => {
    console.log('Force refreshing fees...');
    return await this.fetchRecommendedFees();
  };

  /**
   * Obtient le feeRate pour un niveau donné
   */
  getFeeRateForLevel = async (level: 'slow' | 'medium' | 'fast' | 'priority'): Promise<number> => {
    const fees = await this.getRecommendedFees();
    const feeMap = {
      slow: fees[0],
      medium: fees[1],
      fast: fees[2],
      priority: fees[3]
    };
    return feeMap[level]?.feeRate || 5;
  };
}

// Create and export singleton instance
const feeService = new FeeService();
export default feeService;
