import { createPersistStore } from '@/background/utils';
import { CHANNEL, VERSION } from '@/shared/constant';

// Types basés sur la documentation officielle
export interface SimplicityAddressBalance {
  pkscript: string;
  ticker: string;
  wallet: string;
  overall_balance: string;
  available_balance: string;
  block_height: number;
}

export interface SimplicityBrc20Info {
  ticker: string;
  decimals: number;
  max_supply: string;
  limit_per_mint: string;
  actual_deploy_txid_for_api: string;
  deploy_tx_id: string;
  deploy_block_height: number;
  deploy_timestamp: string;
  creator_address: string;
  remaining_supply: string;
  current_supply: string;
  holders: number;
}

export interface SimplicityOp {
  id: number;
  tx_id: string;
  txid: string | null;
  op: 'deploy' | 'mint' | 'transfer';
  ticker: string;
  amount_str: string | null;
  block_height: number;
  block_hash: string;
  tx_index: number;
  timestamp: string;
  from_address: string | null;
  to_address: string | null;
  valid: boolean;
}

export interface SimplicityServiceStore {
  baseUrl: string;
}

// New response format for address tickers
export interface SimplicityAddressTickersResponse {
  address: string;
  tickers: Array<{
    ticker: string;
    balance: string;
  }>;
  total_tickers: number;
}

export class SimplicityService {
  store!: SimplicityServiceStore;
  private baseUrl = 'https://simplicity.sspace.fr';

  constructor() {
    // Initialize with default Simplicity API URL
  }

  init = async () => {
    this.store = await createPersistStore({
      name: 'simplicity',
      template: {
        baseUrl: this.baseUrl
      }
    });

    // Use stored baseUrl if available
    if (this.store.baseUrl) {
      this.baseUrl = this.store.baseUrl;
    }
  };

  setBaseUrl = (url: string) => {
    this.baseUrl = url;
    this.store.baseUrl = url;
  };

  getBaseUrl = () => {
    return this.baseUrl;
  };

  // Health check
  getHealth = async (): Promise<{ status: string }> => {
    try {
      const url = `${this.baseUrl}/v1/indexer/brc20/health`;
      const response = await fetch(url, {
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

      return await response.json();
    } catch (error) {
      console.error('Error checking Simplicity health:', error);
      throw error;
    }
  };

  // Get indexer status
  getStatus = async () => {
    try {
      const url = `${this.baseUrl}/v1/indexer/brc20/status`;
      const response = await fetch(url, {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching Simplicity status:', error);
      throw error;
    }
  };

  // Get BRC-20 list
  getBrc20List = async (): Promise<SimplicityBrc20Info[]> => {
    try {
      const url = `${this.baseUrl}/v1/indexer/brc20/list`;
      const response = await fetch(url, {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching BRC-20 list:', error);
      throw error;
    }
  };

  // Get ticker info
  getTickerInfo = async (ticker: string): Promise<SimplicityBrc20Info> => {
    try {
      const url = `${this.baseUrl}/v1/indexer/brc20/${ticker}/info`;
      const response = await fetch(url, {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching ticker info:', error);
      throw error;
    }
  };

  // Get address balance for a specific ticker
  getAddressTickerBalance = async (address: string, ticker: string): Promise<SimplicityAddressBalance> => {
    try {
      const url = `${this.baseUrl}/v1/indexer/address/${address}/brc20/${ticker}/info`;
      const response = await fetch(url, {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching address ticker balance:', error);
      throw error;
    }
  };

  // Get address history
  getAddressHistory = async (address: string): Promise<SimplicityOp[]> => {
    try {
      const url = `${this.baseUrl}/v1/indexer/address/${address}/history`;
      const response = await fetch(url, {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching address history:', error);
      throw error;
    }
  };

  // Get address ticker history
  getAddressTickerHistory = async (address: string, ticker: string): Promise<SimplicityOp[]> => {
    try {
      const url = `${this.baseUrl}/v1/indexer/address/${address}/brc20/${ticker}/history`;
      const response = await fetch(url, {
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

      return await response.json();
    } catch (error) {
      console.error('Error fetching address ticker history:', error);
      throw error;
    }
  };

  // Get all tokens for an address using BlackNode API
  getAllTokensForAddress = async (address: string): Promise<SimplicityAddressBalance[]> => {
    try {
      const url = `https://www.blacknode.co/api/brc20/addresses/${address}/tickers-balance`;
      const response = await fetch(url, {
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

      const data: SimplicityAddressTickersResponse = await response.json();

      // Handle the BlackNode API response format
      // Expected format: { "address": "...", "tickers": [...], "total_tickers": 1 }
      const tickers = data.tickers || [];

      // Transform the response to match SimplicityAddressBalance format
      const tokenBalances: SimplicityAddressBalance[] = tickers.map((token) => ({
        pkscript: '', // Not provided by this endpoint
        ticker: token.ticker,
        wallet: address,
        overall_balance: token.balance,
        available_balance: token.balance, // Assume same as overall for now
        block_height: 0 // Not provided in new format
      }));

      return tokenBalances;
    } catch (error) {
      console.error('Error fetching all tokens for address:', error);
      throw error;
    }
  };

  // Check if service is available
  isServiceAvailable = async (): Promise<boolean> => {
    try {
      await this.getHealth();
      return true;
    } catch (error) {
      return false;
    }
  };
}

// Create and export singleton instance
const simplicityService = new SimplicityService();

export { simplicityService };
export default simplicityService;
