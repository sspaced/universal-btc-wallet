import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
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
        backgroundColor: 'var(--modern-bg-primary)',
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
              borderRadius: '12px',
              backgroundColor: 'rgba(114, 227, 173, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '2px solid rgba(114, 227, 173, 0.3)'
            }}>
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <Check size={40} color="var(--modern-accent-primary)" />
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
                fontWeight: '500',
                color: '#ffffff',
                marginBottom: '8px',
                letterSpacing: '-0.5px',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
              }}>
              {t('payment_sent')}
            </h1>
            <p
              style={{
                fontSize: '16px',
                fontWeight: '400',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.5',
                margin: 0,
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
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
                    fontWeight: '400'
                  }}>
                  Transaction ID
                </p>
                <p
                  style={{
                    fontSize: '12px',
                    fontWeight: '400',
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
            <ModernButton variant="secondary" size="large" fullWidth onClick={handleViewExplorer}>
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
          background: rgba(114, 227, 173, 0.05);
          border: 1px solid rgba(114, 227, 173, 0.2);
        }
      `}</style>
    </motion.div>
  );
};
