import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { ConnectHardwareModal } from '../../ui/pages/Main/ConnectHardwareModal';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useWallet } from '../../ui/utils';
import { ModernButton, ModernLogo } from '../components/common';
import { HardwareIcon, ImportIcon, KeyIcon, LockIcon, PlusIcon, ShieldIcon } from '../components/common/Icons';

// Helper Components
const FeatureItem: React.FC<{ icon: React.ComponentType<{ className: string }>; text: string }> = ({
  icon: Icon,
  text
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '80px' }}>
    <div
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)'
      }}>
      <Icon style={{ width: '16px', height: '16px', color: '#ffffff' }} />
    </div>
    <span
      style={{
        fontSize: '11px',
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.7)',
        letterSpacing: '-0.08px',
        textAlign: 'center',
        lineHeight: '1.3',
        minHeight: '28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
      {text}
    </span>
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
        style={{ width: '100%' }}>
        <div style={{ maxWidth: '448px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px',
                backgroundColor: '#007aff',
                boxShadow: '0 6px 12px rgba(0, 122, 255, 0.3)'
              }}>
              <ModernLogo size="large" color="white" />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                fontSize: '28px',
                fontWeight: '700',
                marginBottom: '8px',
                color: '#ffffff',
                letterSpacing: '-0.5px'
              }}>
              Welcome to Universal Wallet
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{
                fontSize: '15px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.47059',
                letterSpacing: '-0.022em'
              }}>
              Your secure Bitcoin wallet
            </motion.p>
          </div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
                gap: '32px',
                marginBottom: '20px'
              }}>
              <FeatureItem icon={ShieldIcon} text="Enterprise Security" />
              <FeatureItem icon={KeyIcon} text="Your Keys" />
              <FeatureItem icon={LockIcon} text="Private by Design" />
            </div>
            <p
              style={{
                fontSize: '13px',
                textAlign: 'center',
                color: 'rgba(255, 255, 255, 0.5)',
                letterSpacing: '-0.08px',
                fontWeight: '400'
              }}>
              Secured with AES-256-GCM encryption
            </p>
          </motion.div>
        </div>
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
