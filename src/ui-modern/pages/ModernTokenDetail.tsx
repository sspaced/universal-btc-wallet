import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import {
  BlacknodeAddressHistoryItem,
  BlacknodeTickerInfo,
  BlacknodeTickerStats,
  BlacknodeTradingData,
  simplicityService
} from '@/background/service/simplicity';
import { useNavigate } from '@/ui/pages/MainRoute';

import { HistoryIcon, PaperPlaneIcon, QRCodeIcon, SwapIcon } from '../components/common/CustomIcons';
import { ModernHeader } from '../components/layout/ModernHeader';

// Types
interface TokenDetailState {
  tokenId: string;
  name: string;
  symbol: string;
  balance: string;
  usdValue: string;
  icon?: string;
  contractAddress?: string;
  network?: string;
}

type TimeFrame = '1H' | '1J' | '1S' | '1M' | 'YTD' | 'TOUT';

// Token Price Chart Component
const TokenPriceChart: React.FC<{
  timeframe: TimeFrame;
  tradingData: BlacknodeTradingData[];
  loading: boolean;
}> = ({ timeframe, tradingData, loading }) => {
  if (loading) {
    return (
      <div
        style={{
          height: '160px',
          background: 'var(--modern-bg-secondary)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
        Loading chart...
      </div>
    );
  }

  if (!tradingData || !Array.isArray(tradingData) || tradingData.length === 0) {
    return (
      <div
        style={{
          height: '160px',
          background: 'var(--modern-bg-secondary)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
        No trading data available
      </div>
    );
  }

  // Convert trading data to chart format
  const data = Array.isArray(tradingData)
    ? tradingData.map((item, i) => ({
        x: i,
        y: item.close / 100000000 // Convert satoshis to BTC
      }))
    : [];
  const width = 340;
  const height = 200;
  const padding = 10;

  // Normaliser les données pour le SVG
  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const rangeY = maxY - minY || 0.01;

  const points = data
    .map((point, i) => {
      const x = padding + (i / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - ((point.y - minY) / rangeY) * (height - padding * 2);
      return `${x},${y}`;
    })
    .join(' ');

  // Créer le path pour l'area fill
  const firstPoint = data[0];
  const lastPoint = data[data.length - 1];
  const firstX = padding;
  const lastX = padding + (width - padding * 2);
  const areaPath = `M${firstX},${height - padding} L${points} L${lastX},${height - padding} Z`;

  return (
    <div style={{ width: '100%', height: '160px', position: 'relative' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: 'visible' }}>
        {/* Gradient pour l'area */}
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(114, 228, 173, 0.3)" />
            <stop offset="100%" stopColor="rgba(114, 228, 173, 0)" />
          </linearGradient>
        </defs>

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill="url(#chartGradient)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Line */}
        <motion.polyline
          points={points}
          fill="none"
          stroke="var(--modern-accent-primary)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </svg>
    </div>
  );
};

// Timeframe Selector Component
const TimeframeSelector: React.FC<{
  selected: TimeFrame;
  onChange: (timeframe: TimeFrame) => void;
}> = ({ selected, onChange }) => {
  const timeframes: TimeFrame[] = ['1H', '1J', '1S', '1M', 'YTD', 'TOUT'];

  return (
    <div
      style={{
        display: 'flex',
        gap: '6px',
        justifyContent: 'center',
        padding: '12px 20px'
      }}>
      {timeframes.map((tf) => (
        <button
          key={tf}
          onClick={() => onChange(tf)}
          style={{
            padding: '6px 12px',
            background: selected === tf ? 'rgba(114, 228, 173, 0.2)' : 'rgba(255, 255, 255, 0.05)',
            border: selected === tf ? '1px solid var(--modern-accent-primary)' : '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: selected === tf ? 'var(--modern-accent-primary)' : 'rgba(255, 255, 255, 0.6)',
            fontSize: '12px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            flex: 1,
            maxWidth: '60px'
          }}>
          {tf}
        </button>
      ))}
    </div>
  );
};

// Action Button Component
const ActionButton: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}> = ({ icon, label, onClick }) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px',
        background: 'var(--modern-bg-secondary)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        padding: '12px 8px',
        flex: 1,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        minWidth: 0,
        aspectRatio: '1' // Force square aspect ratio
      }}>
      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          background: 'rgba(114, 228, 173, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--modern-accent-primary)'
        }}>
        {icon}
      </div>
      <span
        style={{
          fontSize: '11px',
          color: 'rgba(255, 255, 255, 0.8)',
          fontWeight: '500',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%'
        }}>
        {label}
      </span>
    </motion.button>
  );
};

