import { motion } from 'framer-motion';
import React from 'react';

import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernHeader } from '../components/layout/ModernHeader';

export const ModernAboutUsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleBack = () => {
    navigate('MainScreen', { openSettings: true });
  };

  const handleOpenWebsite = () => {
    window.open('https://www.universalfinance.app/', '_blank');
  };

  const handleOpenTwitter = () => {
    window.open('https://x.com/Universal_fi', '_blank');
  };

  const handleOpenTelegram = () => {
    window.open('https://t.me/theblacknode', '_blank');
  };

  const handleOpenGitHub = () => {
    window.open('https://github.com/The-Universal-BRC-20-Extension/simplicity', '_blank');
  };

  // SVG Icons
  const ShieldIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );

  const LightningIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );

  const LayersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );

  const GlobeIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );

  const TwitterIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
    </svg>
  );

  const TelegramIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );

  const GithubIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );

  const ExternalLinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );

  const features = [
    {
      icon: <ShieldIcon />,
      title: t('secure_wallet'),
      description: t('secure_wallet_desc')
    },
    {
      icon: <LightningIcon />,
      title: t('fast_transactions'),
      description: t('fast_transactions_desc')
    },
    {
      icon: <LayersIcon />,
      title: t('ordinals_support'),
      description: t('ordinals_support_desc')
    },
    {
      icon: <GlobeIcon />,
      title: t('multi_network'),
      description: t('multi_network_desc')
    }
  ];

  const socialLinks = [
    {
      name: 'Website',
      icon: <GlobeIcon />,
      action: handleOpenWebsite
    },
    {
      name: 'Twitter',
      icon: <TwitterIcon />,
      action: handleOpenTwitter
    },
    {
      name: 'Telegram',
      icon: <TelegramIcon />,
      action: handleOpenTelegram
    },
    {
      name: 'GitHub',
      icon: <GithubIcon />,
      action: handleOpenGitHub
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#121212'
      }}>
      {/* Header */}
      <ModernHeader title={t('about_us')} onBack={handleBack} showBackButton={true} />

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px'
        }}>
        {/* App Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{
            padding: '24px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '20px',
            textAlign: 'center'
          }}>
          <h2
            style={{
              fontSize: '22px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '8px',
              margin: 0
            }}>
            Universal Wallet
          </h2>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              margin: '12px 0 0 0',
              lineHeight: '1.6'
            }}>
            {t('about_us_description')}
          </p>
        </motion.div>

        {/* Version Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          style={{
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            marginBottom: '20px'
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
                {t('version')}
              </div>
              <div
                style={{
                  fontSize: '13px',
                  color: 'rgba(255, 255, 255, 0.5)'
                }}>
                {t('build_info')}
              </div>
            </div>
            <div
              style={{
                padding: '6px 12px',
                background: 'var(--modern-accent-primary)',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: '600',
                color: '#000000',
                textTransform: 'uppercase'
              }}>
              {t('latest')}
            </div>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            marginBottom: '20px'
          }}>
          {features.map((feature, index) => (
            <div
              key={index}
              style={{
                padding: '20px 16px',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px'
              }}>
              <div style={{ color: 'var(--modern-accent-primary)' }}>{feature.icon}</div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff'
                }}>
                {feature.title}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Social Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
          style={{
            marginBottom: '20px'
          }}>
          <div
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#ffffff',
              marginBottom: '12px'
            }}>
            Connect with us
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px'
            }}>
            {socialLinks.map((link, index) => (
              <motion.button
                key={index}
                onClick={link.action}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  color: '#ffffff',
                  fontSize: '14px',
                  fontWeight: '500',
                  justifyContent: 'flex-start',
                  transition: 'all 0.2s ease'
                }}>
                <div style={{ color: 'var(--modern-accent-primary)' }}>{link.icon}</div>
                <span>{link.name}</span>
                <div style={{ marginLeft: 'auto', opacity: 0.5 }}>
                  <ExternalLinkIcon />
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
          style={{
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            textAlign: 'center'
          }}>
          <div
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.5)'
            }}>
            © 2024 Universal Wallet. {t('all_rights_reserved')}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
