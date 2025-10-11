import { useEffect, useState } from 'react';

export interface SimplicityToken {
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

export const useSimplicityTokens = () => {
  const [tokens, setTokens] = useState<SimplicityToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('https://www.blacknode.co/api/brc20/tickers');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SimplicityToken[] = await response.json();
        setTokens(data);
      } catch (err) {
        console.error('Failed to fetch Simplicity tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch tokens');
      } finally {
        setLoading(false);
      }
    };

    fetchTokens();
  }, []);

  return { tokens, loading, error };
};
