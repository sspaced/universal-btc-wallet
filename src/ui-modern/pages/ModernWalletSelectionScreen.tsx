import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import React, { useState } from 'react';

import { RestoreWalletType } from '@/shared/types';

import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernButton } from '../components/common/ModernButton';
import { ModernWalletCard } from '../components/common/ModernWalletCard';

interface ModernWalletSelectionScreenProps {
  onWalletSelect?: (walletType: RestoreWalletType) => void;
}

export const ModernWalletSelectionScreen: React.FC<ModernWalletSelectionScreenProps> = ({ onWalletSelect }) => {
  const navigate = useNavigate();
  const [selectedWallet, setSelectedWallet] = useState<RestoreWalletType | null>(null);

  const wallets = [
    {
      type: RestoreWalletType.UNISAT,
      name: 'UniSat Wallet',
      description: 'UniSat wallet format'
    },
    {
      type: RestoreWalletType.SPARROW,
      name: 'Sparrow Wallet',
      description: 'Sparrow wallet format'
    },
    {
      type: RestoreWalletType.XVERSE,
      name: 'Xverse Wallet',
      description: 'Xverse wallet format'
    },
    {
      type: RestoreWalletType.OW,
      name: 'Ordinals Wallet',
      description: 'Ordinals wallet format'
    },
    {
      type: RestoreWalletType.OTHERS,
      name: 'Others',
      description: 'Other wallet formats'
    }
  ];

  const handleWalletSelect = (walletType: RestoreWalletType) => {
    setSelectedWallet(walletType);
  };

  const handleImportMethod = (method: 'seed' | 'privateKey') => {
    if (selectedWallet === null) return;

    if (onWalletSelect) {
      onWalletSelect(selectedWallet);
    } else {
      if (method === 'seed') {
        // Navigate to seed phrase import (existing flow)
        navigate('CreateHDWalletScreen', {
          isImport: true,
          fromUnlock: false,
          restoreWalletType: selectedWallet
        });
      } else {
        // Navigate to private key import (existing flow)
        navigate('CreateSimpleWalletScreen', {
          restoreWalletType: selectedWallet
        });
      }
    }
  };

  const handleBack = () => {
    navigate('#back');
  };

  return (
    <div
      className="modern-ui-container"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--modern-bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
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
            marginRight: '12px'
          }}>
          <ArrowLeft size={24} color="var(--modern-accent-primary)" />
        </motion.button>

        <h1
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'white',
            margin: 0,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
          }}>
          Choose a Wallet
        </h1>
      </motion.div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '12px 20px',
          justifyContent: 'space-between'
        }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              marginBottom: '12px'
            }}>
            <p
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.7)',
                margin: 0,
                lineHeight: '1.4',
                fontFamily:
                  '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
              }}>
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
              flex: 1,
              alignContent: 'start'
            }}>
            {wallets.map((wallet, index) => (
              <ModernWalletCard
                key={wallet.type}
                walletName={wallet.name}
                description={wallet.description}
                onClick={() => handleWalletSelect(wallet.type)}
                index={index}
                isSelected={selectedWallet === wallet.type}
              />
            ))}
          </div>
        </div>

        {/* Import Method Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          style={{
            display: 'flex',
            gap: '8px',
            width: '100%'
          }}>
          <ModernButton
            variant="secondary"
            size="large"
            fullWidth
            disabled={selectedWallet === null}
            onClick={() => handleImportMethod('seed')}
            style={{
              background: selectedWallet !== null ? 'var(--modern-bg-secondary)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: selectedWallet !== null ? 'white' : 'rgba(255, 255, 255, 0.3)',
              cursor: selectedWallet !== null ? 'pointer' : 'not-allowed',
              height: '44px',
              fontSize: '16px',
              borderRadius: '12px'
            }}>
            Seed Phrase
          </ModernButton>

          <ModernButton
            variant="secondary"
            size="large"
            fullWidth
            disabled={selectedWallet === null}
            onClick={() => handleImportMethod('privateKey')}
            style={{
              background: selectedWallet !== null ? 'var(--modern-bg-secondary)' : 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: selectedWallet !== null ? 'white' : 'rgba(255, 255, 255, 0.3)',
              cursor: selectedWallet !== null ? 'pointer' : 'not-allowed',
              height: '44px',
              fontSize: '16px',
              borderRadius: '12px'
            }}>
            Private Key
          </ModernButton>
        </motion.div>
      </div>
    </div>
  );
};