// Main Component
export const ModernTokenDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tokenData = location.state as TokenDetailState;

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('1J');
  const [copiedContract, setCopiedContract] = useState(false);
  const [tickerInfo, setTickerInfo] = useState<BlacknodeTickerInfo | null>(null);
  const [tickerStats, setTickerStats] = useState<BlacknodeTickerStats | null>(null);
  const [addressHistory, setAddressHistory] = useState<BlacknodeAddressHistoryItem[]>([]);
  const [tradingData, setTradingData] = useState<BlacknodeTradingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  // Fetch ticker information from Blacknode API
  useEffect(() => {
    const fetchTickerData = async () => {
      if (!tokenData?.symbol) return;

      try {
        setLoading(true);
        setStatsLoading(true);
        setHistoryLoading(true);
        setChartLoading(true);

        // Fetch ticker info, stats and trading data in parallel
        const [info, stats, trading] = await Promise.all([
          simplicityService.getBlacknodeTickerInfo(tokenData.symbol),
          simplicityService.getTickerStats(tokenData.symbol),
          simplicityService.getBlacknodeTradingData(tokenData.symbol)
        ]);

        setTickerInfo(info);
        setTickerStats(stats);
        setTradingData(trading);
      } catch (error) {
        console.error('Error fetching ticker data:', error);
      } finally {
        setLoading(false);
        setStatsLoading(false);
        setChartLoading(false);
      }
    };

    fetchTickerData();
  }, [tokenData?.symbol]);

  // Fetch address history separately (we need the current address)
  useEffect(() => {
    const fetchAddressHistory = async () => {
      // We need to get the current address from the wallet context
      // For now, we'll use a placeholder - this should be replaced with actual wallet address
      const currentAddress = 'bc1q9mm84kf402nh6t2a29ahff9hvrr6tnq55fgy42'; // Placeholder

      try {
        setHistoryLoading(true);
        const history = await simplicityService.getBlacknodeAddressHistory(currentAddress, 100);

        // Filter history to only show transactions for the current ticker
        const filteredHistory = history.filter((item) => item.ticker === tokenData?.symbol);
        setAddressHistory(filteredHistory);
      } catch (error) {
        console.error('Error fetching address history:', error);
        setAddressHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (tokenData?.symbol) {
      fetchAddressHistory();
    }
  }, [tokenData?.symbol]);

  if (!tokenData) {
    return null;
  }

  // Mock data pour la démo
  const currentPrice = tokenData.usdValue || '$1,749.74';
  const priceChange = '+$0.00058039';
  const priceChangePercent = '+0.06%';
  const balance = tokenData.balance || '1,750';
  const value = tokenData.usdValue || '$1,749.74';
  const return24h = '-$0.03';

  const handleCopyContract = async () => {
    const contractAddress = tickerInfo?.deploy_tx_id || tokenData.contractAddress;
    if (contractAddress) {
      try {
        await navigator.clipboard.writeText(contractAddress);
        setCopiedContract(true);
        setTimeout(() => setCopiedContract(false), 2000);
      } catch (err) {
        console.error('Failed to copy contract address:', err);
      }
    }
  };

  const shortenAddress = (address: string): string => {
    if (!address || address.length < 16) return address;
    return `${address.slice(0, 8)}...${address.slice(-5)}`;
  };

  const satoshisToBTC = (satoshis: string): string => {
    const btc = parseFloat(satoshis) / 100000000;
    return btc.toFixed(8);
  };

  const formatTokenAmount = (amount: string): string => {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.000001) return num.toExponential(2);
    if (num < 0.01) return num.toFixed(6);
    if (num < 1) return num.toFixed(4);
    if (num < 1000) return num.toFixed(2);
    return num.toLocaleString();
  };

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const txTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - txTime.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getTransactionType = (op: string, fromAddress: string, toAddress: string, currentAddress: string): string => {
    if (op === 'transfer') {
      if (fromAddress === currentAddress) return 'Sent';
      if (toAddress === currentAddress) return 'Received';
    }
    return op.charAt(0).toUpperCase() + op.slice(1);
  };

  const getTransactionIcon = (op: string, fromAddress: string, toAddress: string, currentAddress: string) => {
    const type = getTransactionType(op, fromAddress, toAddress, currentAddress);

    if (type === 'Received') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7" />
        </svg>
      );
    } else if (type === 'Sent') {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      );
    } else {
      return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
      );
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--modern-bg-primary)',
        display: 'flex',
        flexDirection: 'column'
      }}>
      {/* Header */}
      <ModernHeader title={tokenData.name} onBack={() => navigate('#back')} showBackButton={true} />

      {/* Scrollable Content */}
      <div
        className="hide-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          scrollbarWidth: 'none', // Firefox
          msOverflowStyle: 'none' // IE and Edge
        }}>
        {/* Price Section - Removed to match screenshot */}

        {/* Token Name and Price Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            padding: '20px',
            textAlign: 'center'
          }}>
          <div style={{ fontSize: '16px', fontWeight: '500', color: 'rgba(255, 255, 255, 0.8)', marginBottom: '8px' }}>
            {tokenData.name}
          </div>
          <div style={{ fontSize: '40px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
            {currentPrice}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px', color: '#34c759', fontWeight: '600' }}>{priceChange}</span>
            <span
              style={{
                fontSize: '14px',
                padding: '4px 8px',
                background: 'rgba(52, 199, 89, 0.15)',
                borderRadius: '6px',
                color: '#34c759',
                fontWeight: '600'
              }}>
              {priceChangePercent}
            </span>
          </div>
        </motion.div>

        {/* Chart Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ padding: '0 20px' }}>
          <TokenPriceChart timeframe={selectedTimeframe} tradingData={tradingData} loading={chartLoading} />
        </motion.div>

        {/* Timeframe Selector */}
        <TimeframeSelector selected={selectedTimeframe} onChange={setSelectedTimeframe} />

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{
            display: 'flex',
            gap: '8px',
            padding: '0 20px 16px'
          }}>
          <ActionButton
            icon={<QRCodeIcon size={16} color="var(--modern-accent-primary)" />}
            label="Receive"
            onClick={() => navigate('ReceiveScreen')}
          />
          <ActionButton
            icon={<PaperPlaneIcon size={16} color="var(--modern-accent-primary)" />}
            label="Send"
            onClick={() => navigate('TxCreateScreen')}
          />
          <ActionButton
            icon={<SwapIcon size={16} color="var(--modern-accent-primary)" />}
            label="Swap"
            onClick={() => navigate('ModernSwapScreen')}
          />
          <ActionButton
            icon={<HistoryIcon size={16} color="var(--modern-accent-primary)" />}
            label="History"
            onClick={() => navigate('HistoryScreen')}
          />
        </motion.div>

        {/* Your Position Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          style={{ padding: '0 20px 16px' }}>
          <h3
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
            Your Position
          </h3>

          <div
            style={{
              background: 'var(--modern-bg-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              {/* Balance Card */}
              <div
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  padding: '14px'
                }}>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>Balance</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', wordBreak: 'break-all' }}>
                  {formatTokenAmount(balance)}
                </div>
              </div>

              {/* Value Card */}
              <div
                style={{
                  flex: 1,
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  padding: '14px'
                }}>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>Value</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff' }}>{value}</div>
              </div>
            </div>

            {/* 24h Return */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '8px',
                padding: '12px 14px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>24h Return</span>
              <span style={{ fontSize: '15px', fontWeight: '600', color: '#ff453a' }}>{return24h}</span>
            </div>
          </div>
        </motion.div>

        {/* Performance Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.5 }}
          style={{ padding: '0 20px 16px' }}>
          <h3
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
            Performance
          </h3>

          <div
            style={{
              background: 'var(--modern-bg-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
            {/* Total Trades */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Total Trades</span>
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>
                {statsLoading
                  ? '...'
                  : tickerStats?.data?.total_trades_for_ticker
                  ? parseInt(tickerStats.data.total_trades_for_ticker).toLocaleString()
                  : 'N/A'}
              </span>
            </div>

            {/* Total Volume */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Total Volume</span>
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>
                {statsLoading
                  ? '...'
                  : tickerStats?.data?.total_volume_satoshis_for_ticker
                  ? `${satoshisToBTC(tickerStats.data.total_volume_satoshis_for_ticker)} BTC`
                  : 'N/A'}
              </span>
            </div>

            {/* Active Listings */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Active Listings</span>
              <span style={{ fontSize: '20px', fontWeight: '600', color: '#ffffff' }}>
                {statsLoading
                  ? '...'
                  : tickerStats?.data?.active_listings
                  ? parseInt(tickerStats.data.active_listings).toLocaleString()
                  : 'N/A'}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Informations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
          style={{ padding: '0 20px 16px' }}>
          <h3
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
            Information
          </h3>

          <div
            style={{
              background: 'var(--modern-bg-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
            {/* Nom */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Name</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{tokenData.name}</span>
            </div>

            {/* Symbole */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Symbol</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>{tokenData.symbol}</span>
            </div>

            {/* Réseau */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Network</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                {tokenData.network || 'Base'}
              </span>
            </div>

            {/* Contrat */}
            {(tickerInfo?.deploy_tx_id || tokenData.contractAddress) && (
              <div
                onClick={handleCopyContract}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                  cursor: 'pointer'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Contract</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '600', color: '#ffffff', fontFamily: 'monospace' }}>
                    {shortenAddress(tickerInfo?.deploy_tx_id || tokenData.contractAddress || '')}
                  </span>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke={copiedContract ? '#34c759' : 'rgba(255, 255, 255, 0.6)'}
                    strokeWidth="2">
                    {copiedContract ? (
                      <path d="M20 6L9 17l-5-5" />
                    ) : (
                      <>
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </>
                    )}
                  </svg>
                </div>
              </div>
            )}

            {/* Decimals */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Decimals</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                {loading ? '...' : tickerInfo?.decimals || 'N/A'}
              </span>
            </div>

            {/* Max Supply */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Max Supply</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                {loading ? '...' : tickerInfo?.max_supply ? parseFloat(tickerInfo.max_supply).toLocaleString() : 'N/A'}
              </span>
            </div>

            {/* Current Supply */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Current Supply</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                {loading
                  ? '...'
                  : tickerInfo?.current_supply
                  ? parseFloat(tickerInfo.current_supply).toLocaleString()
                  : 'N/A'}
              </span>
            </div>

            {/* Holders */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Holders</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                {loading ? '...' : tickerInfo?.holders ? tickerInfo.holders.toLocaleString() : 'N/A'}
              </span>
            </div>

            {/* Created */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Created</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
                {loading
                  ? '...'
                  : tickerInfo?.deploy_timestamp
                  ? new Date(tickerInfo.deploy_timestamp).toLocaleDateString()
                  : 'N/A'}
              </span>
            </div>

            {/* Deploy Transaction */}
            {tickerInfo?.deploy_tx_id && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Deploy TX</span>
                <a
                  href={`https://nullpool.space/tx/${tickerInfo.deploy_tx_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    color: 'var(--modern-accent-primary)',
                    fontFamily: 'monospace',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                  {shortenAddress(tickerInfo.deploy_tx_id)}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                    <polyline points="15,3 21,3 21,9" />
                    <line x1="10" y1="14" x2="21" y2="3" />
                  </svg>
                </a>
              </div>
            )}
          </div>
        </motion.div>

        {/* Activité Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.7 }}
          style={{ padding: '0 20px 40px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#ffffff'
              }}>
              Activity
            </h3>
          </div>

          <div
            style={{
              background: 'var(--modern-bg-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px'
            }}>
            {historyLoading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Loading transactions...
              </div>
            ) : addressHistory.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 12px',
                    color: 'rgba(255, 255, 255, 0.4)'
                  }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v6l4 2" />
                  </svg>
                </div>
                <div style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px' }}>
                  No transactions found
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.4)' }}>
                  Transactions for {tokenData.symbol} will appear here
                </div>
              </div>
            ) : (
              addressHistory.slice(0, 5).map((tx, index) => {
                const currentAddress = 'bc1q9mm84kf402nh6t2a29ahff9hvrr6tnq55fgy42'; // Placeholder
                const type = getTransactionType(tx.op, tx.from_address, tx.to_address, currentAddress);
                const isReceived = type === 'Received';
                const isSent = type === 'Sent';

                return (
                  <div
                    key={tx.id}
                    onClick={() => window.open(`https://nullpool.space/tx/${tx.tx_id}`, '_blank')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      margin: '0 -14px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: isReceived
                          ? 'rgba(52, 199, 89, 0.15)'
                          : isSent
                          ? 'rgba(255, 69, 58, 0.15)'
                          : 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isReceived ? '#34c759' : isSent ? '#ff453a' : 'rgba(255, 255, 255, 0.6)'
                      }}>
                      {getTransactionIcon(tx.op, tx.from_address, tx.to_address, currentAddress)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>
                        {type}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {isSent ? `To ${shortenAddress(tx.to_address)}` : `From ${shortenAddress(tx.from_address)}`}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div
                        style={{
                          fontSize: '13px',
                          fontWeight: '600',
                          color: isReceived ? '#34c759' : isSent ? '#ff453a' : '#ffffff',
                          marginBottom: '2px'
                        }}>
                        {isReceived ? '+' : isSent ? '-' : ''}
                        {formatTokenAmount(tx.amount)} {tx.ticker}
                      </div>
                      <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {formatTimeAgo(tx.timestamp)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
