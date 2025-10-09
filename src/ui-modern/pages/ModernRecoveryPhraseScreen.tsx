import { motion } from 'framer-motion';
import { Check, Copy } from 'lucide-react';
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
        backgroundColor: '#242424'
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '520px' }}>
        {/* Success Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            width: '72px',
            height: '72px',
            borderRadius: '18px',
            backgroundColor: '#72e3ad',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 6px 12px rgba(114, 227, 173, 0.3)'
          }}>
          <Check style={{ width: '36px', height: '36px', color: '#ffffff' }} />
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
            title="Important Security Info"
            message="Write down your recovery phrase and store it safely. Never share it with anyone."
            variant="warning"
          />
        </motion.div>

        {/* Recovery Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginBottom: '10px' }}>
          <ModernRecoveryGrid words={words} title="Recovery Phrase" copyable />
        </motion.div>

        {/* Copy Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
          <ModernButton 
            variant="tertiary" 
            size="small" 
            onClick={handleCopyAll} 
            leftIcon={<Copy style={{ width: '16px', height: '16px', color: '#ffffff' }} />}
            style={{ maxWidth: '200px' }}>
            Copy All Words
          </ModernButton>
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
