import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { RestoreWalletType } from '@/shared/types';
import { ModernWalletCard } from '../components/common/ModernWalletCard';
import { BackIcon } from '../components/common/Icons';

interface ModernWalletSelectionScreenProps {
  onWalletSelect?: (walletType: RestoreWalletType) => void;
}

export const ModernWalletSelectionScreen: React.FC<ModernWalletSelectionScreenProps> = ({ onWalletSelect }) => {
  const navigate = useNavigate();

  const wallets = [
    {
      type: RestoreWalletType.UNISAT,
      name: 'UniSat Wallet',
      description: 'UniSat wallet format',
    },
    {
      type: RestoreWalletType.SPARROW,
      name: 'Sparrow Wallet',
      description: 'Sparrow wallet format',
    },
    {
      type: RestoreWalletType.XVERSE,
      name: 'Xverse Wallet',
      description: 'Xverse wallet format',
    },
    {
      type: RestoreWalletType.OW,
      name: 'Ordinals Wallet',
      description: 'Ordinals wallet format',
    },
    {
      type: RestoreWalletType.OTHERS,
      name: 'Others',
      description: 'Other wallet formats',
    },
  ];

  const handleWalletSelect = (walletType: RestoreWalletType) => {
    if (onWalletSelect) {
      onWalletSelect(walletType);
    } else {
      // Navigate to CreateHDWallet with selected wallet type
      navigate('/account/create-hd-wallet', {
        state: {
          isImport: true,
          fromUnlock: false,
          restoreWalletType: walletType,
        },
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: '#000000',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            marginRight: '12px',
          }}
        >
          <BackIcon
            style={{
              width: '24px',
              height: '24px',
              color: '#007aff',
            }}
          />
        </motion.button>

        <h1
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'white',
            margin: 0,
          }}
        >
          Choose a Wallet
        </h1>
      </motion.div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 24px',
        }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{
            marginBottom: '12px',
          }}
        >
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            Select the wallet type you want to restore. Each wallet uses a different address derivation path.
          </p>
        </motion.div>

        {/* Wallet Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            maxWidth: '400px',
          }}
        >
          {wallets.map((wallet, index) => (
            <ModernWalletCard
              key={wallet.type}
              walletName={wallet.name}
              description={wallet.description}
              onClick={() => handleWalletSelect(wallet.type)}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
