import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

import { RawTxInfo } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import { satoshisToAmount } from '@/ui/utils';

import UniversalLogo from '../../Logo Universal copy.svg';
import { ModernButton } from '../common/ModernButton';
import { ModernCard } from '../common/ModernCard';
import type { Asset } from './ModernAssetsList';

interface ModernTxConfirmContentProps {
  rawTxInfo: RawTxInfo;
  toAmount: number;
  enableRBF: boolean;
  feeRate: number;
  onCancel: () => void;
  onConfirm: () => void;
  loading?: boolean;
  selectedAsset?: Asset;
}

export const ModernTxConfirmContent: React.FC<ModernTxConfirmContentProps> = ({
  rawTxInfo,
  toAmount: toAmountSatoshis,
  enableRBF,
  feeRate,
  onCancel,
  onConfirm,
  loading = false,
  selectedAsset
}) => {
  const { t } = useI18n();
  const btcUnit = useBTCUnit();
  const chain = useChain();

  // Determine token info to display
  const tokenInfo = useMemo(() => {
    if (selectedAsset && selectedAsset.type !== 'btc') {
      return {
        symbol: selectedAsset.symbol || selectedAsset.name,
        name: selectedAsset.name,
        icon: selectedAsset.icon || <span style={{ fontSize: '18px' }}>🪙</span>
      };
    }
    return {
      symbol: btcUnit,
      name: 'Bitcoin',
      icon: <span style={{ fontSize: '18px' }}>₿</span>
    };
  }, [selectedAsset, btcUnit]);

  // Calculate amounts
  const sendAmount = useMemo(() => {
    const totalSatoshis = (rawTxInfo.fee || 0) + toAmountSatoshis;
    const totalAmount = satoshisToAmount(totalSatoshis);

    console.log('ModernTxConfirmContent: Total calculation:');
    console.log('  - Fee satoshis:', rawTxInfo.fee || 0);
    console.log('  - To amount satoshis:', toAmountSatoshis);
    console.log('  - Total satoshis:', totalSatoshis);
    console.log('  - Total amount:', totalAmount);

    return totalAmount;
  }, [rawTxInfo.fee, toAmountSatoshis]);

  const toAmount = useMemo(() => {
    return satoshisToAmount(toAmountSatoshis);
  }, [toAmountSatoshis]);

  const feeAmount = useMemo(() => {
    console.log('ModernTxConfirmContent: RawTxInfo:', rawTxInfo);
    console.log('ModernTxConfirmContent: Fee from rawTxInfo:', rawTxInfo.fee);
    console.log('ModernTxConfirmContent: FeeRate:', feeRate);

    const calculatedFeeAmount = satoshisToAmount(rawTxInfo.fee || 0);
    console.log('ModernTxConfirmContent: Calculated fee amount:', calculatedFeeAmount);

    return calculatedFeeAmount;
  }, [rawTxInfo.fee, feeRate]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px',
        gap: '16px',
        overflow: 'hidden'
      }}>
      {/* Token Icon */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          display: 'flex',
          justifyContent: 'center'
        }}>
        <img
          src={UniversalLogo}
          alt="Universal Logo"
          style={{
            width: '60px',
            height: '60px',
            objectFit: 'contain',
            filter: 'brightness(0) invert(1)'
          }}
        />
      </motion.div>

      {/* Address Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}>
        <ModernCard padding="md" className="tx-confirm-address-card">
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
              {t('send_to')}
            </p>
            <div
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
              <p
                style={{
                  fontSize: '11px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontFamily: 'monospace',
                  wordBreak: 'break-all',
                  lineHeight: '1.4',
                  margin: 0
                }}>
                {rawTxInfo.toAddressInfo.address}
              </p>
            </div>
          </div>
        </ModernCard>
      </motion.div>

      {/* Token Amount Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}>
        <ModernCard padding="md" className="tx-confirm-token-card">
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)',
                marginBottom: '8px',
                fontWeight: '500'
              }}>
              {t('amount')}
            </p>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: '6px' }}>
              <span
                style={{
                  fontSize: '24px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '-0.5px'
                }}>
                {toAmount}
              </span>
              <span
                style={{
                  fontSize: '16px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  fontWeight: '600'
                }}>
                {tokenInfo.symbol}
              </span>
            </div>
          </div>
        </ModernCard>
      </motion.div>

      {/* Fee Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}>
        <ModernCard padding="sm" className="tx-confirm-fee-card">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Network Fee */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: '500'
                }}>
                {t('network_fee')}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                {feeAmount} {btcUnit}
              </span>
            </div>

            {/* Fee Rate */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  fontWeight: '500'
                }}>
                {t('fee_rate')}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: '#ffffff',
                  fontWeight: '600'
                }}>
                {feeRate} sat/vB
              </span>
            </div>
          </div>
        </ModernCard>
      </motion.div>

      {/* RBF Info */}
      {enableRBF && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 12px',
            backgroundColor: 'rgba(52, 199, 89, 0.1)',
            borderRadius: '8px',
            border: '1px solid rgba(52, 199, 89, 0.3)'
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
              stroke="#34c759"
              strokeWidth="2"
            />
            <path d="M12 8V12" stroke="#34c759" strokeWidth="2" strokeLinecap="round" />
            <circle cx="12" cy="16" r="1" fill="#34c759" />
          </svg>
          <span
            style={{
              fontSize: '11px',
              color: 'rgba(52, 199, 89, 0.9)',
              fontWeight: '500'
            }}>
            {t('replace_by_fee_enabled')}
          </span>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          marginTop: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          paddingTop: '8px'
        }}>
        <ModernButton variant="primary" size="large" fullWidth onClick={onConfirm} disabled={loading} loading={loading}>
          {loading ? t('confirming') : t('confirm_and_send')}
        </ModernButton>

        <ModernButton variant="secondary" size="large" fullWidth onClick={onCancel} disabled={loading}>
          {t('cancel')}
        </ModernButton>
      </motion.div>

      <style>{`
        .tx-confirm-address-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tx-confirm-token-card {
          background: linear-gradient(135deg, rgba(52, 199, 89, 0.1) 0%, rgba(0, 0, 0, 0.3) 100%);
          border: 1px solid rgba(52, 199, 89, 0.3);
        }

        .tx-confirm-fee-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};
