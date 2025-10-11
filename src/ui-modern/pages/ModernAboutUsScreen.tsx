import { motion } from 'framer-motion';
import React from 'react';

import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';

export const ModernAboutUsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleBack = () => {
    // Navigate back to the main wallet screen with settings panel open
    navigate('MainScreen', { openSettings: true });
  };

  const handleOpenWebsite = () => {
    window.open('https://unisat.io', '_blank');
  };

  const handleOpenTwitter = () => {
    window.open('https://twitter.com/unisat_wallet', '_blank');
  };

  const handleOpenDiscord = () => {
    window.open('https://discord.gg/unisat', '_blank');
  };

  const handleOpenGitHub = () => {
    window.open('https://github.com/unisat-wallet', '_blank');
  };

  const features = [
    {
      icon: '🔐',
      title: t('secure_wallet') || 'Secure Wallet',
      description: t('secure_wallet_desc') || 'Your private keys are encrypted and stored locally'
    },
    {
      icon: '⚡',
      title: t('fast_transactions') || 'Fast Transactions',
      description: t('fast_transactions_desc') || 'Quick and reliable Bitcoin transactions'
    },
    {
      icon: '🎨',
      title: t('ordinals_support') || 'Ordinals Support',
      description: t('ordinals_support_desc') || 'Full support for Bitcoin Ordinals and inscriptions'
    },
    {
      icon: '🌐',
      title: t('multi_network') || 'Multi-Network',
      description: t('multi_network_desc') || 'Support for Bitcoin mainnet and testnet'
    }
  ];

  const socialLinks = [
    {
      name: 'Website',
      icon: '🌐',
      action: handleOpenWebsite,
      color: '#72e3ad'
    },
    {
      name: 'Twitter',
      icon: '🐦',
      action: handleOpenTwitter,
      color: '#1DA1F2'
    },
    {
      name: 'Discord',
      icon: '💬',
      action: handleOpenDiscord,
      color: '#5865F2'
    },
    {
      name: 'GitHub',
      icon: '🐙',
      action: handleOpenGitHub,
      color: '#333333'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  return (
    <div
      className="modern-ui-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        backgroundColor: '#121212'
      }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: '32px',
          gap: '12px'
        }}>
        <button
          onClick={handleBack}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
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
          {t('about_us')}
        </h1>
      </motion.div>

      {/* Logo and Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: '32px',
          padding: '24px',
          backgroundColor: 'rgba(114, 227, 173, 0.08)',
          border: '1px solid rgba(114, 227, 173, 0.2)',
          borderRadius: '16px'
        }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '16px',
            backgroundColor: 'rgba(114, 227, 173, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '16px',
            fontSize: '32px'
          }}>
          🟠
        </div>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '8px',
            textAlign: 'center'
          }}>
          Unisat Wallet
        </h2>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.7)',
            textAlign: 'center',
            margin: 0,
            lineHeight: '1.5'
          }}>
          {t('about_us_description') || 'The most popular Bitcoin wallet for Ordinals and inscriptions'}
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
        {features.map((feature, index) => (
          <motion.div key={index} variants={itemVariants}>
            <div
              style={{
                padding: '20px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                textAlign: 'center'
              }}>
              <div
                style={{
                  fontSize: '32px',
                  marginBottom: '12px'
                }}>
                {feature.icon}
              </div>
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  marginBottom: '8px'
                }}>
                {feature.title}
              </h3>
              <p
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  lineHeight: '1.4',
                  margin: 0
                }}>
                {feature.description}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Version Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          padding: '16px',
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          marginBottom: '24px'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '4px'
              }}>
              {t('version') || 'Version'}
            </div>
            <div
              style={{
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
              {t('build_info') || 'Build 1.7.4'}
            </div>
          </div>
          <div
            style={{
              padding: '6px 12px',
              backgroundColor: 'rgba(114, 227, 173, 0.2)',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              color: '#72e3ad'
            }}>
            {t('latest') || 'Latest'}
          </div>
        </div>
      </motion.div>

      {/* Social Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '32px'
        }}>
        {socialLinks.map((link, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.3 }}>
            <button
              onClick={link.action}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                width: '100%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
              <div
                style={{
                  fontSize: '20px'
                }}>
                {link.icon}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}>
                {link.name}
              </div>
            </button>
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          textAlign: 'center',
          padding: '20px',
          color: 'rgba(255, 255, 255, 0.5)',
          fontSize: '12px',
          lineHeight: '1.5'
        }}>
        <div style={{ marginBottom: '8px' }}>{t('made_with_love') || 'Made with ❤️ for the Bitcoin community'}</div>
        <div>© 2024 Unisat Wallet. {t('all_rights_reserved') || 'All rights reserved.'}</div>
      </motion.div>
    </div>
  );
};
