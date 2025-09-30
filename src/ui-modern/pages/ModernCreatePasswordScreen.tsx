import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { useTools } from '@/ui/components/ActionComponent';
import { useWallet, useWalletRequest } from '@/ui/utils';
import { MIN_PASSWORD_LENGTH } from '@/ui/utils/password-utils';

import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernButton } from '../components/common';
import { PlusIcon } from '../components/common/Icons';
import { ModernInput } from '../components/common/ModernInput';
import { ModernPasswordInput } from '../components/common/ModernPasswordInput';

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
        navigate('CreateHDWalletScreen', { isImport: false, fromUnlock: true });
      } else {
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
        backgroundColor: '#000000'
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
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#007aff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 6px 12px rgba(0, 122, 255, 0.3)'
          }}>
          <PlusIcon style={{ width: '28px', height: '28px', color: '#ffffff' }} />
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
            style={{ flex: 2 }}
            onKeyPress={handleKeyPress as any}>
            Create Wallet
          </ModernButton>
        </motion.div>
      </motion.div>
    </div>
  );
};
