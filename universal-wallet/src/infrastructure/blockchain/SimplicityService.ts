import { inject, injectable } from 'inversify';
import axios, { AxiosInstance } from 'axios';
import type { Result } from '../../shared/types/Result';
import { ResultUtils } from '../../shared/types/Result';
import { NetworkError } from '../../shared/errors/DomainError';

export interface BRC20Token {
  tick: string;
  name: string;
  totalSupply: string;
  decimals: number;
  deployTime: string;
  deployHeight: number;
  deployer: string;
  mintable: boolean;
}

export interface BRC20Balance {
  tick: string;
  available: string;
  transferable: string;
  total: string;
}

export interface BRC20Transfer {
  txHash: string;
  from: string;
  to: string;
  tick: string;
  amount: string;
  blockHeight: number;
  timestamp: string;
}

export interface SimplicityHealth {
  status: string;
  indexedHeight: number;
  totalTransactions: number;
  uptime: number;
}

@injectable()
export class SimplicityService {
  private client: AxiosInstance;
  private baseUrl: string;

  constructor() {
    // Simplicity API base URL (will be updated when service is running)
    this.baseUrl = 'http://localhost:8080';

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add response interceptors for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Simplicity API Error:', error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Check the health status of the Simplicity indexer
   */
  async getHealth(): Promise<Result<SimplicityHealth>> {
    try {
      const response = await this.client.get('/v1/indexer/brc20/health');

      return ResultUtils.success({
        status: response.data.status,
        indexedHeight: response.data.indexed_height || 0,
        totalTransactions: response.data.total_transactions || 0,
        uptime: response.data.uptime || 0
      });
    } catch (error) {
      return ResultUtils.failure(new NetworkError('Failed to check Simplicity health', { error }));
    }
  }

  /**
   * Get list of all BRC-20 tokens
   */
  async getBRC20Tokens(limit: number = 50, offset: number = 0): Promise<Result<BRC20Token[]>> {
    try {
      const response = await this.client.get('/v1/indexer/brc20/list', {
        params: { limit, offset }
      });

      // API returns an array directly, handle both formats
      const tokensData = Array.isArray(response.data) ? response.data : response.data.tokens || [];
      const tokens = tokensData.map((token: any) => ({
        tick: token.tick,
        name: token.name || token.tick,
        totalSupply: token.max_supply,
        decimals: token.decimals || 0,
        deployTime: token.deploy_time,
        deployHeight: token.deploy_block,
        deployer: token.deployer,
        mintable: token.mintable
      }));

      return ResultUtils.success(tokens);
    } catch (error) {
      return ResultUtils.failure(new NetworkError('Failed to fetch BRC-20 tokens', { error }));
    }
  }

  /**
   * Get details for a specific BRC-20 token
   */
  async getBRC20Token(tick: string): Promise<Result<BRC20Token>> {
    try {
      const response = await this.client.get(`/v1/indexer/brc20/${tick}`);

      const token = {
        tick: response.data.tick,
        name: response.data.name || response.data.tick,
        totalSupply: response.data.max_supply,
        decimals: response.data.decimals || 0,
        deployTime: response.data.deploy_time,
        deployHeight: response.data.deploy_block,
        deployer: response.data.deployer,
        mintable: response.data.mintable
      };

      return ResultUtils.success(token);
    } catch (error) {
      return ResultUtils.failure(new NetworkError(`Failed to fetch BRC-20 token ${tick}`, { error }));
    }
  }

  /**
   * Get BRC-20 token balances for an address
   */
  async getBRC20Balances(address: string): Promise<Result<BRC20Balance[]>> {
    try {
      const response = await this.client.get(`/v1/indexer/brc20/balances/${address}`);

      // Handle both array and object response formats
      const balancesData = Array.isArray(response.data) ? response.data : response.data.balances || [];
      const balances = balancesData.map((balance: any) => ({
        tick: balance.tick,
        available: balance.available,
        transferable: balance.transferable,
        total: balance.total
      }));

      return ResultUtils.success(balances);
    } catch (error) {
      return ResultUtils.failure(new NetworkError(`Failed to fetch BRC-20 balances for ${address}`, { error }));
    }
  }

  /**
   * Get BRC-20 transfer history for an address
   */
  async getBRC20Transfers(address: string, limit: number = 20, offset: number = 0): Promise<Result<BRC20Transfer[]>> {
    try {
      const response = await this.client.get(`/v1/indexer/brc20/transfers/${address}`, {
        params: { limit, offset }
      });

      const transfers = response.data.transfers.map((transfer: any) => ({
        txHash: transfer.tx_hash,
        from: transfer.from_address,
        to: transfer.to_address,
        tick: transfer.tick,
        amount: transfer.amount,
        blockHeight: transfer.block_height,
        timestamp: transfer.timestamp
      }));

      return ResultUtils.success(transfers);
    } catch (error) {
      return ResultUtils.failure(new NetworkError(`Failed to fetch BRC-20 transfers for ${address}`, { error }));
    }
  }

  /**
   * Search BRC-20 tokens by name or tick
   */
  async searchBRC20Tokens(query: string): Promise<Result<BRC20Token[]>> {
    try {
      const response = await this.client.get('/v1/indexer/brc20/search', {
        params: { q: query }
      });

      // API returns an array directly, handle both formats
      const tokensData = Array.isArray(response.data) ? response.data : response.data.tokens || [];
      const tokens = tokensData.map((token: any) => ({
        tick: token.tick,
        name: token.name || token.tick,
        totalSupply: token.max_supply,
        decimals: token.decimals || 0,
        deployTime: token.deploy_time,
        deployHeight: token.deploy_block,
        deployer: token.deployer,
        mintable: token.mintable
      }));

      return ResultUtils.success(tokens);
    } catch (error) {
      return ResultUtils.failure(new NetworkError(`Failed to search BRC-20 tokens for "${query}"`, { error }));
    }
  }

  /**
   * Update the base URL for the Simplicity service
   */
  updateBaseUrl(newBaseUrl: string): void {
    this.baseUrl = newBaseUrl;
    this.client.defaults.baseURL = newBaseUrl;
  }

  /**
   * Check if the Simplicity service is available
   */
  async isServiceAvailable(): Promise<boolean> {
    try {
      const healthResult = await this.getHealth();
      return healthResult.success;
    } catch {
      return false;
    }
  }
}