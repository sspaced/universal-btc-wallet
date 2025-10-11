import { motion } from 'framer-motion';
import { ArrowLeft, User } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { useTools } from '../../ui/components/ActionComponent';
import { useI18n } from '../../ui/hooks/useI18n';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useSetCurrentAccountCallback } from '../../ui/state/accounts/hooks';
import { useCurrentKeyring } from '../../ui/state/keyrings/hooks';
import { useWallet } from '../../ui/utils';
import { ModernButton } from '../components/common/ModernButton';
import { ModernInput } from '../components/common/ModernInput';

export const ModernCreateAccountScreen: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const tools = useTools();
  const setCurrentAccount = useSetCurrentAccountCallback();
  const currentKeyring = useCurrentKeyring();
  const { t } = useI18n();

  const [accountName, setAccountName] = useState('');
  const [defaultName, setDefaultName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize default account name
  useEffect(() => {
    const init = async () => {
      try {
        const accountName = await wallet.getNextAlianName(currentKeyring);
        setDefaultName(accountName);
        setAccountName(accountName);
      } catch (error) {
        console.error('Failed to get default account name:', error);
        setDefaultName('Account 1');
        setAccountName('Account 1');
      }
    };
    init();
  }, [wallet, currentKeyring]);

  const handleCreateAccount = async () => {
    if (!accountName.trim()) {
      setError('Account name is required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await wallet.deriveNewAccountFromMnemonic(currentKeyring, accountName.trim());
      tools.toastSuccess(t('success'));

      const currentAccount = await wallet.getCurrentAccount();
      setCurrentAccount(currentAccount);

      navigate('MainScreen');
    } catch (error) {
      console.error('Failed to create account:', error);
      setError(error instanceof Error ? error.message : 'Failed to create account');
      tools.toastError(error instanceof Error ? error.message : 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading) {
      handleCreateAccount();
    }
  };

  const handleBack = () => {
    navigate('#back');
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
        backgroundColor: '#121212'
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '448px' }}>
        {/* Header with Back Button */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '32px'
          }}>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}>
            <ArrowLeft size={20} color="#ffffff" />
          </motion.button>

          <div>
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '700',
                color: '#ffffff',
                margin: 0,
                letterSpacing: '-0.5px'
              }}>
              Add Account
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                margin: '4px 0 0 0',
                fontWeight: '400'
              }}>
              Create a new account for your wallet
            </p>
          </div>
        </motion.div>

        {/* Account Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
            <User size={32} color="#ffffff" />
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <ModernInput
            label="Account Name"
            value={accountName}
            onChange={(value) => {
              setAccountName(value);
              setError('');
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter account name"
            disabled={isLoading}
            error={error}
            autoFocus
          />
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            padding: '16px',
            marginTop: '24px',
            marginBottom: '32px'
          }}>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              lineHeight: '1.5'
            }}>
            Your new account will be derived from your existing wallet seed phrase. This ensures maximum security while
            allowing you to manage multiple accounts.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
          <ModernButton
            variant="primary"
            size="large"
            fullWidth
            onClick={handleCreateAccount}
            disabled={isLoading || !accountName.trim()}
            loading={isLoading}>
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </ModernButton>

          <ModernButton variant="tertiary" size="large" fullWidth onClick={handleBack} disabled={isLoading}>
            Cancel
          </ModernButton>
        </motion.div>
      </motion.div>
    </div>
  );
};
