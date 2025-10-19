import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { getAutoLockTimes } from '@/shared/constant';

import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useAutoLockTimeId } from '../../ui/state/settings/hooks';
import { useWallet } from '../../ui/utils';

export const ModernLockTimeScreen: React.FC = () => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const { t } = useI18n();
  const autoLockTimeId = useAutoLockTimeId();
  const [selectedTimeId, setSelectedTimeId] = useState(autoLockTimeId);
  const [loading, setLoading] = useState(false);

  const autoLockTimes = getAutoLockTimes();

  const handleBack = () => {
    // Navigate back to the main wallet screen with settings panel open
    navigate('MainScreen', { openSettings: true });
  };

  const handleTimeSelect = async (timeId: number) => {
    if (timeId === selectedTimeId) return;

    setLoading(true);
    try {
      await wallet.setAutoLockTimeId(timeId);
      setSelectedTimeId(timeId);
      // Show success message
      setTimeout(() => {
        navigate(-1);
      }, 500);
    } catch (error) {
      console.error('Failed to set auto lock time:', error);
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

  const getTimeIcon = (timeId: number) => {
    switch (timeId) {
      case 0:
        return '⏱️'; // 30 seconds
      case 1:
        return '⏰'; // 1 minute
      case 2:
        return '🕐'; // 3 minutes
      case 3:
        return '🕔'; // 5 minutes
      case 4:
        return '🕙'; // 10 minutes
      case 5:
        return '🕕'; // 30 minutes
      case 6:
        return '🕖'; // 1 hour
      case 7:
        return '🕗'; // 4 hours
      default:
        return '⏰';
    }
  };

  const getTimeDescription = (timeId: number) => {
    switch (timeId) {
      case 0:
        return t('very_quick_lock') || 'Very quick lock for maximum security';
      case 1:
        return t('quick_lock') || 'Quick lock for frequent use';
      case 2:
        return t('balanced_lock') || 'Balanced security and convenience';
      case 3:
        return t('moderate_lock') || 'Moderate security setting';
      case 4:
        return t('comfortable_lock') || 'Comfortable for longer sessions';
      case 5:
        return t('relaxed_lock') || 'Relaxed security setting';
      case 6:
        return t('extended_lock') || 'Extended session time';
      case 7:
        return t('long_session') || 'Long session for extended use';
      default:
        return '';
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
          {t('automatic_lock_time')}
        </h1>
      </motion.div>

      {/* Description */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        style={{
          marginBottom: '24px',
          padding: '16px',
          backgroundColor: 'rgba(114, 227, 173, 0.08)',
          border: '1px solid rgba(114, 227, 173, 0.2)',
          borderRadius: '12px'
        }}>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            lineHeight: '1.5'
          }}>
          {t('auto_lock_description') ||
            'Choose how long the wallet stays unlocked before automatically locking for security.'}
        </div>
      </motion.div>

      {/* Time Options */}
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
        {autoLockTimes.map((timeOption) => (
          <motion.div key={timeOption.id} variants={itemVariants}>
            <div
              onClick={() => handleTimeSelect(timeOption.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '20px',
                backgroundColor:
                  selectedTimeId === timeOption.id ? 'rgba(114, 227, 173, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                border:
                  selectedTimeId === timeOption.id
                    ? '1px solid rgba(114, 227, 173, 0.3)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                if (selectedTimeId !== timeOption.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedTimeId !== timeOption.id) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor:
                      selectedTimeId === timeOption.id ? 'rgba(114, 227, 173, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px'
                  }}>
                  {getTimeIcon(timeOption.id)}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '4px'
                    }}>
                    {timeOption.label}
                  </div>
                  <div
                    style={{
                      fontSize: '12px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      lineHeight: '1.4'
                    }}>
                    {getTimeDescription(timeOption.id)}
                  </div>
                </div>
              </div>

              {selectedTimeId === timeOption.id && (
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

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: 'rgba(255, 193, 7, 0.08)',
          border: '1px solid rgba(255, 193, 7, 0.2)',
          borderRadius: '12px',
          maxWidth: '600px',
          margin: '24px auto 0'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              stroke="#FFC107"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#FFC107'
            }}>
            {t('security_note') || 'Security Note'}
          </span>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.5'
          }}>
          {t('auto_lock_security_note') ||
            'Shorter lock times provide better security but may require more frequent password entry.'}
        </div>
      </motion.div>
    </div>
  );
};
