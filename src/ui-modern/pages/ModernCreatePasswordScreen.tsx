import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useTools } from '@/ui/components/ActionComponent';
import { useWallet, useWalletRequest } from '@/ui/utils';
import { MIN_PASSWORD_LENGTH } from '@/ui/utils/password-utils';

import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernButton } from '../components/common';
import { ModernInput } from '../components/common/ModernInput';
import { ModernPasswordInput } from '../components/common/ModernPasswordInput';

// Custom Logo Component
const CustomLogo: React.FC<{ size?: string; color?: string }> = ({ size = '32px', color = '#ffffff' }) => (
  <svg width={size} height={size} viewBox="0 0 20.2 13.4" xmlns="http://www.w3.org/2000/svg">
    <g>
      <path
        fill={color}
        d="M5.9,9.9c-1-1.7.9-4.6,4.2-6.6,3.3-2,6.8-2.2,7.8-.5.7,1.1,0,2.7-1.3,4.3,1.9-1.9,2.7-3.9,2-5.2C17.4,0,12.9.5,8.5,3.2,4.1,5.8,1.4,9.5,2.6,11.4c1.1,1.9,5.6,1.3,10-1.3.7-.4,1.3-.9,1.9-1.3-.3.2-.6.4-.9.6-3.3,2-6.8,2.2-7.8.5Z"
      />
      <path
        fill={color}
        d="M15.5,3.1c-.3,4.2-.5,4.5-4.7,4.7,4.2.3,4.5.5,4.7,4.7.3-4.2.5-4.5,4.7-4.7-4.2-.3-4.5-.5-4.7-4.7Z"
      />
    </g>
  </svg>
);

export const ModernCreatePasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const loc = useLocation();
  const tools = useTools();

  // Parse state from location
  const params = new URLSearchParams(loc.search);
  let state: any = {};
  if (loc.state) {
    state = loc.state;
  }
  if ((params as any).size > 0) {
    params.forEach((value, key) => {
      state[key] = value;
    });
  }

  const { isNewAccount, isKeystone, fromColdWallet } = state as {
    isNewAccount: boolean;
    isKeystone: boolean;
    fromColdWallet: boolean;
  };

  const [walletName, setWalletName] = useState('My Bitcoin Wallet');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [run, loading] = useWalletRequest(wallet.boot, {
    onSuccess() {
      if (fromColdWallet) {
        navigate('CreateColdWalletScreen', { fromUnlock: true });
      } else if (isKeystone) {
        navigate('CreateKeystoneWalletScreen', { fromUnlock: true });
      } else if (isNewAccount) {
        // For new accounts, go to HD wallet creation which will handle mnemonic generation
        navigate('CreateHDWalletScreen', { isImport: false, fromUnlock: true });
      } else {
        // For import, go to HD wallet creation which will handle mnemonic import
        navigate('CreateHDWalletScreen', { isImport: true, fromUnlock: true });
      }
    },
    onError(err) {
      tools.toastError(err);
    }
  });

  // Validation
  useEffect(() => {
    if (password && password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    } else {
      setPasswordError('');
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setConfirmError('Passwords do not match');
    } else {
      setConfirmError('');
    }
  }, [password, confirmPassword]);

  const isValid =
    password.length >= MIN_PASSWORD_LENGTH && password === confirmPassword && !passwordError && !confirmError;

  const handleCreate = () => {
    if (isValid) {
      run(password.trim());
    }
  };

  const handleBack = () => {
    navigate('WelcomeScreen');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && isValid) {
      handleCreate();
    }
  };

  return (
    <div
      className="modern-ui-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'var(--modern-bg-primary)'
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '448px' }}>
        {/* Logo Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
          <CustomLogo size="72px" color="#ffffff" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '6px',
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '-0.5px'
          }}>
          Create Your Wallet
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
            marginBottom: '24px',
            lineHeight: '1.47059',
            letterSpacing: '-0.022em'
          }}>
          Choose a name and secure password for your wallet
        </motion.p>

        {/* Form */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Wallet Name Input */}
          <ModernInput
            label="Wallet Name"
            placeholder="Enter wallet name"
            value={walletName}
            onChange={setWalletName}
            autoFocus
          />

          {/* Password Input */}
          <ModernPasswordInput
            label="Password"
            placeholder="Enter a strong password"
            value={password}
            onChange={setPassword}
            error={passwordError}
            helperText={!password ? `Minimum ${MIN_PASSWORD_LENGTH} characters required` : undefined}
            showStrengthIndicator={password.length > 0}
          />

          {/* Confirm Password Input */}
          <ModernPasswordInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            error={confirmError}
            onBlur={() => {
              if (confirmPassword && password !== confirmPassword) {
                setConfirmError('Passwords do not match');
              }
            }}
          />
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <ModernButton variant="secondary" size="large" onClick={handleBack} disabled={loading} style={{ flex: 1 }}>
            Back
          </ModernButton>

          <ModernButton
            variant="primary"
            size="large"
            onClick={handleCreate}
            disabled={!isValid || loading}
            loading={loading}
            style={{ flex: 2 }}>
            Create Wallet
          </ModernButton>
        </motion.div>
      </motion.div>
    </div>
  );
};
