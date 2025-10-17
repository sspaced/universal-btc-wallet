import { motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { WalletKeyring } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { copyToClipboard, useLocationState, useWallet } from '@/ui/utils';

import { BackIcon, CopyIcon, KeyIcon } from '../components/common/Icons';

type Status = '' | 'error' | 'warning' | undefined;

export const ModernExportMnemonicsScreen: React.FC = () => {
  const { keyring } = useLocationState<{ keyring: WalletKeyring }>();
  const { t } = useI18n();
  const wallet = useWallet();
  const tools = useTools();

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [mnemonic, setMnemonic] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [error, setError] = useState('');
  const [passphrase, setPassphrase] = useState('');

  const btnClick = async () => {
    try {
      const result = await wallet.getMnemonics(password, keyring);
      setMnemonic(result.mnemonic);
      setPassphrase(result.passphrase);
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

  const words = mnemonic.split(' ');
  const pathName = ADDRESS_TYPES.find((v) => v.hdPath === keyring.hdPath)?.name || 'custom';

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
          Secret Recovery Phrase
        </h1>

        <KeyIcon style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.6)' }} />
      </motion.div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px'
        }}>
        {mnemonic == '' ? (
          // Password Screen
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
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
                If you lose your secret recovery phrase, your assets will be lost forever.
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
                Never share this phrase with anyone. Anyone with it can access your funds.
              </motion.p>
              <motion.p
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.4 }}
                style={{ fontSize: '11px', fontWeight: '600', color: '#ff3b30', margin: 0, letterSpacing: '-0.2px' }}>
                This phrase is only stored locally in your browser.
              </motion.p>
            </motion.div>

            {/* Password Input avec animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={handleOnKeyUp}
                placeholder="Enter password"
                autoFocus={true}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  fontSize: '14px',
                  color: '#ffffff',
                  background: 'var(--modern-bg-secondary)',
                  border: 'var(--modern-border-width) solid var(--modern-border-color)',
                  borderRadius: '10px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  letterSpacing: '0.1em',
                  transition: 'all 0.3s ease'
                }}
              />
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: '13px',
                    color: '#ff3b30',
                    marginTop: '10px',
                    margin: '10px 0 0 0',
                    letterSpacing: '-0.2px'
                  }}>
                  {error}
                </motion.p>
              )}
            </motion.div>

            {/* Button avec animation */}
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.98 } : {}}
              disabled={disabled}
              onClick={btnClick}
              style={{
                width: '100%',
                padding: '11px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#000000',
                background: disabled
                  ? 'rgba(114, 227, 173, 0.3)'
                  : 'linear-gradient(135deg, var(--modern-accent-primary) 0%, #5dd39a 100%)',
                border: 'none',
                borderRadius: '10px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                opacity: disabled ? 0.6 : 1,
                boxShadow: 'none',
                letterSpacing: '-0.3px',
                transition: 'all 0.3s ease'
              }}>
              Show Secret Recovery Phrase
            </motion.button>
          </motion.div>
        ) : (
          // Mnemonic Display Screen
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* Warning avec animation */}
            <motion.div
              initial={{ y: 20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{
                textAlign: 'center',
                padding: '8px 12px',
                background: 'rgba(255, 204, 0, 0.12)',
                border: '1.5px solid rgba(255, 204, 0, 0.4)',
                borderRadius: '8px',
                backdropFilter: 'blur(10px)'
              }}>
              <p style={{ fontSize: '12px', fontWeight: '600', color: '#ffcc00', margin: 0, letterSpacing: '-0.3px' }}>
                This phrase is the only way to recover your wallet. Store it safely!
              </p>
            </motion.div>

            {/* Words Grid avec animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '11px',
                padding: '11px',
                backdropFilter: 'blur(20px)'
              }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '7px',
                  marginBottom: '11px'
                }}>
                {words.map((word, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.03, duration: 0.4 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '7px',
                      padding: '7px 9px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      borderRadius: '7px'
                    }}>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        color: 'rgba(255, 255, 255, 0.4)',
                        minWidth: '21px'
                      }}>
                      {index + 1}.
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: '600',
                        color: '#ffffff',
                        flex: 1,
                        userSelect: 'text',
                        letterSpacing: '-0.2px'
                      }}>
                      {word}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Copy Button avec animation */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => copy(mnemonic)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(114, 227, 173, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.25)';
                }}
                style={{
                  width: '100%',
                  padding: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  letterSpacing: '-0.3px',
                  transition: 'all 0.3s ease'
                }}>
                <CopyIcon style={{ width: '14px', height: '14px' }} />
                Copy All Words
              </motion.button>
            </motion.div>

            {/* Advanced Options avec animation */}
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.5 }}
              style={{
                background: 'rgba(255, 255, 255, 0.06)',
                border: 'none',
                borderRadius: '11px',
                padding: '11px',
                backdropFilter: 'blur(20px)'
              }}>
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: '700',
                  color: '#ffffff',
                  margin: '0 0 9px 0',
                  letterSpacing: '-0.5px'
                }}>
                Advanced Options
              </h3>

              {/* Derivation Path */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 11px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '7px',
                  marginBottom: passphrase ? '7px' : 0,
                  transition: 'all 0.2s ease'
                }}>
                <div>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#ffffff',
                      marginBottom: '3px',
                      letterSpacing: '-0.2px'
                    }}>
                    Derivation Path
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'rgba(255, 255, 255, 0.6)',
                      userSelect: 'text',
                      letterSpacing: '-0.1px'
                    }}>
                    {keyring.hdPath}/0 ({pathName})
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => copy(keyring.hdPath)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '7px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}>
                  <CopyIcon style={{ width: '13px', height: '13px', color: 'rgba(255, 255, 255, 0.8)' }} />
                </motion.button>
              </motion.div>

              {/* Passphrase */}
              {passphrase && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 11px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    borderRadius: '7px',
                    transition: 'all 0.2s ease'
                  }}>
                  <div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '3px',
                        letterSpacing: '-0.2px'
                      }}>
                      Passphrase
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'rgba(255, 255, 255, 0.6)',
                        userSelect: 'text',
                        letterSpacing: '-0.1px'
                      }}>
                      {passphrase}
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => copy(passphrase)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '30px',
                      height: '30px',
                      borderRadius: '7px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}>
                    <CopyIcon style={{ width: '13px', height: '13px', color: 'rgba(255, 255, 255, 0.8)' }} />
                  </motion.button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
