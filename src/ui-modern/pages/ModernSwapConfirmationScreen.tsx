import { motion } from 'framer-motion';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

import { useNavigate } from '@/ui/pages/MainRoute';

import UniversalLogo from '../Logo Universal copy.svg';
import { ModernButton } from '../components/common/ModernButton';
import { ModernHeader } from '../components/layout/ModernHeader';

export const ModernSwapConfirmationScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Get swap data from navigation state
  const swapData = location.state || {};
  const fromCurrency = swapData.fromCurrency || 'BTC';
  const toCurrency = swapData.toCurrency || 'Token';
  const fromAmount = swapData.fromAmount || '0';
  const toAmount = swapData.toAmount || '0';

  return (
    <div
      style={{
        height: '100vh',
        background: '#121212',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
      {/* Header */}
      <ModernHeader title={t('swap_confirmation')} onBack={() => navigate('ModernSwapScreen')} showBackButton={true} />

      {/* Main Content */}
      <div
        style={{
          flex: 1,
          padding: '12px 16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '16px'
        }}>
        {/* Logo Universal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
          <img
            src={UniversalLogo}
            alt="Universal Logo"
            style={{
              width: '60px',
              height: '60px',
              filter: 'brightness(0) invert(1)' // Convert to white
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          style={{ textAlign: 'center' }}>
          <h1
            style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#ffffff',
              margin: '0 0 6px 0',
              letterSpacing: '-0.3px'
            }}>
            Swap Feature Coming Soon
          </h1>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              lineHeight: '1.4'
            }}>
            Permissionless swaps on Bitcoin are being developed
          </p>
        </motion.div>

        {/* Features List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            width: '100%',
            maxWidth: '320px'
          }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.8)',
              marginBottom: '10px',
              textAlign: 'center'
            }}>
            What to expect:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {[
              'Permissionless swaps on Bitcoin',
              'Native Simplicity token support',
              'Simplicity protocol integration',
              'Low fees and fast execution',
              'Non-custodial trading'
            ].map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.4 + index * 0.08 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                <div
                  style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: '#34c759',
                    flexShrink: 0
                  }}
                />
                <span
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.8)',
                    lineHeight: '1.3'
                  }}>
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          style={{
            width: '100%',
            maxWidth: '320px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
          <ModernButton variant="primary" size="large" fullWidth onClick={() => navigate('MainScreen')}>
            Back to Wallet
          </ModernButton>
        </motion.div>

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          style={{
            textAlign: 'center',
            padding: '0 20px'
          }}>
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.4)',
              lineHeight: '1.3',
              margin: 0
            }}>
            Stay tuned for updates on Bitcoin-native swap functionality
          </p>
        </motion.div>
      </div>
    </div>
  );
};
