import React from 'react';

import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';

export const ModernAboutUsScreen: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleBack = () => {
    navigate('MainScreen', { openSettings: true });
  };

  const handleOpenWebsite = () => {
    window.open('https://www.blacknode.co/', '_blank');
  };

  const handleOpenTwitter = () => {
    window.open('https://x.com/theblacknode', '_blank');
  };

  const handleOpenTelegram = () => {
    window.open('https://t.me/theblacknode', '_blank');
  };

  const handleOpenGitHub = () => {
    window.open('https://github.com/The-Universal-BRC-20-Extension/simplicity', '_blank');
  };

  const features = [
    {
      icon: '🛡️',
      title: t('secure_wallet'),
      description: t('secure_wallet_desc')
    },
    {
      icon: '⚡',
      title: t('fast_transactions'),
      description: t('fast_transactions_desc')
    },
    {
      icon: '🎨',
      title: t('ordinals_support'),
      description: t('ordinals_support_desc')
    },
    {
      icon: '🌐',
      title: t('multi_network'),
      description: t('multi_network_desc')
    }
  ];

  const socialLinks = [
    {
      name: 'Website',
      icon: '🌐',
      action: handleOpenWebsite
    },
    {
      name: 'Twitter',
      icon: '🐦',
      action: handleOpenTwitter
    },
    {
      name: 'Telegram',
      icon: '💬',
      action: handleOpenTelegram
    },
    {
      name: 'GitHub',
      icon: '🐙',
      action: handleOpenGitHub
    }
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        padding: '16px',
        backgroundColor: '#1a1a1a'
      }}>
      {/* Header */}
      <div
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
            borderRadius: '8px',
            backgroundColor: '#2a2a2a',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#ffffff',
            fontSize: '18px'
          }}>
          ←
        </button>
        <h1
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0
          }}>
          {t('about_us')}
        </h1>
      </div>

      {/* Logo and Title */}
      <div
        style={{
          padding: '24px',
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          marginBottom: '24px',
          textAlign: 'center',
          border: '1px solid #333333'
        }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#ffffff',
            marginBottom: '8px'
          }}>
          Universal Wallet
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0,
            lineHeight: '1.5'
          }}>
          {t('about_us_description')}
        </p>
      </div>

      {/* Version Info */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          marginBottom: '24px',
          border: '1px solid #333333'
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
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.6)'
              }}>
              {t('build_info')}
            </div>
          </div>
          <div
            style={{
              padding: '4px 8px',
              backgroundColor: '#4CAF50',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: '600',
              color: '#ffffff',
              textTransform: 'uppercase'
            }}>
            {t('latest')}
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '12px',
          marginBottom: '24px'
        }}>
        {socialLinks.map((link, index) => (
          <button
            key={index}
            onClick={link.action}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '16px',
              backgroundColor: '#2a2a2a',
              border: '1px solid #333333',
              borderRadius: '12px',
              cursor: 'pointer',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '500',
              justifyContent: 'flex-start'
            }}>
            <span style={{ fontSize: '18px' }}>{link.icon}</span>
            <span>{link.name}</span>
          </button>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '16px',
          backgroundColor: '#2a2a2a',
          borderRadius: '12px',
          textAlign: 'center',
          border: '1px solid #333333'
        }}>
        <div
          style={{
            marginBottom: '8px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)'
          }}>
          {t('made_with_love')}
        </div>
        <div
          style={{
            fontSize: '10px',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>
          © 2024 Universal Wallet. {t('all_rights_reserved')}
        </div>
      </div>
    </div>
  );
};
