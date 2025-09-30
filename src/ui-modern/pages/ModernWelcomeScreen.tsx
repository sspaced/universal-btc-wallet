import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { ConnectHardwareModal } from '../../ui/pages/Main/ConnectHardwareModal';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useWallet } from '../../ui/utils';
import { ModernButton, ModernCard, ModernLogo } from '../components/common';
import { HardwareIcon, ImportIcon, KeyIcon, LockIcon, PlusIcon, ShieldIcon } from '../components/common/Icons';

// Helper Components
const FeatureItem: React.FC<{ icon: React.ComponentType<{ className: string }>; text: string }> = ({
  icon: Icon,
  text
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
    <div
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--apple-gray-5)'
      }}>
      <Icon style={{ width: '16px', height: '16px', color: 'var(--apple-blue)' }} />
    </div>
    <span style={{ fontSize: '12px', fontWeight: '500', color: 'var(--apple-secondary-label)' }}>{text}</span>
  </div>
);

export const ModernWelcomeScreen: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const [connectHardwareModalVisible, setConnectHardwareModalVisible] = useState(false);

  const handleCreateWallet = async () => {
    const isBooted = await wallet.isBooted();
    if (isBooted) {
      navigate('CreateHDWalletScreen', { isImport: false });
    } else {
      navigate('CreatePasswordScreen', { isNewAccount: true });
    }
  };

  const handleImportWallet = async () => {
    const isBooted = await wallet.isBooted();
    if (isBooted) {
      navigate('CreateHDWalletScreen', { isImport: true });
    } else {
      navigate('CreatePasswordScreen', { isNewAccount: false });
    }
  };

  const handleConnectHardware = () => {
    setConnectHardwareModalVisible(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'var(--apple-system-background)'
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}>
        <ModernCard padding="xl" style={{ maxWidth: '448px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                backgroundColor: 'var(--apple-blue)'
              }}>
              <ModernLogo size="large" color="white" />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                fontSize: '24px',
                fontWeight: 'bold',
                marginBottom: '8px',
                color: 'var(--apple-label)'
              }}>
              Welcome to Universal Wallet
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ color: 'var(--apple-secondary-label)' }}>
              Your secure Bitcoin wallet with Apple-inspired design
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <ModernButton
              variant="primary"
              size="large"
              fullWidth
              leftIcon={<PlusIcon style={{ width: '20px', height: '20px' }} />}
              onClick={handleCreateWallet}>
              Create New Wallet
            </ModernButton>

            <ModernButton
              variant="secondary"
              size="large"
              fullWidth
              leftIcon={<ImportIcon style={{ width: '20px', height: '20px' }} />}
              onClick={handleImportWallet}>
              Import Existing Wallet
            </ModernButton>

            <ModernButton
              variant="tertiary"
              size="large"
              fullWidth
              leftIcon={<HardwareIcon style={{ width: '20px', height: '20px' }} />}
              onClick={handleConnectHardware}>
              Connect Hardware Wallet
            </ModernButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{ marginTop: '32px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '16px'
              }}>
              <FeatureItem icon={ShieldIcon} text="Enterprise Security" />
              <FeatureItem icon={KeyIcon} text="Your Keys" />
              <FeatureItem icon={LockIcon} text="Private by Design" />
            </div>
            <p
              style={{
                fontSize: '12px',
                textAlign: 'center',
                color: 'var(--apple-tertiary-label)'
              }}>
              🔒 Secured with AES-256-GCM encryption
            </p>
          </motion.div>
        </ModernCard>
      </motion.div>

      {connectHardwareModalVisible && (
        <ConnectHardwareModal
          onClose={() => {
            setConnectHardwareModalVisible(false);
          }}
        />
      )}
    </div>
  );
};
