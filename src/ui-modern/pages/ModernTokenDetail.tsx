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
import { usePrice } from '@/ui/provider/PriceProvider';
import { useCurrentAddress } from '@/ui/state/accounts/hooks';

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
  btcPriceUSD?: number;
}> = ({ timeframe, tradingData, loading, btcPriceUSD = 0 }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; timestamp: number } | null>(
    null
  );

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
  const filterDataByTimeframe = (data: BlacknodeTradingData[], timeframe: TimeFrame): BlacknodeTradingData[] => {
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
    y: item.close / 100000000 // Convert satoshis to BTC
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

  // Calculate SVG coordinates for each point
  const svgPoints = data.map((point, i) => {
    const x = padding + (i / (data.length - 1)) * (width - padding * 2);
    const y = height - padding - ((point.y - minY) / rangeY) * (height - padding * 2);
    return { x, y, index: i };
  });

  const points = svgPoints.map((p) => `${p.x},${p.y}`).join(' ');

  // Créer le path pour l'area fill
  const firstX = padding;
  const lastX = padding + (width - padding * 2);
  const areaPath = `M${firstX},${height - padding} L${points} L${lastX},${height - padding} Z`;

  // Handle mouse move to show tooltip
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;

    // Convert mouse position to viewBox coordinates
    const viewBoxX = (mouseX / rect.width) * width;

    // Find closest point
    let closestPoint = svgPoints[0];
    let minDistance = Math.abs(svgPoints[0].x - viewBoxX);

    svgPoints.forEach((point) => {
      const distance = Math.abs(point.x - viewBoxX);
      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = point;
      }
    });

    // Get the actual data for this point
    const dataPoint = filteredData[closestPoint.index];
    setHoveredPoint({
      x: closestPoint.x,
      y: closestPoint.y,
      price: dataPoint.close / 100000000, // Convert satoshis to BTC
      timestamp: dataPoint.time * 1000 // Convert seconds to milliseconds
    });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Format timestamp for tooltip
  const formatTooltipTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div style={{ width: '100%', height: '160px', position: 'relative' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ overflow: 'visible', cursor: 'crosshair' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}>
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

        {/* Vertical line and indicator when hovering */}
        {hoveredPoint && (
          <>
            {/* Vertical line */}
            <line
              x1={hoveredPoint.x}
              y1={0}
              x2={hoveredPoint.x}
              y2={height}
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* Circle indicator on the line */}
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="4"
              fill="var(--modern-accent-primary)"
              stroke="#121212"
              strokeWidth="2"
            />

            {/* Outer glow circle */}
            <circle
              cx={hoveredPoint.x}
              cy={hoveredPoint.y}
              r="8"
              fill="none"
              stroke="var(--modern-accent-primary)"
              strokeWidth="1"
              opacity="0.3"
            />
          </>
        )}
      </svg>

      {/* Tooltip */}
      {hoveredPoint && (
        <div
          style={{
            position: 'absolute',
            left: `${(hoveredPoint.x / width) * 100}%`,
            top: `${((hoveredPoint.y - 40) / height) * 100}%`,
            transform: 'translate(-50%, -100%)',
            background: 'rgba(18, 18, 18, 0.95)',
            border: '1px solid rgba(114, 228, 173, 0.3)',
            borderRadius: '8px',
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 10,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(10px)',
            minWidth: '120px'
          }}>
          <div
            style={{ fontSize: '14px', fontWeight: '600', color: 'var(--modern-accent-primary)', marginBottom: '4px' }}>
            {btcPriceUSD > 0
              ? (() => {
                  const usdPrice = hoveredPoint.price * btcPriceUSD;
                  if (usdPrice >= 1) return `$${usdPrice.toFixed(2)}`;
                  if (usdPrice >= 0.01) return `$${usdPrice.toFixed(4)}`;
                  if (usdPrice >= 0.0001) return `$${usdPrice.toFixed(6)}`;
                  if (usdPrice < 0.000001) return `$${usdPrice.toExponential(2)}`;
                  return `$${usdPrice.toFixed(8)}`;
                })()
              : `${hoveredPoint.price.toFixed(8)} BTC`}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
            {formatTooltipTime(hoveredPoint.timestamp)}
          </div>
        </div>
      )}
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
export const ModernTokenDetail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentAddress = useCurrentAddress();
  const { coinPrice } = usePrice();
  const tokenData = location.state as TokenDetailState;

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('YTD');
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
      // Use the current address from the hook

      try {
        setHistoryLoading(true);
        const history = await simplicityService.getBlacknodeAddressHistory(currentAddress, 100);

        // Filter history to only show transactions for the current ticker
        const filteredHistory = history.filter((item) => item.ticker === tokenData?.symbol);

        // Debug logs
        console.log('Address History Debug:', {
          currentAddress,
          totalHistory: history.length,
          filteredHistory: filteredHistory.length,
          sampleTransaction: filteredHistory[0],
          allTransactions: filteredHistory.map((tx) => ({
            id: tx.id,
            from: tx.from_address,
            to: tx.to_address,
            amount: tx.amount,
            ticker: tx.ticker
          }))
        });

        setAddressHistory(filteredHistory);
      } catch (error) {
        console.error('Error fetching address history:', error);
        setAddressHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    if (tokenData?.symbol && currentAddress) {
      fetchAddressHistory();
    }
  }, [tokenData?.symbol, currentAddress]);

  if (!tokenData) {
    return null;
  }

  // Current wallet address from hook

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
      // Debug logs
      console.log('Transaction Debug:', {
        op,
        fromAddress,
        toAddress,
        currentAddress,
        isReceived: toAddress === currentAddress,
        isSent: toAddress !== currentAddress
      });

      // Si to_address == currentAddress alors entrant, sinon sortant
      return toAddress === currentAddress ? 'Received' : 'Sent';
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
    <>
      <style>
        {`
          .modern-token-detail-scroll::-webkit-scrollbar {
            display: none;
          }
          .modern-token-detail-scroll {
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
        <ModernHeader title={tokenData.name} onBack={() => navigate('#back')} showBackButton={true} />

        {/* Scrollable Content */}
        <div
          className="modern-token-detail-scroll"
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden'
          }}>
          {/* Token Price Section */}
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
            <TokenPriceChart
              timeframe={selectedTimeframe}
              tradingData={tradingData}
              loading={chartLoading}
              btcPriceUSD={coinPrice?.btc || 0}
            />
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
              onClick={() =>
                navigate('TxCreateScreen', {
                  selectedAsset: {
                    id: tokenData.tokenId,
                    name: tokenData.name,
                    symbol: tokenData.symbol,
                    amount: tokenData.balance,
                    usdValue: tokenData.usdValue,
                    type: 'simplicity',
                    icon: tokenData.icon,
                    contractAddress: tokenData.contractAddress,
                    network: tokenData.network
                  }
                })
              }
            />
            <ActionButton
              icon={<SwapIcon size={24} color="#ffffff" />}
              label="Swap"
              onClick={() =>
                navigate('ModernSwapScreen', {
                  selectedAsset: {
                    id: tokenData.tokenId,
                    name: tokenData.name,
                    symbol: tokenData.symbol,
                    amount: tokenData.balance,
                    usdValue: tokenData.usdValue,
                    type: 'simplicity',
                    icon: tokenData.icon,
                    contractAddress: tokenData.contractAddress,
                    network: tokenData.network
                  }
                })
              }
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
                overflow: 'hidden'
              }}>
              {/* Total Trades */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Total Trades</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
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
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Total Volume</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
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
                  alignItems: 'center',
                  padding: '12px 14px'
                }}>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Active Listings</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>
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
                  {loading
                    ? '...'
                    : tickerInfo?.max_supply
                    ? parseFloat(tickerInfo.max_supply).toLocaleString()
                    : 'N/A'}
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
                  // Use the current address variable
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
    </>
  );
};
