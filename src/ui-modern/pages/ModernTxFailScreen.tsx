import { motion } from 'framer-motion';
import React from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useLocationState } from '@/ui/utils';

import { ModernButton } from '../components/common/ModernButton';
import { ModernCard } from '../components/common/ModernCard';
import { ModernHeader } from '../components/layout/ModernHeader';
import { ModernMainContent } from '../components/layout/ModernMainContent';

interface LocationState {
  error: string;
}

export const ModernTxFailScreen: React.FC = () => {
  const { error } = useLocationState<LocationState>();
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('#back');
  };

  const handleRetry = () => {
    navigate('#back');
  };

  const handleGoHome = () => {
    navigate('MainScreen');
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
      <ModernHeader title={t('transaction_failed')} onBack={handleBack} showBackButton={true} />

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
          {/* Error Animation */}
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
              backgroundColor: 'rgba(255, 59, 48, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '2px solid rgba(255, 59, 48, 0.3)'
            }}>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              style={{
                width: '40px',
                height: '40px'
              }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%' }}>
                <motion.path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="#FF3B30"
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

          {/* Error Message */}
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
              {t('payment_failed')}
            </h1>
            <p
              style={{
                fontSize: '16px',
                color: 'rgba(255, 255, 255, 0.7)',
                lineHeight: '1.5',
                margin: 0
              }}>
              {t('transaction_could_not_be_completed')}
            </p>
          </motion.div>

          {/* Error Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            style={{ width: '100%', maxWidth: '400px' }}>
            <ModernCard padding="lg" className="error-details-card">
              <div style={{ textAlign: 'center' }}>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '12px',
                    fontWeight: '500'
                  }}>
                  {t('error_details')}
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    color: 'rgba(255, 59, 48, 0.9)',
                    lineHeight: '1.5',
                    margin: 0,
                    wordBreak: 'break-word'
                  }}>
                  {error}
                </p>
              </div>
            </ModernCard>
          </motion.div>

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            style={{
              width: '100%',
              maxWidth: '400px',
              marginTop: '24px',
              textAlign: 'center'
            }}>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.5',
                margin: 0
              }}>
              {t('transaction_failed_help_text')}
            </p>
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
            <ModernButton variant="primary" size="large" fullWidth onClick={handleRetry}>
              {t('try_again')}
            </ModernButton>

            <ModernButton variant="secondary" size="large" fullWidth onClick={handleGoHome}>
              {t('go_to_home')}
            </ModernButton>
          </motion.div>
        </div>
      </ModernMainContent>

      <style>{`
        .error-details-card {
          background: rgba(255, 59, 48, 0.05);
          border: 1px solid rgba(255, 59, 48, 0.2);
        }
      `}</style>
    </motion.div>
  );
};
