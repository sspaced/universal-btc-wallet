import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAddress } from '@/ui/state/accounts/hooks';

import { HistoryIcon, PaperPlaneIcon, QRCodeIcon, SwapIcon } from '../components/common/CustomIcons';
import { ModernHeader } from '../components/layout/ModernHeader';

// Types
interface BTCDetailState {
  balance: string;
  usdValue: string;
  icon?: string;
}

type TimeFrame = '1H' | '1J' | '1S' | '1M' | 'YTD' | 'TOUT';

// Mock trading data for BTC (you'll need to replace with real API data)
interface BTCTradingData {
  time: number;
  close: number; // Price in USD
}

// Token Price Chart Component
const BTCPriceChart: React.FC<{
  timeframe: TimeFrame;
  tradingData: BTCTradingData[];
  loading: boolean;
}> = ({ timeframe, tradingData, loading }) => {
  if (loading) {
    return (
      <div style={{ width: '100%', height: '160px', position: 'relative' }}>
        {/* Skeleton Chart */}
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 340 160"
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}>
          {/* Skeleton grid lines */}
          <defs>
            <linearGradient id="skeletonGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.1)" />
              <stop offset="50%" stopColor="rgba(255, 255, 255, 0.2)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          <line x1="0" y1="30" x2="340" y2="30" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          <line x1="0" y1="60" x2="340" y2="60" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          <line x1="0" y1="90" x2="340" y2="90" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />
          <line x1="0" y1="120" x2="340" y2="120" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" />

          {/* Skeleton chart line */}
          <path
            d="M0,100 Q80,60 140,80 T260,70 T340,50"
            stroke="url(#skeletonGradient)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="5,5">
            <animate attributeName="stroke-dashoffset" values="0;10" dur="1.5s" repeatCount="indefinite" />
          </path>

          {/* Skeleton area fill */}
          <path d="M0,100 Q80,60 140,80 T260,70 T340,50 L340,160 L0,160 Z" fill="url(#skeletonGradient)" opacity="0.3">
            <animate attributeName="opacity" values="0.1;0.3;0.1" dur="2s" repeatCount="indefinite" />
          </path>
        </svg>
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

  // Filter trading data based on timeframe
  const filterDataByTimeframe = (data: BTCTradingData[], timeframe: TimeFrame): BTCTradingData[] => {
    if (!Array.isArray(data) || data.length === 0) return [];

    const now = Date.now() / 1000; // Current time in seconds
    let timeLimit: number;

    switch (timeframe) {
      case '1H':
        timeLimit = now - 1 * 60 * 60; // 1 hour ago
        break;
      case '1J':
        timeLimit = now - 24 * 60 * 60; // 1 day ago
        break;
      case '1S':
        timeLimit = now - 7 * 24 * 60 * 60; // 1 week ago
        break;
      case '1M':
        timeLimit = now - 30 * 24 * 60 * 60; // 1 month ago
        break;
      case 'YTD':
        timeLimit = now - 365 * 24 * 60 * 60; // 1 year ago
        break;
      default:
        return data; // Return all data for 'TOUT'
    }

    return data.filter((item) => item.time >= timeLimit);
  };

  // Filter and convert trading data to chart format
  const filteredData = filterDataByTimeframe(tradingData, timeframe);
  const data = filteredData.map((item, i) => ({
    x: i,
    y: item.close
  }));

  // If no data for timeframe, show a flat chart
  if (data.length === 0) {
    const width = 340;
    const height = 200;
    const padding = 0;

    // Create a flat line in the middle of the chart
    const flatY = height / 2;
    const flatLine = `M0,${flatY} L${width},${flatY}`;
    const flatArea = `M0,${flatY} L${width},${flatY} L${width},${height} L0,${height} Z`;

    return (
      <div style={{ width: '100%', height: '160px', position: 'relative' }}>
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{ overflow: 'visible' }}>
          {/* Gradient for flat area */}
          <defs>
            <linearGradient id="flatGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(114, 228, 173, 0.1)" />
              <stop offset="100%" stopColor="rgba(114, 228, 173, 0)" />
            </linearGradient>
          </defs>

          {/* Flat area fill */}
          <motion.path
            d={flatArea}
            fill="url(#flatGradient)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />

          {/* Flat line */}
          <motion.path
            d={flatLine}
            stroke="var(--modern-accent-primary)"
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        </svg>
      </div>
    );
  }

  const width = 340;
  const height = 200;
  const padding = 0;

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
      onClick={onClick}
      style={{
        background: 'transparent',
        border: 'none',
        padding: '0',
        cursor: 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}>
      <div
        style={{
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff'
        }}>
        {icon}
      </div>
      <span
        style={{
          fontSize: '13px',
          fontWeight: '500',
          color: 'rgba(255, 255, 255, 0.8)',
          textAlign: 'center'
        }}>
        {label}
      </span>
    </motion.button>
  );
};

