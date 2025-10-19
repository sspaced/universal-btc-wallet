import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import React, { useEffect } from 'react';

import { useTools } from '@/ui/components/ActionComponent';
import { ContextData, TabType, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';
import { copyToClipboard, useWallet } from '@/ui/utils';

import { ModernButton } from '../components/common';
import { ModernRecoveryGrid } from '../components/common/ModernRecoveryGrid';
import { ModernSecurityWarning } from '../components/common/ModernSecurityWarning';

export interface ModernRecoveryPhraseScreenProps {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}

export const ModernRecoveryPhraseScreen: React.FC<ModernRecoveryPhraseScreenProps> = ({
  contextData,
  updateContextData
}) => {
  const wallet = useWallet();
  const tools = useTools();

  useEffect(() => {
    const init = async () => {
      const _mnemonics = await wallet.generatePreMnemonic();
      updateContextData({
        mnemonics: _mnemonics
      });
    };
    init();
  }, []);

  const handleCopyAll = async () => {
    try {
      await copyToClipboard(contextData.mnemonics);
      tools.toastSuccess('Recovery phrase copied to clipboard');
    } catch (error) {
      tools.toastError('Failed to copy to clipboard');
    }
  };

  const handleContinue = () => {
    updateContextData({
      tabType: TabType.STEP2,
      step1Completed: true
    });
  };

  const words = contextData.mnemonics.split(' ');

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
        style={{ width: '100%', maxWidth: '520px' }}>
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 200,
            damping: 15,
            delay: 0.2
          }}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '12px',
            backgroundColor: 'rgba(114, 227, 173, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: 'none'
          }}>
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
            <Check size={40} color="var(--modern-accent-primary)" />
          </motion.div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: '18px',
            fontWeight: '700',
            marginBottom: '6px',
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '-0.3px',
            whiteSpace: 'nowrap'
          }}>
          Wallet Created Successfully!
        </motion.h1>

        {/* Security Warning */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{ marginBottom: '12px' }}>
          <ModernSecurityWarning
            message="Write down your recovery phrase and store it safely. Never share it with anyone."
            variant="warning"
          />
        </motion.div>

        {/* Recovery Grid with integrated Copy Button */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginBottom: '10px' }}>
          <ModernRecoveryGrid
            words={words}
            title="Recovery Phrase"
            copyable
            showCopyButton={true}
            onCopyAll={handleCopyAll}
          />
        </motion.div>

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}>
          <ModernButton variant="primary" size="medium" onClick={handleContinue} fullWidth>
            Continue to Next Step
          </ModernButton>
        </motion.div>
      </motion.div>
    </div>
  );
};
