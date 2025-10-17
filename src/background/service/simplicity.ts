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

// Blacknode API response interface
export interface BlacknodeTickerInfo {
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

// Blacknode market stats interface
export interface BlacknodeTickerStats {
  code: number;
  msg: string;
  data: {
    total_listings: string;
    active_listings: string;
    total_trades_for_ticker: string;
    total_volume_token_amount_for_ticker: string;
    total_volume_satoshis_for_ticker: string;
    avg_price_per_token_traded_for_ticker: string;
    min_price_per_token_traded_for_ticker: string;
    max_price_per_token_traded_for_ticker: string;
    current_floor_price_satoshis_active_listings: string;
  };
}

// Blacknode address history interface
export interface BlacknodeAddressHistoryItem {
  id: number;
  tx_id: string;
  txid: string;
  op: 'deploy' | 'mint' | 'transfer';
  ticker: string;
  amount: string;
  block_height: number;
  block_hash: string;
  tx_index: number;
  timestamp: string;
  from_address: string;
  to_address: string;
  valid: boolean;
}

// Blacknode trading data interface
export interface BlacknodeTradingData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  tradeCount: number;
}

// Blacknode trading response interface
export interface BlacknodeTradingResponse {
  code: number;
  message: string;
  data: {
    originalTradeCount: number;
    validTradeCount: number;
    filteredTradeCount: number;
    filteredOutCount: number;
    filterPercentage: string;
    chartData: BlacknodeTradingData[];
  };
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

  // Get token price from BlackNode API
  getSimplicityTokenPrice = async (ticker: string): Promise<{ curPrice: number; changePercent: number }> => {
    try {
      const url = `https://www.blacknode.co/api/market/v1/brc20/ticker/${ticker}`;
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

      const data = await response.json();

      if (data.code !== 0) {
        throw new Error(`API error: ${data.msg}`);
      }

      // Extract floor price in satoshis
      const floorPriceSatoshis = parseFloat(data.data.current_floor_price_satoshis_active_listings);

      // Convert satoshis to BTC (1 BTC = 100,000,000 satoshis)
      const priceInBTC = floorPriceSatoshis / 100000000;

      // For now, we'll return the price in satoshis as curPrice
      // The conversion to USD will be handled by the price provider
      return {
        curPrice: floorPriceSatoshis, // Price in satoshis per token
        changePercent: 0 // BlackNode API doesn't provide change percentage
      };
    } catch (error) {
      console.error('Error fetching Simplicity token price:', error);
      throw error;
    }
  };

  // Get multiple token prices
  getSimplicityTokensPrice = async (
    tickers: string[]
  ): Promise<{ [key: string]: { curPrice: number; changePercent: number } }> => {
    const priceMap: { [key: string]: { curPrice: number; changePercent: number } } = {};

    // Fetch prices for all tickers in parallel
    const pricePromises = tickers.map(async (ticker) => {
      try {
        const price = await this.getSimplicityTokenPrice(ticker);
        return { ticker, price };
      } catch (error) {
        console.error(`Error fetching price for ${ticker}:`, error);
        return { ticker, price: { curPrice: 0, changePercent: 0 } };
      }
    });

    const results = await Promise.all(pricePromises);

    results.forEach(({ ticker, price }) => {
      priceMap[ticker] = price;
    });

    return priceMap;
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

  // Create transfer PSBT using the new BIP32-compatible API
  createTransferPSBT = async (request: {
    sender: string;
    receiver: string;
    amount: number;
    feeRate: number;
    utxos: Array<{
      txid: string;
      vout: number;
      amount: number;
      scriptPubKey: string;
      derivationPath: string;
      publicKey: string;
      masterFingerprint: string;
    }>;
    ticker: string;
    changeDerivationPath: string;
    changePublicKey: string;
  }): Promise<{
    psbtBase64: string;
    estimatedFee: number;
    changeAmount: number;
    txBytes: number;
    txVBytes: number;
    fee: number;
  }> => {
    try {
      const url = 'https://tx.sspace.fr/api/v1/psbt/transfer';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-client': 'UniSat Wallet',
          'x-version': VERSION,
          'x-channel': CHANNEL
        },
        body: JSON.stringify(request)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating Simplicity transfer PSBT:', error);
      throw error;
    }
  };

  // Get ticker information from Blacknode API
  getBlacknodeTickerInfo = async (ticker: string): Promise<BlacknodeTickerInfo> => {
    try {
      const url = `https://www.blacknode.co/api/brc20/tickers/${ticker}`;
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
      console.error('Error fetching ticker info from Blacknode:', error);
      throw error;
    }
  };

  // Get ticker market stats from Blacknode API
  getTickerStats = async (ticker: string): Promise<BlacknodeTickerStats> => {
    try {
      const url = `https://www.blacknode.co/api/market/v1/brc20/tickers/${ticker}/stats`;
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
      console.error('Error fetching ticker stats from Blacknode:', error);
      throw error;
    }
  };

  // Get address history from Blacknode API
  getBlacknodeAddressHistory = async (address: string, limit = 100): Promise<BlacknodeAddressHistoryItem[]> => {
    try {
      const url = `https://www.blacknode.co/api/brc20/addresses/${address}/history?limit=${limit}`;
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
      console.error('Error fetching address history from Blacknode:', error);
      throw error;
    }
  };

  // Get trading data from Blacknode API
  getBlacknodeTradingData = async (ticker: string): Promise<BlacknodeTradingData[]> => {
    try {
      const url = `https://www.blacknode.co/api/market/v1/brc20/tickers/${ticker}/filtered-trades`;
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

      const responseData: BlacknodeTradingResponse = await response.json();

      // Extract chartData from the response
      if (responseData && responseData.data && Array.isArray(responseData.data.chartData)) {
        return responseData.data.chartData;
      }

      return [];
    } catch (error) {
      console.error('Error fetching trading data from Blacknode:', error);
      return []; // Return empty array instead of throwing
    }
  };
}

// Create and export singleton instance
const simplicityService = new SimplicityService();

export { simplicityService };
export default simplicityService;
