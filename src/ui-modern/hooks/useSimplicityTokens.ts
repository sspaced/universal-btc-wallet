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
  // Volume data
  total_volume_satoshis?: string;
  total_volume_token_amount?: string;
  total_trades?: string;
  current_floor_price_satoshis?: string;
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

        // Fetch basic token list
        const response = await fetch('https://www.blacknode.co/api/brc20/tickers');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: SimplicityToken[] = await response.json();

        // Fetch volume data for each token and sort by volume
        const tokensWithVolume = await Promise.all(
          data.map(async (token) => {
            try {
              // Fetch volume stats for this token
              const volumeResponse = await fetch(`https://www.blacknode.co/api/market/v1/brc20/ticker/${token.ticker}`);

              if (volumeResponse.ok) {
                const volumeData = await volumeResponse.json();
                if (volumeData.code === 0 && volumeData.data) {
                  return {
                    ...token,
                    total_volume_satoshis: volumeData.data.total_volume_satoshis_for_ticker,
                    total_volume_token_amount: volumeData.data.total_volume_token_amount_for_ticker,
                    total_trades: volumeData.data.total_trades_for_ticker,
                    current_floor_price_satoshis: volumeData.data.current_floor_price_satoshis_active_listings
                  };
                }
              }

              // Return token without volume data if API call fails
              return {
                ...token,
                total_volume_satoshis: '0',
                total_volume_token_amount: '0',
                total_trades: '0',
                current_floor_price_satoshis: '0'
              };
            } catch (error) {
              console.error(`Failed to fetch volume for ${token.ticker}:`, error);
              return {
                ...token,
                total_volume_satoshis: '0',
                total_volume_token_amount: '0',
                total_trades: '0',
                current_floor_price_satoshis: '0'
              };
            }
          })
        );

        // Sort tokens by volume (total_volume_satoshis) in descending order
        const sortedTokens = tokensWithVolume.sort((a, b) => {
          const volumeA = parseFloat(a.total_volume_satoshis || '0');
          const volumeB = parseFloat(b.total_volume_satoshis || '0');
          return volumeB - volumeA;
        });

        setTokens(sortedTokens);
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
