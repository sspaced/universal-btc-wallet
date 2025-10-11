import BigNumber from 'bignumber.js';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';

import { runesUtils } from '@/shared/lib/runes-utils';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useChain } from '@/ui/state/settings/hooks';
import { satoshisToBTC } from '@/ui/utils';

import { ModernHeader } from '../components/layout/ModernHeader';
import { HistoryItem } from './ModernHistoryScreen';

function AmountItem({ item, inDetail }: { item: any; inDetail?: boolean }) {
  const isReceived = item.value.isPositive();

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
      <span
        style={{
          fontSize: inDetail ? '32px' : '13px',
          color: isReceived ? '#34c759' : '#ff453a',
          fontWeight: '700'
        }}>
        {isReceived ? '+' : '-'}
      </span>
      {item.type === 'BTC' && (
        <span style={{ fontSize: inDetail ? '32px' : '13px', color: '#ffffff', fontWeight: '700' }}>
          {Number(item.value.abs().toNumber()).toLocaleString('en', { minimumFractionDigits: 8 })}
        </span>
      )}
      {item.type === 'BRC20' && (
        <span style={{ fontSize: inDetail ? '32px' : '13px', color: '#ffffff', fontWeight: '700' }}>
          {item.value.abs().toString()}
        </span>
      )}
      {item.type === 'RUNES' && (
        <span style={{ fontSize: inDetail ? '32px' : '13px', color: '#ffffff', fontWeight: '700' }}>
          {runesUtils.toDecimalAmount(item.value.abs().toString(), item.div)}
        </span>
      )}
      <span style={{ fontSize: inDetail ? '20px' : '13px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600' }}>
        {item.symbol || item.ticker}
      </span>
      {item.type !== 'BTC' && inDetail && (
        <span
          style={{
            fontSize: '12px',
            padding: '4px 8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '6px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
          {item.type}
        </span>
      )}
    </div>
  );
}

export const ModernHistoryDetail: React.FC = () => {
  const location = useLocation();
  const detail = location.state as HistoryItem;
  const navigate = useNavigate();
  const chain = useChain();
  const isReceive = detail?.type === 'receive';
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedTxid, setCopiedTxid] = useState(false);

  if (!detail) {
    return null;
  }

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(detail.address);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  const handleCopyTxid = async () => {
    try {
      await navigator.clipboard.writeText(detail.txid);
      setCopiedTxid(true);
      setTimeout(() => setCopiedTxid(false), 2000);
    } catch (err) {
      console.error('Failed to copy txid:', err);
    }
  };

  const shortenHash = (hash: string): string => {
    if (!hash || hash.length < 16) return hash;
    return `${hash.slice(0, 8)}...${hash.slice(-8)}`;
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#121212',
        display: 'flex',
        flexDirection: 'column'
      }}>
      {/* Header */}
      <ModernHeader title="Transaction Details" onBack={() => navigate('ModernHistoryScreen')} showBackButton={true} />

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px'
        }}>
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '12px',
            padding: '20px 16px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '16px'
          }}>
          {/* Status Icon */}
          {detail.confirmations > 0 ? (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                background: 'rgba(52, 199, 89, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <path
                  d="M9 16l5 5 9-10"
                  stroke="#34c759"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          ) : (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '24px',
                background: 'rgba(255, 159, 10, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="2" fill="#ff9f0a" />
                <circle cx="16" cy="16" r="8" stroke="#ff9f0a" strokeWidth="2" opacity="0.5" />
              </svg>
            </div>
          )}

          {/* Status Text */}
          <span
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: detail.confirmations > 0 ? '#34c759' : '#ff9f0a'
            }}>
            {detail.confirmations > 0 ? 'Transaction Success' : 'Unconfirmed'}
          </span>

          {/* Amount */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
            <AmountItem
              inDetail
              item={{
                ticker: 'BTC',
                value: new BigNumber(detail.btcAmount),
                type: 'BTC',
                div: 0,
                symbol: 'BTC'
              }}
            />
            {detail.extra.map((extraItem, index) => (
              <AmountItem key={index} item={extraItem} inDetail />
            ))}
          </div>

          {/* Divider */}
          <div
            style={{
              width: '100%',
              height: '1px',
              background: 'rgba(255, 255, 255, 0.1)',
              margin: '8px 0'
            }}
          />

          {/* Transaction Details */}
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Address */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
                {isReceive ? 'Received from' : 'Send To'}
              </span>
              <div
                onClick={handleCopyAddress}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                <span style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>
                  {shortenHash(detail.address)}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={copiedAddress ? '#34c759' : 'rgba(255, 255, 255, 0.6)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  {copiedAddress ? (
                    <path d="M20 6L9 17l-5-5" />
                  ) : (
                    <>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </>
                  )}
                </svg>
              </div>
            </div>

            {/* Transaction ID */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>Transaction ID</span>
              <div
                onClick={handleCopyTxid}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  padding: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}>
                <span style={{ fontSize: '13px', color: '#ffffff', fontFamily: 'monospace' }}>
                  {shortenHash(detail.txid)}
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={copiedTxid ? '#34c759' : 'rgba(255, 255, 255, 0.6)'}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  {copiedTxid ? (
                    <path d="M20 6L9 17l-5-5" />
                  ) : (
                    <>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </>
                  )}
                </svg>
              </div>
            </div>

            {/* Network Fee */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Network fee</span>
              <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>
                {Number(Math.abs(satoshisToBTC(detail.fee))).toLocaleString('en', { minimumFractionDigits: 8 })} BTC
              </span>
            </div>

            {/* Fee Rate */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Network fee rate</span>
              <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '600' }}>{detail.feeRate} sats/vB</span>
            </div>

            {/* Date */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>Date</span>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.7)' }}>
                {new Date(detail.timestamp).toLocaleString()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Explorer Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            onClick={() => window.open(`https://nullpool.space/tx/${detail.txid}`)}
            style={{
              background: 'var(--apple-blue)',
              border: 'none',
              borderRadius: '10px',
              padding: '12px',
              color: '#000000',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}>
            View on Nullpool
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <path
                d="M12 8.667V12a1.333 1.333 0 01-1.333 1.333H4A1.333 1.333 0 012.667 12V5.333A1.333 1.333 0 014 4h3.333M10 2.667h3.333V6M6.667 9.333L13.333 2.667"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </motion.div>
      </div>
    </div>
  );
};
