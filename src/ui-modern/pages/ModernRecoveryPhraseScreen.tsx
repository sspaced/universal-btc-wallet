import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { useTools } from '@/ui/components/ActionComponent';
import { ContextData, TabType, UpdateContextDataParams } from '@/ui/pages/Account/createHDWalletComponents/types';
import { copyToClipboard, useWallet } from '@/ui/utils';

import { ModernButton } from '../components/common';
import { CheckIcon } from '../components/common/Icons';
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
  const [checked, setChecked] = useState(false);
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

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setChecked(val);
    updateContextData({ step1Completed: val });
  };

  const handleCopyAll = async () => {
    try {
      await copyToClipboard(contextData.mnemonics);
      tools.toastSuccess('Recovery phrase copied to clipboard');
    } catch (error) {
      tools.toastError('Failed to copy to clipboard');
    }
  };

  const handleContinue = () => {
    if (checked) {
      updateContextData({
        tabType: TabType.STEP2
      });
    }
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
        backgroundColor: '#000000'
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
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            backgroundColor: '#34c759',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 6px 12px rgba(52, 199, 89, 0.3)'
          }}>
          <CheckIcon style={{ width: '32px', height: '32px', color: '#ffffff' }} />
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
          Wallet Created Successfully!
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
          Your recovery phrase has been generated. Keep it safe!
        </motion.p>

        {/* Recovery Grid */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginBottom: '20px' }}>
          <ModernRecoveryGrid words={words} title="Recovery Phrase" copyable />
        </motion.div>

        {/* Copy Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ marginBottom: '20px' }}>
          <ModernButton variant="tertiary" size="medium" onClick={handleCopyAll} fullWidth>
            📋 Copy All Words
          </ModernButton>
        </motion.div>

        {/* Security Warning */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ marginBottom: '20px' }}>
          <ModernSecurityWarning
            title="Important Security Info"
            message="Write down your recovery phrase and store it safely. Never share it with anyone or store it digitally."
            variant="warning"
          />
        </motion.div>

        {/* Checkbox */}
        <motion.label
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '12px',
            padding: '16px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
            cursor: 'pointer',
            marginBottom: '20px',
            border: checked ? '1.5px solid rgba(0, 122, 255, 0.5)' : '1.5px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 0.2s'
          }}>
          <input
            type="checkbox"
            checked={checked}
            onChange={handleCheckboxChange}
            style={{
              width: '20px',
              height: '20px',
              marginTop: '2px',
              cursor: 'pointer',
              accentColor: '#007aff'
            }}
          />
          <span
            style={{
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              letterSpacing: '-0.08px',
              flex: 1
            }}>
            I've saved my recovery phrase securely and understand that losing it means losing access to my wallet
          </span>
        </motion.label>

        {/* Continue Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}>
          <ModernButton variant="primary" size="large" onClick={handleContinue} disabled={!checked} fullWidth>
            Continue to Next Step
          </ModernButton>
        </motion.div>
      </motion.div>
    </div>
  );
};
