import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { useTools } from '@/ui/components/ActionComponent';

import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useWallet } from '../../ui/utils';
import { ModernButton } from '../components/common/ModernButton';

export const ModernChangePasswordScreen: React.FC = () => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const { t } = useI18n();
  const tools = useTools();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    current?: string;
    new?: string;
    confirm?: string;
  }>({});

  const handleBack = () => {
    // Navigate back to the main wallet screen with settings panel open
    navigate('MainScreen', { openSettings: true });
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!currentPassword) {
      newErrors.current = t('current_password_required') || 'Current password is required';
    }

    if (!newPassword) {
      newErrors.new = t('new_password_required') || 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.new = t('password_too_short') || 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      newErrors.confirm = t('confirm_password_required') || 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirm = t('passwords_do_not_match') || 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await wallet.changePassword(currentPassword, newPassword);
      tools.toastSuccess(t('password_changed_successfully') || 'Password changed successfully');
      navigate('MainScreen');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      if (error.message?.includes('incorrect')) {
        setErrors({ current: t('incorrect_current_password') || 'Incorrect current password' });
      } else {
        tools.toastError(error.message || t('failed_to_change_password') || 'Failed to change password');
      }
    } finally {
      setLoading(false);
    }
  };

  const isFormValid =
    currentPassword && newPassword && confirmPassword && newPassword === confirmPassword && newPassword.length >= 8;

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
          marginBottom: '32px',
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
          {t('change_password')}
        </h1>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          width: '100%',
          maxWidth: '400px',
          margin: '0 auto'
        }}>
        {/* Current Password */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '8px'
            }}>
            {t('current_password') || 'Current Password'}
          </label>
          <input
            type="password"
            placeholder={t('enter_current_password') || 'Enter current password'}
            value={currentPassword}
            onChange={(e) => {
              setCurrentPassword(e.target.value);
              if (errors.current) {
                setErrors((prev) => ({ ...prev, current: undefined }));
              }
            }}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#ffffff',
              backgroundColor: 'var(--modern-bg-secondary)',
              border: errors.current
                ? 'var(--modern-border-width) solid rgba(255, 59, 48, 0.5)'
                : 'var(--modern-border-width) solid var(--modern-border-color)',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!errors.current) {
                e.target.style.borderColor = 'var(--modern-border-focus)';
                e.target.style.backgroundColor = 'var(--modern-bg-tertiary)';
              }
            }}
            onBlur={(e) => {
              if (!errors.current) {
                e.target.style.borderColor = 'var(--modern-border-color)';
                e.target.style.backgroundColor = 'var(--modern-bg-secondary)';
              }
            }}
          />
          {errors.current && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#FF3B30',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#FF3B30" strokeWidth="2" />
                <path d="M12 8v4" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="#FF3B30" />
              </svg>
              {errors.current}
            </motion.div>
          )}
        </div>

        {/* New Password */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '8px'
            }}>
            {t('new_password') || 'New Password'}
          </label>
          <input
            type="password"
            placeholder={t('enter_new_password') || 'Enter new password'}
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (errors.new) {
                setErrors((prev) => ({ ...prev, new: undefined }));
              }
            }}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#ffffff',
              backgroundColor: 'var(--modern-bg-secondary)',
              border: errors.new
                ? 'var(--modern-border-width) solid rgba(255, 59, 48, 0.5)'
                : 'var(--modern-border-width) solid var(--modern-border-color)',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!errors.new) {
                e.target.style.borderColor = 'var(--modern-border-focus)';
                e.target.style.backgroundColor = 'var(--modern-bg-tertiary)';
              }
            }}
            onBlur={(e) => {
              if (!errors.new) {
                e.target.style.borderColor = 'var(--modern-border-color)';
                e.target.style.backgroundColor = 'var(--modern-bg-secondary)';
              }
            }}
          />
          {errors.new && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#FF3B30',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#FF3B30" strokeWidth="2" />
                <path d="M12 8v4" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="#FF3B30" />
              </svg>
              {errors.new}
            </motion.div>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '8px'
            }}>
            {t('confirm_password') || 'Confirm Password'}
          </label>
          <input
            type="password"
            placeholder={t('confirm_new_password') || 'Confirm new password'}
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (errors.confirm) {
                setErrors((prev) => ({ ...prev, confirm: undefined }));
              }
            }}
            style={{
              width: '100%',
              padding: '16px',
              fontSize: '16px',
              fontWeight: '500',
              color: '#ffffff',
              backgroundColor: 'var(--modern-bg-secondary)',
              border: errors.confirm
                ? 'var(--modern-border-width) solid rgba(255, 59, 48, 0.5)'
                : 'var(--modern-border-width) solid var(--modern-border-color)',
              borderRadius: '12px',
              outline: 'none',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              if (!errors.confirm) {
                e.target.style.borderColor = 'var(--modern-border-focus)';
                e.target.style.backgroundColor = 'var(--modern-bg-tertiary)';
              }
            }}
            onBlur={(e) => {
              if (!errors.confirm) {
                e.target.style.borderColor = 'var(--modern-border-color)';
                e.target.style.backgroundColor = 'var(--modern-bg-secondary)';
              }
            }}
          />
          {errors.confirm && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#FF3B30',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#FF3B30" strokeWidth="2" />
                <path d="M12 8v4" stroke="#FF3B30" strokeWidth="2" strokeLinecap="round" />
                <circle cx="12" cy="16" r="1" fill="#FF3B30" />
              </svg>
              {errors.confirm}
            </motion.div>
          )}
        </div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginTop: '8px' }}>
          <ModernButton
            variant="primary"
            size="large"
            fullWidth
            onClick={handleSubmit}
            disabled={!isFormValid}
            loading={loading}>
            {loading ? t('changing_password') || 'Changing Password...' : t('change_password') || 'Change Password'}
          </ModernButton>
        </motion.div>
      </motion.div>

      {/* Security Info */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          marginTop: '32px',
          padding: '16px',
          backgroundColor: 'rgba(114, 227, 173, 0.08)',
          border: '1px solid rgba(114, 227, 173, 0.2)',
          borderRadius: '12px',
          maxWidth: '400px',
          margin: '32px auto 0'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
              stroke="var(--modern-accent-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M9 12l2 2 4-4"
              stroke="var(--modern-accent-primary)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--modern-accent-primary)'
            }}>
            {t('security_tip') || 'Security Tip'}
          </span>
        </div>
        <div
          style={{
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.7)',
            lineHeight: '1.5'
          }}>
          {t('password_security_tip') ||
            'Use a strong password with at least 8 characters, including numbers and special characters.'}
        </div>
      </motion.div>
    </div>
  );
};
