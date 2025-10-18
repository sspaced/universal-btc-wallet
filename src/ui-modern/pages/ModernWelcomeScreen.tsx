import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { ConnectHardwareModal } from '../../ui/pages/Main/ConnectHardwareModal';
import { useNavigate } from '../../ui/pages/MainRoute';
import { useWallet } from '../../ui/utils';
import { ModernButton } from '../components/common';

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
      navigate('WalletSelectionScreen');
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
        backgroundColor: 'var(--modern-bg-primary)'
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
              <CustomLogo size="90px" color="#ffffff" />
            </motion.div>
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                fontSize: '22px',
                fontWeight: '700',
                marginBottom: '8px',
                color: '#ffffff',
                letterSpacing: '-0.3px',
                whiteSpace: 'nowrap'
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
            <ModernButton variant="primary" size="large" fullWidth onClick={handleCreateWallet}>
              Create New Wallet
            </ModernButton>

            <ModernButton variant="secondary" size="large" fullWidth onClick={handleImportWallet}>
              Import Existing Wallet
            </ModernButton>

            <ModernButton variant="secondary" size="large" fullWidth onClick={handleConnectHardware}>
              Connect Hardware Wallet
            </ModernButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            style={{ marginTop: '32px' }}>
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
