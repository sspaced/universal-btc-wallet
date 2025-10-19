import { motion } from 'framer-motion';
import React from 'react';

import { ModernButton } from './common/ModernButton';
import { ModernCard } from './common/ModernCard';
import { ModernMainContent } from './layout/ModernMainContent';

interface ModernErrorBoundaryProps {
  onBack?: () => void;
  onRefresh?: () => void;
  error?: Error;
}

// Fonction de traduction autonome pour l'ErrorBoundary
const getTranslation = (key: string): string => {
  const translations: Record<string, string> = {
    oops_something_went_wrong: 'Oops! Something went wrong.',
    try_going_back_or_refreshing: 'Try going back or refreshing.',
    go_back: 'Go Back',
    refresh_page: 'Refresh Page'
  };

  return translations[key] || key;
};

export const ModernErrorBoundary: React.FC<ModernErrorBoundaryProps> = ({ onBack, onRefresh, error }) => {
  const handleBack = () => {
    try {
      window.location.href = 'index.html';
    } catch (e) {
      window.location.replace('index.html');
    }
  };

  const handleRefresh = () => {
    try {
      window.location.reload();
    } catch (e) {
      window.location.href = 'index.html';
    }
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
      <ModernMainContent>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
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
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 59, 48, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              border: '2px solid rgba(255, 59, 48, 0.2)'
            }}>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              style={{
                width: '48px',
                height: '48px'
              }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: '100%', height: '100%' }}>
                <motion.path
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                  stroke="#FF3B30"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                />
              </svg>
            </motion.div>
          </motion.div>

          {/* Error Message */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                marginBottom: '8px',
                letterSpacing: '-0.5px'
              }}>
              {getTranslation('oops_something_went_wrong')}
            </h1>
            <p
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.5',
                margin: 0,
                maxWidth: '360px'
              }}>
              {getTranslation('try_going_back_or_refreshing')}
            </p>
          </motion.div>

          {/* Error Details Card (if error provided) */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
              style={{ width: '100%', maxWidth: '360px', marginBottom: '20px' }}>
              <ModernCard padding="md" className="error-details-card">
                <div style={{ textAlign: 'center' }}>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      marginBottom: '8px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                    Error Details
                  </p>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 59, 48, 0.9)',
                      lineHeight: '1.5',
                      margin: 0,
                      wordBreak: 'break-word'
                    }}>
                    {error.message || 'An unexpected error occurred'}
                  </p>
                </div>
              </ModernCard>
            </motion.div>
          )}

          {/* Help Text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1 }}
            style={{
              width: '100%',
              maxWidth: '360px',
              marginBottom: '28px',
              textAlign: 'center'
            }}>
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.5)',
                lineHeight: '1.5',
                margin: 0
              }}>
              If this problem persists, please try refreshing the page or contact support.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            style={{
              width: '100%',
              maxWidth: '360px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
            <ModernButton variant="primary" size="medium" fullWidth onClick={onBack || handleBack}>
              {getTranslation('go_back')}
            </ModernButton>

            <ModernButton variant="secondary" size="medium" fullWidth onClick={onRefresh || handleRefresh}>
              {getTranslation('refresh_page')}
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
