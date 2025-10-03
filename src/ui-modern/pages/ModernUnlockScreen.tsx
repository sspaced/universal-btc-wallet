import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { useTools } from '@/ui/components/ActionComponent';
import { useIsUnlocked, useUnlockCallback } from '@/ui/state/global/hooks';
import { getUiType, useWallet } from '@/ui/utils';

import { ModernButton } from '../components/common/ModernButton';
import { useNavigate } from '../../ui/pages/MainRoute';

export const ModernUnlockScreen: React.FC = () => {
  const wallet = useWallet();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const UIType = getUiType();
  const isInNotification = UIType.isNotification;
  const unlock = useUnlockCallback();
  const tools = useTools();
  const isUnlocked = useIsUnlocked();

  useEffect(() => {
    if (isUnlocked) {
      navigate('MainScreen');
    }
  }, [isUnlocked, navigate]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const btnClick = async () => {
    try {
      if (loading) {
        return;
      }
      setLoading(true);
      setError('');
      await unlock(password);

      if (!isInNotification) {
        const hasVault = await wallet.hasVault();
        if (!hasVault) {
          navigate('WelcomeScreen');
          return;
        } else {
          navigate('MainScreen');
          return;
        }
      }
    } catch (e) {
      console.log(e);
      setError('Incorrect password. Please try again.');
      tools.toastError('Incorrect password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!disabled && 'Enter' == e.key) {
      btnClick();
    }
  };

  useEffect(() => {
    if (password && loading === false) {
      setDisabled(false);
    } else {
      setDisabled(true);
    }
  }, [password, loading]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: '#000000',
        padding: '20px',
        overflow: 'hidden'
      }}>
      {/* Lock Icon Animation */}
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: 'spring',
          stiffness: 200,
          damping: 20,
          duration: 0.8
        }}
        style={{
          marginBottom: '48px'
        }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="11" width="14" height="10" rx="2" stroke="rgba(255, 255, 255, 0.9)" strokeWidth="2" />
            <path
              d="M8 11V7a4 4 0 0 1 8 0v4"
              stroke="rgba(255, 255, 255, 0.9)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="16" r="1.5" fill="rgba(255, 255, 255, 0.9)" />
          </svg>
        </div>
      </motion.div>

      {/* Welcome Text */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
        <h1
          style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#ffffff',
            marginBottom: '8px',
            letterSpacing: '-0.5px'
          }}>
          Welcome Back
        </h1>
        <p
          style={{
            fontSize: '16px',
            color: 'rgba(255, 255, 255, 0.6)',
            margin: 0
          }}>
          Enter your password to continue
        </p>
      </motion.div>

      {/* Password Input */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{
          width: '100%',
          maxWidth: '360px'
        }}>
        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: 'rgba(255, 255, 255, 0.9)',
              marginBottom: '8px'
            }}>
            Password
          </label>
          <div style={{ position: 'relative' }}>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyUp={handleOnKeyUp}
              autoFocus
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '500',
                color: '#ffffff',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: error
                  ? '2px solid rgba(255, 59, 48, 0.5)'
                  : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                outline: 'none',
                transition: 'all 0.2s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                if (!error) {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }
              }}
              onBlur={(e) => {
                if (!error) {
                  e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                }
              }}
            />
            {error && (
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
                {error}
              </motion.div>
            )}
          </div>
        </div>

        {/* Unlock Button */}
        <ModernButton
          variant="primary"
          size="large"
          fullWidth
          onClick={btnClick}
          disabled={disabled}
          loading={loading}>
          {loading ? 'Unlocking...' : 'Unlock Wallet'}
        </ModernButton>
      </motion.div>

      {/* Subtle Decorative Elements */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 1 }}
        style={{
          position: 'absolute',
          top: '10%',
          right: '10%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.03) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
        style={{
          position: 'absolute',
          bottom: '20%',
          left: '5%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.02) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />
    </div>
  );
};
