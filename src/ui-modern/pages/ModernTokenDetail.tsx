import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

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
const TokenPriceChart: React.FC<{ timeframe: TimeFrame }> = ({ timeframe }) => {
  // Génération de données fictives pour le graphique
  const generateChartData = (timeframe: TimeFrame) => {
    const dataPoints = timeframe === '1H' ? 60 : timeframe === '1J' ? 24 : 30;
    return Array.from({ length: dataPoints }, (_, i) => ({
      x: i,
      y: 0.98 + Math.random() * 0.04 // Prix entre 0.98 et 1.02 pour stablecoin
    }));
  };

  const data = generateChartData(timeframe);
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
        minWidth: 0
      }}>
      <div
        style={{
          width: '36px',
          height: '36px',
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

  if (!tokenData) {
    return null;
  }

  // Mock data pour la démo
  const currentPrice = '$1.00';
  const priceChange = '+$0.00058039';
  const priceChangePercent = '+0.06%';
  const balance = tokenData.balance || '1,750';
  const value = tokenData.usdValue || '$1,749.74';
  const return24h = '-$0.03';

  const handleCopyContract = async () => {
    if (tokenData.contractAddress) {
      try {
        await navigator.clipboard.writeText(tokenData.contractAddress);
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
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
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
          <TokenPriceChart timeframe={selectedTimeframe} />
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
            icon={<QRCodeIcon size={20} color="var(--modern-accent-primary)" />}
            label="Receive"
            onClick={() => navigate('ReceiveScreen')}
          />
          <ActionButton
            icon={<PaperPlaneIcon size={20} color="var(--modern-accent-primary)" />}
            label="Send"
            onClick={() => navigate('TxCreateScreen')}
          />
          <ActionButton
            icon={<SwapIcon size={20} color="var(--modern-accent-primary)" />}
            label="Swap"
            onClick={() => navigate('ModernSwapScreen')}
          />
          <ActionButton
            icon={<HistoryIcon size={20} color="var(--modern-accent-primary)" />}
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
                  {balance}
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

        {/* Informations Section */}
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
            {tokenData.contractAddress && (
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
                    {shortenAddress(tokenData.contractAddress)}
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

            {/* Mock data */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Market Cap</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>$4.14B</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Total Supply</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>76.08B</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Circulating Supply</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>76.07B</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Holders</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>5.7M</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 14px'
              }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)' }}>Created</span>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff' }}>Aug 18, 2023</span>
            </div>
          </div>
        </motion.div>

        {/* À propos Section */}
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
            About
          </h3>

          <div
            style={{
              background: 'var(--modern-bg-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px'
            }}>
            <p
              style={{
                fontSize: '13px',
                lineHeight: '1.6',
                color: 'rgba(255, 255, 255, 0.7)',
                marginBottom: '10px'
              }}>
              USDC is a fully collateralized US dollar stablecoin. USDC is the bridge between dollars and trading on
              cryptocurrency...
            </p>
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--modern-accent-primary)',
                fontSize: '13px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0
              }}>
              Show more
            </button>

            {/* Social Links */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M2 12h20" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Website
              </button>
              <button
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  padding: '9px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '8px',
                  color: '#ffffff',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.865-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                </svg>
                Discord
              </button>
            </div>
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
            <button
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--modern-accent-primary)',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                padding: 0
              }}>
              See more
            </button>
          </div>

          <div
            style={{
              background: 'var(--modern-bg-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '12px',
              padding: '14px'
            }}>
            {/* Transaction Item */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(114, 228, 173, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--modern-accent-primary)'
                }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7-7 7 7" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '3px' }}>
                  Received
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>From 0x589a...a8dc</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#34c759', marginBottom: '3px' }}>
                  +1,750 {tokenData.symbol}
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>2h ago</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
