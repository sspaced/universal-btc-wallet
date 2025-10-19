import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useNavigate } from '@/ui/pages/MainRoute';
import { useCurrentAddress } from '@/ui/state/accounts/hooks';
import { useWallet } from '@/ui/utils';

import { HistoryIcon, PaperPlaneIcon, QRCodeIcon, SwapIcon } from '../components/common/CustomIcons';
import { ModernHeader } from '../components/layout/ModernHeader';
import {
    binanceWebSocket,
    ChartDataPoint,
    fetchBTCHistoricalData,
    getBinanceInterval,
    TimeRange
} from '../services/BinanceService';

// Types
interface BTCDetailState {
  balance: string;
  usdValue: string;
  icon?: string;
}

// Use TimeRange from BinanceService
type TimeFrame = TimeRange;

interface BTCHistoryItem {
  txid: string;
  address: string;
  type: 'receive' | 'send';
  btcAmount: number;
  confirmations: number;
  feeRate: number;
  fee: number;
  outputValue: number;
  timestamp: number;
}

// Token Price Chart Component
const BTCPriceChart: React.FC<{
  timeframe: TimeFrame;
  tradingData: ChartDataPoint[];
  loading: boolean;
}> = ({ timeframe, tradingData, loading }) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; price: number; timestamp: number } | null>(null);
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

  // Data is already pre-filtered by the Binance API call
  const filteredData = tradingData;
  
  // Convert trading data to chart format
  const data = filteredData.map((item, i) => ({
    x: i,
    y: item.price // Use 'price' field from ChartDataPoint
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
      price: dataPoint.price,
      timestamp: dataPoint.timestamp
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
          <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--modern-accent-primary)', marginBottom: '4px' }}>
            ${hoveredPoint.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
  const timeframes: TimeFrame[] = ['1H', '1D', '1W', '1M', 'YTD', 'ALL'];

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
  const wallet = useWallet();
  const btcData = location.state as BTCDetailState;

  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeFrame>('YTD');
  const [tradingData, setTradingData] = useState<ChartDataPoint[]>([]);
  const [btcHistory, setBTCHistory] = useState<BTCHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [currentPrice, setCurrentPrice] = useState<string>('$0.00');
  const [priceChangePercent, setPriceChangePercent] = useState<string>('+0.00%');
  const [isPricePositive, setIsPricePositive] = useState<boolean>(true);
  const isWebSocketActive = useRef(false);

  const balance = btcData?.balance || '0.5';
  const value = btcData?.usdValue || '$48,421.25';
  const return24h = '+$625.15';

  // Fetch BTC trading data from Binance API
  useEffect(() => {
    const fetchBTCData = async () => {
      try {
        setChartLoading(true);
        setLoading(true);

        console.log(`[ModernBTCDetail] Fetching data for timeframe: ${selectedTimeframe}`);

        // Fetch historical data from Binance
        const data = await fetchBTCHistoricalData(selectedTimeframe);
        
        console.log(`[ModernBTCDetail] Received ${data.length} data points`);
        setTradingData(data);

        // Calculate current price and changes
        if (data.length > 0) {
          const latestPrice = data[data.length - 1].price;
          const oldestPrice = data[0].price;
          const priceDiff = latestPrice - oldestPrice;
          const priceChangePerc = (priceDiff / oldestPrice) * 100;

          setCurrentPrice(`$${latestPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
          setPriceChangePercent(`${priceChangePerc >= 0 ? '+' : ''}${priceChangePerc.toFixed(2)}%`);
          setIsPricePositive(priceChangePerc >= 0);
        }
      } catch (error) {
        console.error('[ModernBTCDetail] Error fetching BTC data from Binance:', error);
        // Keep empty data on error
        setTradingData([]);
      } finally {
        setLoading(false);
        setChartLoading(false);
      }
    };

    fetchBTCData();
  }, [selectedTimeframe]);

  // Setup WebSocket for real-time updates
  useEffect(() => {
    if (tradingData.length === 0) return;

    const interval = getBinanceInterval(selectedTimeframe);
    console.log(`[ModernBTCDetail] Connecting WebSocket for interval: ${interval}`);

    isWebSocketActive.current = true;

    binanceWebSocket.connect(interval, (newData: ChartDataPoint) => {
      if (!isWebSocketActive.current) return;

      console.log(`[ModernBTCDetail] WebSocket update:`, newData);

      setTradingData((prevData) => {
        if (prevData.length === 0) return [newData];

        // Calculate price change percentage with first data point
        const oldestPrice = prevData[0].price;
        const latestPrice = newData.price;
        const priceDiff = latestPrice - oldestPrice;
        const priceChangePerc = (priceDiff / oldestPrice) * 100;

        // Update current price and percentage
        setCurrentPrice(`$${latestPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
        setPriceChangePercent(`${priceChangePerc >= 0 ? '+' : ''}${priceChangePerc.toFixed(2)}%`);
        setIsPricePositive(priceChangePerc >= 0);

        // If candlestick is closed, add a new point
        if (newData.isClosed) {
          console.log('[ModernBTCDetail] New candlestick closed, adding point');
          return [...prevData, newData];
        } else {
          // If candlestick is still open, update the last point
          console.log('[ModernBTCDetail] Updating current candlestick');
          const updated = [...prevData];
          updated[updated.length - 1] = newData;
          return updated;
        }
      });
    });

    // Cleanup on unmount or timeframe change
    return () => {
      console.log('[ModernBTCDetail] Disconnecting WebSocket');
      isWebSocketActive.current = false;
      binanceWebSocket.disconnect();
    };
  }, [selectedTimeframe, tradingData.length]);

  // Fetch BTC transaction history
  useEffect(() => {
    const fetchBTCHistory = async () => {
      if (!currentAddress) return;

      try {
        setHistoryLoading(true);
        const historyRes = await wallet.getAddressHistory({
          address: currentAddress,
          start: 0,
          limit: 20
        });

        console.log('=== BTC HISTORY DEBUG ===');
        console.log('Full history response:', historyRes);
        console.log('History detail:', historyRes.detail);
        console.log('Sample item:', historyRes.detail?.[0]);

        // Transform the history to our BTCHistoryItem format
        const btcTxs: BTCHistoryItem[] = (historyRes.detail || [])
          .map((item: any) => {
            console.log('Processing transaction:', {
              txid: item.txid,
              type: item.type,
              btcAmount: item.btcAmount,
              address: item.address
            });
            return {
              txid: item.txid,
              address: item.address || currentAddress,
              type: item.type,
              btcAmount: item.btcAmount || 0,
              confirmations: item.confirmations || 0,
              feeRate: item.feeRate || 0,
              fee: item.fee || 0,
              outputValue: item.outputValue || 0,
              timestamp: item.timestamp || Date.now() / 1000
            };
          });

        console.log('Processed BTC transactions:', btcTxs);
        console.log('Total transactions:', btcTxs.length);
        setBTCHistory(btcTxs);
      } catch (error) {
        console.error('Error fetching BTC history:', error);
        setBTCHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    fetchBTCHistory();
  }, [currentAddress, wallet]);

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
              <span
                style={{
                  fontSize: '16px',
                  padding: '4px 8px',
                  background: isPricePositive ? 'rgba(114, 228, 173, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  borderRadius: '6px',
                  color: isPricePositive ? 'var(--modern-accent-primary)' : '#ef4444',
                  fontWeight: '500'
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
              {historyLoading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Loading transactions...
                </div>
              ) : btcHistory.length === 0 ? (
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
              ) : (
                btcHistory.slice(0, 5).map((tx) => {
                  const isReceived = tx.type === 'receive';
                  const isSent = tx.type === 'send';
                  const btcAmount = (tx.btcAmount / 100000000).toFixed(8);

                  // Format timestamp
                  const now = Date.now();
                  const txTime = tx.timestamp * 1000;
                  const diffInSeconds = Math.floor((now - txTime) / 1000);
                  let timeAgo = '';
                  if (diffInSeconds < 60) timeAgo = `${diffInSeconds}s ago`;
                  else if (diffInSeconds < 3600) timeAgo = `${Math.floor(diffInSeconds / 60)}m ago`;
                  else if (diffInSeconds < 86400) timeAgo = `${Math.floor(diffInSeconds / 3600)}h ago`;
                  else timeAgo = `${Math.floor(diffInSeconds / 86400)}d ago`;

                  // Shorten address
                  const shortenedAddress =
                    tx.address.length > 16 ? `${tx.address.slice(0, 8)}...${tx.address.slice(-5)}` : tx.address;

                  return (
                    <div
                      key={tx.txid}
                      onClick={() => window.open(`https://mempool.space/tx/${tx.txid}`, '_blank')}
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
                        {isReceived ? (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                          </svg>
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                          </svg>
                        )}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>
                          {isReceived ? 'Received' : 'Sent'}
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>
                          {isSent ? `To ${shortenedAddress}` : `From ${shortenedAddress}`}
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
                          {isReceived ? '+' : '-'}
                          {btcAmount} BTC
                        </div>
                        <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.6)' }}>{timeAgo}</div>
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

