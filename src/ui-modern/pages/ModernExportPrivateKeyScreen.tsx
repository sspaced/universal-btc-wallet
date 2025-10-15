import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { Account } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { copyToClipboard, useWallet } from '@/ui/utils';

import { useI18n } from '../../ui/hooks/useI18n';
import { useLocationState } from '../../ui/utils';
import { BackIcon, KeyIcon } from '../components/common/Icons';
import { ModernButton } from '../components/common/ModernButton';
import { ModernInput } from '../components/common/ModernInput';

type Status = '' | 'error' | 'warning' | undefined;

export const ModernExportPrivateKeyScreen: React.FC = () => {
  const { account } = useLocationState<{ account: Account }>();
  const { t } = useI18n();
  const wallet = useWallet();
  const tools = useTools();

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [privateKey, setPrivateKey] = useState({ hex: '', wif: '' });
  const [status, setStatus] = useState<Status>('');
  const [error, setError] = useState('');

  const btnClick = async () => {
    try {
      const _res = await wallet.getPrivateKey(password, account);
      setPrivateKey(_res);
    } catch (e) {
      setStatus('error');
      setError((e as any).message);
    }
  };

  const handleOnKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ('Enter' == e.key) {
      btnClick();
    }
  };

  useEffect(() => {
    setDisabled(true);
    if (password) {
      setDisabled(false);
      setStatus('');
      setError('');
    }
  }, [password]);

  function copy(str: string) {
    copyToClipboard(str);
    tools.toastSuccess(t('copied'));
  }

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#121212',
        overflow: 'hidden'
      }}>
      {/* Header avec animation */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          background: 'rgba(0, 0, 0, 0.95)',
          backdropFilter: 'blur(20px)'
        }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.go(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            cursor: 'pointer',
            marginRight: '12px'
          }}>
          <BackIcon style={{ width: '18px', height: '18px', color: '#ffffff' }} />
        </motion.button>

        <h1
          style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0,
            flex: 1,
            letterSpacing: '-0.5px'
          }}>
          Export Private Key
        </h1>

        <KeyIcon style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.6)' }} />
      </motion.div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
        {privateKey.wif === '' ? (
          <>
            {/* Warning Box avec animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                padding: '10px 12px',
                background: 'rgba(255, 59, 48, 0.12)',
                border: '1.5px solid rgba(255, 59, 48, 0.4)',
                borderRadius: '10px',
                backdropFilter: 'blur(10px)'
              }}>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#ff3b30',
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.2px'
                }}>
                If you lose your private key, your assets will be lost forever.
              </motion.p>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                style={{
                  fontSize: '11px',
                  fontWeight: '600',
                  color: '#ff3b30',
                  margin: '0 0 4px 0',
                  letterSpacing: '-0.2px'
                }}>
                Never share this key with anyone. Anyone with it can access your funds.
              </motion.p>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                style={{ fontSize: '11px', fontWeight: '600', color: '#ff3b30', margin: 0, letterSpacing: '-0.2px' }}>
                This key is only stored locally in your browser.
              </motion.p>
            </motion.div>

            {/* Password Input */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              style={{ width: '100%' }}>
              <ModernInput
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleOnKeyUp}
                autoFocus
                fullWidth
              />
            </motion.div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  background: 'rgba(255, 59, 48, 0.1)',
                  border: '1px solid rgba(255, 59, 48, 0.2)',
                  borderRadius: '8px',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                <p style={{ color: '#FF3B30', fontSize: '14px', margin: 0 }}>{error}</p>
              </motion.div>
            )}

            {/* Show Private Key Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              style={{ width: '100%' }}>
              <ModernButton
                variant="primary"
                size="large"
                fullWidth
                disabled={disabled}
                onClick={btnClick}
                style={{
                  height: '48px',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                Show Private Key
              </ModernButton>
            </motion.div>
          </>
        ) : (
          /* Private Key Display */
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px'
            }}>
            {/* WIF Format */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: 0
                  }}>
                  WIF Format
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copy(privateKey.wif)}
                  style={{
                    background: 'var(--modern-accent-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                  Copy
                </motion.button>
              </div>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  fontSize: '12px',
                  color: '#ffffff',
                  wordBreak: 'break-all',
                  lineHeight: '1.4'
                }}>
                {privateKey.wif}
              </div>
            </div>

            {/* Hex Format */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px'
              }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '12px'
                }}>
                <h3
                  style={{
                    color: '#ffffff',
                    fontSize: '16px',
                    fontWeight: '600',
                    margin: 0
                  }}>
                  Hex Format
                </h3>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => copy(privateKey.hex)}
                  style={{
                    background: 'var(--modern-accent-primary)',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '6px 12px',
                    color: '#000000',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                  Copy
                </motion.button>
              </div>
              <div
                style={{
                  background: 'rgba(0, 0, 0, 0.3)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                  fontSize: '12px',
                  color: '#ffffff',
                  wordBreak: 'break-all',
                  lineHeight: '1.4'
                }}>
                {privateKey.hex}
              </div>
            </div>

            {/* Final Warning */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              style={{
                background: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.2)',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'center'
              }}>
              <p
                style={{
                  color: '#FF3B30',
                  fontSize: '14px',
                  fontWeight: '500',
                  margin: 0,
                  lineHeight: '1.4'
                }}>
                Keep your private key safe and never share it with anyone
              </p>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