// Main Component
export const ModernBTCDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentAddress = useCurrentAddress();
  const btcData = location.state as BTCDetailState;

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('YTD');
  const [tradingData, setTradingData] = useState<BTCTradingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);

  // Mock BTC price data (you'll need to replace with real API data)
  const currentPrice = '$96,842.50';
  const priceChange = '+$1,245.32';
  const priceChangePercent = '+1.30%';
  const balance = btcData?.balance || '0.5';
  const value = btcData?.usdValue || '$48,421.25';
  const return24h = '+$625.15';

  // Fetch BTC trading data (you'll need to implement this with a real API)
  useEffect(() => {
    const fetchBTCData = async () => {
      try {
        setLoading(true);
        setChartLoading(true);

        // TODO: Replace with real BTC price API (e.g., CoinGecko, Binance, etc.)
        // For now, using mock data
        const mockData: BTCTradingData[] = [];
        const now = Date.now() / 1000;
        const basePrice = 96842.5;

        // Generate mock data for the last year
        for (let i = 365; i >= 0; i--) {
          const time = now - i * 24 * 60 * 60;
          const randomVariation = (Math.random() - 0.5) * 10000;
          const trendVariation = (365 - i) * 100; // Upward trend
          mockData.push({
            time,
            close: basePrice + randomVariation + trendVariation
          });
        }

        setTradingData(mockData);
      } catch (error) {
        console.error('Error fetching BTC data:', error);
      } finally {
        setLoading(false);
        setChartLoading(false);
      }
    };

    fetchBTCData();
  }, []);

  const formatBTCAmount = (amount: string): string => {
    const num = parseFloat(amount);
    if (num === 0) return '0';
    if (num < 0.00000001) return num.toExponential(2);
    return num.toFixed(8);
  };

  return (
    <>
      <style>
        {`
          .modern-btc-detail-scroll::-webkit-scrollbar {
            display: none;
          }
          .modern-btc-detail-scroll {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}
      </style>
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--modern-bg-primary)',
          display: 'flex',
          flexDirection: 'column'
        }}>
        {/* Header */}
        <ModernHeader title="Bitcoin" onBack={() => navigate('#back')} showBackButton={true} />

        {/* Scrollable Content */}
        <div
          className="modern-btc-detail-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
          {/* BTC Price Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            style={{
              padding: '20px',
              textAlign: 'center'
            }}>
            <div style={{ fontSize: '40px', fontWeight: '700', color: '#ffffff', marginBottom: '8px' }}>
              {currentPrice}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px', color: 'var(--modern-accent-primary)', fontWeight: '500' }}>
                {priceChange}
              </span>
              <span
                style={{
                  fontSize: '14px',
                  padding: '4px 8px',
                  background: 'rgba(114, 228, 173, 0.15)',
                  borderRadius: '6px',
                  color: 'var(--modern-accent-primary)',
                  fontWeight: '400'
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
            <BTCPriceChart timeframe={selectedTimeframe} tradingData={tradingData} loading={chartLoading} />
          </motion.div>

          {/* Timeframe Selector */}
          <TimeframeSelector selected={selectedTimeframe} onChange={setSelectedTimeframe} />

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: '12px',
              padding: '0 20px 16px'
            }}>
            <ActionButton
              icon={<QRCodeIcon size={24} color="#ffffff" />}
              label="Receive"
              onClick={() => navigate('ReceiveScreen')}
            />
            <ActionButton
              icon={<PaperPlaneIcon size={24} color="#ffffff" />}
              label="Send"
              onClick={() => navigate('TxCreateScreen')}
            />
            <ActionButton
              icon={<SwapIcon size={24} color="#ffffff" />}
              label="Swap"
              onClick={() => navigate('ModernSwapScreen')}
            />
            <ActionButton
              icon={<HistoryIcon size={24} color="#ffffff" />}
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
                  <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '6px' }}>
                    Balance
                  </div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: '#ffffff', wordBreak: 'break-all' }}>
                    {formatBTCAmount(balance)} BTC
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
                <span style={{ fontSize: '15px', fontWeight: '600', color: 'var(--modern-accent-primary)' }}>
                  {return24h}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Market Statistics Section */}
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
              Market Statistics
            </h3>

            <div
              style={{
                background: 'var(--modern-bg-secondary)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '12px',
                overflow: 'hidden'
              }}>
              {/* Market Cap */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Market Cap</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>$1.92T</span>
              </div>

              {/* 24h Volume */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>24h Volume</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>$42.8B</span>
              </div>

              {/* Circulating Supply */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Circulating Supply</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>19.8M BTC</span>
              </div>
            </div>
          </motion.div>

          {/* Information Section */}
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
              {/* Name */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Name</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>Bitcoin</span>
              </div>

              {/* Symbol */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Symbol</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>BTC</span>
              </div>

              {/* Network */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Network</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>Bitcoin</span>
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
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>21,000,000 BTC</span>
              </div>

              {/* Circulating Supply */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Circulating Supply</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>19,800,000 BTC</span>
              </div>

              {/* Block Time */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Block Time</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>~10 minutes</span>
              </div>

              {/* Algorithm */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Algorithm</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>SHA-256</span>
              </div>

              {/* Launch Date */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Launch Date</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>January 3, 2009</span>
              </div>
            </div>
          </motion.div>

          {/* Activity Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
            style={{ padding: '0 20px 40px' }}>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
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
                  Bitcoin transactions will appear here
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

