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
import { ModernErrorMessage } from '../components/common/ModernErrorMessage';
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
        // Vérification de sécurité pour s'assurer que accountName est une string
        const safeAccountName = typeof accountName === 'string' ? accountName : 'Account 1';
        setDefaultName(safeAccountName);
        setAccountName(safeAccountName);
      } catch (error) {
        console.error('Failed to get default account name:', error);
        setDefaultName('Account 1');
        setAccountName('Account 1');
      }
    };
    init();
  }, [wallet, currentKeyring]);

  const handleCreateAccount = async () => {
    // Vérification de sécurité pour s'assurer que accountName est une string
    if (!accountName || typeof accountName !== 'string' || !accountName.trim()) {
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

  const handleImportAccount = async () => {
    // Navigate to wallet selection screen to choose between seed phrase or private key
    navigate('WalletSelectionScreen');
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
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--modern-bg-primary)',
        overflow: 'hidden'
      }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
        {/* Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--modern-bg-secondary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
          <ArrowLeft size={20} color="#ffffff" />
        </motion.button>

        {/* Title */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.3px'
          }}>
          Add Account
        </motion.h1>

        {/* Spacer */}
        <div style={{ width: '40px' }} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px 20px',
          overflow: 'auto'
        }}>
        <div style={{ width: '100%', maxWidth: '448px' }}>
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
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              alignItems: 'center',
              width: '100%'
            }}>
            <div style={{ width: '100%', maxWidth: '320px' }}>
              <ModernInput
                label="Account Name"
                value={accountName}
                onChange={(e) => {
                  setAccountName(e.target.value);
                  setError('');
                }}
                onKeyPress={handleKeyPress}
                placeholder="Enter account name"
                disabled={isLoading}
                error={!!error}
                autoFocus
                fullWidth
              />
            </div>

            {/* Error Message Display */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%', maxWidth: '320px' }}>
                <ModernErrorMessage message={error} type="error" showIcon={true} onDismiss={() => setError('')} />
              </motion.div>
            )}
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              marginTop: '32px'
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

            <ModernButton variant="secondary" size="large" fullWidth onClick={handleImportAccount} disabled={isLoading}>
              Import Account
            </ModernButton>

            <ModernButton variant="secondary" size="large" fullWidth onClick={handleBack} disabled={isLoading}>
              Cancel
            </ModernButton>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
