import { motion } from 'framer-motion';
import React from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useTxExplorerUrl } from '@/ui/state/settings/hooks';
import { useLocationState } from '@/ui/utils';

import { ModernButton } from '../components/common/ModernButton';
import { ModernCard } from '../components/common/ModernCard';
import { ModernHeader } from '../components/layout/ModernHeader';
import { ModernMainContent } from '../components/layout/ModernMainContent';

interface LocationState {
  txid: string;
}

export const ModernTxSuccessScreen: React.FC = () => {
  const { txid } = useLocationState<LocationState>();
  const navigate = useNavigate();
  const txidUrl = useTxExplorerUrl(txid);
  const { t } = useI18n();

  const handleDone = () => {
    navigate('MainScreen');
  };

  const handleViewExplorer = () => {
    window.open(txidUrl, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#000000',
        color: '#ffffff'
      }}>
      <ModernHeader title={t('transaction_success')} showBackButton={false} />

      <ModernMainContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '60vh',
            padding: '20px'
          }}>
          {/* Success Animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 15,
              delay: 0.2
            }}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: 'rgba(52, 199, 89, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '2px solid rgba(52, 199, 89, 0.3)'
            }}>
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                width: '40px',
                height: '40px'
              }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%' }}>
                <motion.path
                  d="M9 12l2 2 4-4"
                  stroke="#34C759"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1
              style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '8px',
                letterSpacing: '-0.5px'
              }}>
              {t('payment_sent')}
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.5',
                margin: 0
              }}>
              {t('your_transaction_has_been_successfully_sent')}
            </p>
          </motion.div>

          {/* Transaction Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            style={{ width: '100%', maxWidth: '400px' }}>
            <ModernCard padding="lg" className="success-details-card">
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '8px',
                    fontWeight: '500'
                  }}>
                  Transaction ID
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontFamily: 'monospace',
                    wordBreak: 'break-all',
                    lineHeight: '1.4',
                    margin: 0
                  }}>
                  {txid}
                </p>
              </div>
            </ModernCard>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            style={{
              width: '100%',
              maxWidth: '400px',
              marginTop: '32px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
            <ModernButton
              variant="secondary"
              size="large"
              fullWidth
              onClick={handleViewExplorer}
              leftIcon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 3h6v6M10 14L21 3M21 3v6M21 3h-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              }>
              {t('view_on_block_explorer')}
            </ModernButton>

            <ModernButton variant="primary" size="large" fullWidth onClick={handleDone}>
              {t('done')}
            </ModernButton>
          </motion.div>
        </div>
      </ModernMainContent>

      <style>{`
        .success-details-card {
          background: rgba(52, 199, 89, 0.05);
          border: 1px solid rgba(52, 199, 89, 0.2);
        }
      `}</style>
    </motion.div>
  );
};
