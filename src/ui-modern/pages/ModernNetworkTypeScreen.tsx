import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { CHAINS } from '@/shared/constant';
import { useTools } from '@/ui/components/ActionComponent';

import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useReloadAccounts } from '../../ui/state/accounts/hooks';
import { useChainType, useChangeChainTypeCallback } from '../../ui/state/settings/hooks';

export const ModernNetworkTypeScreen: React.FC = () => {
  const { t } = useI18n();
  const chainType = useChainType();
  const changeChainType = useChangeChainTypeCallback();
  const reloadAccounts = useReloadAccounts();
  const tools = useTools();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    // Navigate back to the main wallet screen with settings panel open
    navigate('MainScreen', { openSettings: true });
  };

  const handleNetworkSelect = async (networkEnum: any) => {
    if (networkEnum === chainType) return;

    setLoading(true);
    try {
      await changeChainType(networkEnum);
      reloadAccounts();
      navigate('MainScreen');
      tools.toastSuccess(`Changed to ${CHAINS.find((c) => c.enum === networkEnum)?.label}`);
    } catch (error) {
      console.error('Failed to change network:', error);
      tools.toastError('Failed to change network');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const getNetworkIcon = (chain: any) => {
    if (chain.disable) return '🚫';
    if (chain.enum === chainType) return '✅';
    return '🌐';
  };

  const getNetworkDescription = (chain: any) => {
    if (chain.disable) return 'This network is not available';
    if (chain.enum === chainType) return 'Currently selected';
    return 'Click to select this network';
  };

  return (
    <div
      className="modern-ui-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        backgroundColor: 'var(--modern-bg-primary)'
      }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '24px',
          gap: '12px'
        }}>
        <button
          onClick={handleBack}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'var(--modern-bg-secondary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--modern-bg-tertiary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--modern-bg-secondary)';
          }}>
          <span style={{ color: '#ffffff', fontSize: '18px' }}>←</span>
        </button>
        <h1
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '-0.5px',
            margin: 0
          }}>
          {t('select_network') || 'Select Network'}
        </h1>
      </motion.div>

      {/* Network List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
        {CHAINS.filter((chain) => !chain.isFractal).map((chain, index) => (
          <motion.div key={index} variants={itemVariants}>
            <div
              onClick={() => {
                if (chain.disable) {
                  tools.toastError('This network is not available');
                  return;
                }
                handleNetworkSelect(chain.enum);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor:
                  chain.enum === chainType
                    ? 'rgba(114, 227, 173, 0.1)'
                    : chain.disable
                    ? 'rgba(255, 255, 255, 0.02)'
                    : 'rgba(255, 255, 255, 0.05)',
                border:
                  chain.enum === chainType
                    ? '1px solid rgba(114, 227, 173, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: chain.disable ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                opacity: chain.disable ? 0.5 : 1
              }}
              onMouseEnter={(e) => {
                if (!chain.disable && chain.enum !== chainType) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!chain.disable && chain.enum !== chainType) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    backgroundImage: `url(${chain.icon})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}>
                  {!chain.icon && getNetworkIcon(chain)}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: chain.disable ? 'rgba(255, 255, 255, 0.4)' : '#ffffff',
                      marginBottom: '4px'
                    }}>
                    {chain.label}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: chain.disable ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.6)',
                      lineHeight: '1.4'
                    }}>
                    {getNetworkDescription(chain)}
                  </div>
                </div>
              </div>

              {chain.enum === chainType && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--modern-accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="#121212"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </motion.div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
