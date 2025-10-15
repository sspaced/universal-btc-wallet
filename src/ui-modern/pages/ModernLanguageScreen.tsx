import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useWallet } from '../../ui/utils';

export const ModernLanguageScreen: React.FC = () => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const { t, locale, changeLocale } = useI18n();
  const [selectedLocale, setSelectedLocale] = useState(locale);
  const [loading, setLoading] = useState(false);

  // Update selectedLocale when locale changes
  useEffect(() => {
    setSelectedLocale(locale);
  }, [locale]);

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'zh_CN', name: '简体中文', flag: '🇨🇳' },
    { code: 'zh_TW', name: '繁體中文', flag: '🇹🇼' },
    { code: 'ja', name: '日本語', flag: '🇯🇵' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' }
  ];

  const handleBack = () => {
    // Navigate back to the main wallet screen with settings panel open
    navigate('MainScreen', { openSettings: true });
  };

  const handleLanguageSelect = async (languageCode: string) => {
    if (languageCode === selectedLocale) return;

    setLoading(true);
    try {
      setSelectedLocale(languageCode);

      // Use the proper changeLocale method from i18n context
      await changeLocale(languageCode);

      // Send message to background script for language change
      if (chrome && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage({ type: 'CHANGE_LANGUAGE', locale: languageCode });
      }

      // Navigate back instead of reloading the page
      setTimeout(() => {
        navigate('MainScreen', { openSettings: true });
      }, 500); // Small delay to ensure language change is processed
    } catch (error) {
      console.error('Failed to change language:', error);
      // Revert the selection on error
      setSelectedLocale(locale);
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
          {t('language')}
        </h1>
      </motion.div>

      {/* Language List */}
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
        {languages.map((language) => (
          <motion.div key={language.code} variants={itemVariants}>
            <div
              onClick={() => handleLanguageSelect(language.code)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                backgroundColor:
                  selectedLocale === language.code ? 'rgba(114, 227, 173, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border:
                  selectedLocale === language.code
                    ? '1px solid rgba(114, 227, 173, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (selectedLocale !== language.code) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedLocale !== language.code) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{language.flag}</span>
                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '2px'
                    }}>
                    {language.name}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                    {language.code}
                  </div>
                </div>
              </div>

              {selectedLocale === language.code && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--modern-accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
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
