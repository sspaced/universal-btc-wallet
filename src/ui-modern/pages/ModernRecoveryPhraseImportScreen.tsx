import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect, useMemo, useState } from 'react';

import { OW_HD_PATH } from '@/shared/constant';
import { AddressType, RestoreWalletType } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import {
    ContextData,
    TabType,
    UpdateContextDataParams,
    WordsType
} from '@/ui/pages/Account/createHDWalletComponents/types';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useCreateAccountCallback } from '@/ui/state/global/hooks';
import { validateMnemonic } from '@/ui/utils/bitcoin-utils';

import { ModernButton } from '../components/common';

export interface ModernRecoveryPhraseImportScreenProps {
  contextData: ContextData;
  updateContextData: (params: UpdateContextDataParams) => void;
}

const getWords12Item = () => ({
  key: WordsType.WORDS_12,
  label: '12 words',
  count: 12
});

const getWords24Item = () => ({
  key: WordsType.WORDS_24,
  label: '24 words',
  count: 24
});

export const ModernRecoveryPhraseImportScreen: React.FC<ModernRecoveryPhraseImportScreenProps> = ({
  contextData,
  updateContextData
}) => {
  const tools = useTools();
  const navigate = useNavigate();
  const createAccount = useCreateAccountCallback();

  const wordsItems = useMemo(() => {
    if (contextData.restoreWalletType === RestoreWalletType.OW) {
      return [getWords12Item()];
    } else if (contextData.restoreWalletType === RestoreWalletType.XVERSE) {
      return [getWords12Item()];
    } else {
      return [getWords12Item(), getWords24Item()];
    }
  }, [contextData.restoreWalletType]);

  const [keys, setKeys] = useState<Array<string>>(new Array(wordsItems[contextData.wordsType].count).fill(''));
  const [disabled, setDisabled] = useState(true);

  const handleEventPaste = (event: React.ClipboardEvent, index: number) => {
    const copyText = event.clipboardData?.getData('text/plain');
    const textArr = copyText.trim().split(' ');
    const newKeys = [...keys];
    if (textArr) {
      for (let i = 0; i < keys.length - index; i++) {
        if (textArr.length === i) {
          break;
        }
        newKeys[index + i] = textArr[i];
      }
      setKeys(newKeys);
    }
    event.preventDefault();
  };

  const onChange = (value: string, index: number) => {
    const newKeys = [...keys];
    newKeys.splice(index, 1, value.trim());
    setKeys(newKeys);
  };

  useEffect(() => {
    setDisabled(true);

    const hasEmpty = keys.filter((key) => key === '').length > 0;
    if (hasEmpty) {
      return;
    }

    const mnemonic = keys.join(' ');
    if (!validateMnemonic(mnemonic)) {
      return;
    }

    setDisabled(false);
  }, [keys]);

  const onNext = async () => {
    try {
      const mnemonics = keys.join(' ');
      if (contextData.restoreWalletType === RestoreWalletType.OW) {
        await createAccount(mnemonics, OW_HD_PATH, '', AddressType.P2TR, 1);
        navigate('MainScreen');
      } else {
        updateContextData({ mnemonics, tabType: TabType.STEP3 });
      }
    } catch (e) {
      tools.toastError((e as any).message);
    }
  };

  const handleWordsTypeChange = (wordsType: WordsType) => {
    updateContextData({ wordsType });
    setKeys(new Array(wordsItems[wordsType].count).fill(''));
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
          onClick={() => updateContextData({ tabType: TabType.STEP1 })}
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
          Secret Recovery Phrase
        </h1>
      </motion.div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 24px'
        }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(255, 255, 255, 0.7)',
              margin: '0 0 20px 0',
              lineHeight: '1.6',
              textAlign: 'center',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
            }}>
            Import an existing wallet with your secret recovery phrase
          </p>

          {/* Words Type Selector */}
          {wordsItems.length > 1 && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
              {wordsItems.map((item) => (
                <motion.button
                  key={item.key}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleWordsTypeChange(item.key)}
                  style={{
                    padding: '10px 24px',
                    borderRadius: '10px',
                    border:
                      contextData.wordsType === item.key
                        ? '1px solid var(--modern-accent-primary)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                    background:
                      contextData.wordsType === item.key
                        ? 'rgba(var(--modern-accent-primary-rgb), 0.1)'
                        : 'var(--modern-bg-secondary)',
                    color:
                      contextData.wordsType === item.key ? 'var(--modern-accent-primary)' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily:
                      '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}>
                  {item.label}
                </motion.button>
              ))}
            </div>
          )}

          {/* Words Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '6px',
              maxWidth: '340px',
              margin: '0 auto 24px auto'
            }}>
            {keys.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.02 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'var(--modern-bg-secondary)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '6px 10px'
                }}>
                <span
                  style={{
                    fontSize: '12px',
                    color: value.trim() ? 'var(--modern-accent-primary)' : 'rgba(255, 255, 255, 0.5)',
                    fontWeight: '500',
                    minWidth: '20px',
                    transition: 'color 0.3s ease'
                  }}>
                  {index + 1}.
                </span>
                <input
                  type="text"
                  value={value}
                  onChange={(e) => onChange(e.target.value, index)}
                  onPaste={(e) => handleEventPaste(e, index)}
                  placeholder="word"
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'white',
                    fontSize: '13px',
                    fontWeight: '500',
                    width: '100%',
                    minWidth: 0
                  }}
                />
              </motion.div>
            ))}
          </div>

          {/* Continue Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            style={{
              maxWidth: '400px',
              margin: '0 auto'
            }}>
            <ModernButton variant="primary" size="large" fullWidth disabled={disabled} onClick={onNext}>
              Continue
            </ModernButton>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
