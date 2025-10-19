import React, { useEffect, useState } from 'react';

import { TickPriceItem } from '@/shared/types';
import { useWallet } from '@/ui/utils';

interface SimplicityPriceTestProps {
  ticker: string;
}

export const SimplicityPriceTest: React.FC<SimplicityPriceTestProps> = ({ ticker }) => {
  const wallet = useWallet();
  const [price, setPrice] = useState<TickPriceItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPrice = async () => {
    setLoading(true);
    setError(null);

    try {
      const priceMap = await wallet.getSimplicitysPrice([ticker]);
      const tokenPrice = priceMap[ticker];

      if (tokenPrice) {
        setPrice(tokenPrice);
      } else {
        setError('No price data available');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch price');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (ticker) {
      fetchPrice();
    }
  }, [ticker]);

  return (
    <div style={{ padding: '16px', border: '1px solid #ccc', margin: '8px' }}>
      <h3>Simplicity Token Price Test</h3>
      <p>
        <strong>Ticker:</strong> {ticker}
      </p>

      {loading && <p>Loading price...</p>}

      {error && <p style={{ color: 'red' }}>Error: {error}</p>}

      {price && (
        <div>
          <p>
            <strong>Current Price:</strong> {price.curPrice} satoshis per token
          </p>
          <p>
            <strong>Price in BTC:</strong> {(price.curPrice / 100000000).toFixed(8)} BTC
          </p>
          <p>
            <strong>Change:</strong> {price.changePercent}%
          </p>
        </div>
      )}

      <button onClick={fetchPrice} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh Price'}
      </button>
    </div>
  );
};

export default SimplicityPriceTest;
