import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { WalletKeyring } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
import { copyToClipboard, useLocationState, useWallet } from '@/ui/utils';

import { EyeIcon, EyeOffIcon } from '../components/common/ModernIcons';

type Status = '' | 'error' | 'warning' | undefined;

export default function ModernExportMnemonicsScreen() {
  const { keyring } = useLocationState<{ keyring: WalletKeyring }>();
  const { t } = useI18n();

  const [password, setPassword] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [mnemonic, setMnemonic] = useState('');
  const [status, setStatus] = useState<Status>('');
  const [error, setError] = useState('');
  const [passphrase, setPassphrase] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const wallet = useWallet();

  const btnClick = async () => {
    try {
      const { mnemonic, hdPath, passphrase } = await wallet.getMnemonics(password, keyring);
      setMnemonic(mnemonic);
      setPassphrase(passphrase);
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

  const handleCopy = (str: string) => {
    copyToClipboard(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const words = mnemonic.split(' ');
  const pathName = ADDRESS_TYPES.find((v) => v.hdPath === keyring.hdPath)?.name || 'custom';

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#000000',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          position: 'sticky',
          top: 0,
          background: '#000000',
          zIndex: 100,
        }}
      >
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => window.history.go(-1)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#007aff',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            padding: '8px 0',
          }}
        >
          ← Back
        </motion.button>
        <h1
          style={{
            flex: 1,
            textAlign: 'center',
            fontSize: '18px',
            fontWeight: '600',
            color: '#ffffff',
            margin: 0,
            marginRight: '60px',
          }}
        >
          Secret Recovery Phrase
        </h1>
      </div>

      {/* Content */}
      <div
        className="hide-scrollbar"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 20px',
        }}
      >
        {mnemonic === '' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Warning Card */}
            <div
              style={{
                background: 'rgba(255, 59, 48, 0.1)',
                border: '1px solid rgba(255, 59, 48, 0.3)',
                borderRadius: '16px',
                padding: '20px',
                marginBottom: '24px',
              }}
            >
              <div style={{ marginBottom: '16px' }}>
                <div
                  style={{
                    fontSize: '32px',
                    marginBottom: '12px',
                    textAlign: 'center',
                  }}
                >
                  ⚠️
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ff3b30',
                    lineHeight: '1.5',
                    margin: '0 0 12px 0',
                  }}
                >
                  If you lose your secret recovery phrase, your assets cannot be recovered.
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ff3b30',
                    lineHeight: '1.5',
                    margin: '0 0 12px 0',
                  }}
                >
                  If you share the secret recovery phrase to others, your assets will be stolen.
                </p>
                <p
                  style={{
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#ff3b30',
                    lineHeight: '1.5',
                    margin: 0,
                  }}
                >
                  Secret recovery phrase is only stored in your browser, we cannot recover it for you.
                </p>
              </div>
            </div>

            {/* Info Text */}
            <p
              style={{
                fontSize: '15px',
                fontWeight: '500',
                color: '#ff9500',
                textAlign: 'center',
                margin: '0 0 32px 0',
                lineHeight: '1.5',
              }}
            >
              Please make sure you have read the security tips above
            </p>

            {/* Password Input */}
            <div style={{ marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.7)',
                  marginBottom: '8px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={handleOnKeyUp}
                  autoFocus={true}
                  placeholder="Enter your password"
                  style={{
                    width: '100%',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: error ? '1px solid #ff3b30' : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    padding: '14px 48px 14px 16px',
                    fontSize: '16px',
                    color: '#ffffff',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => {
                    e.target.style.border = '1px solid #007aff';
                  }}
                  onBlur={(e) => {
                    e.target.style.border = error ? '1px solid #ff3b30' : '1px solid rgba(255, 255, 255, 0.1)';
                  }}
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'rgba(255, 255, 255, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '8px',
                  }}
                >
                  {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                </motion.button>
              </div>
              {error && (
                <p
                  style={{
                    fontSize: '13px',
                    color: '#ff3b30',
                    marginTop: '8px',
                    marginBottom: 0,
                  }}
                >
                  {error}
                </p>
              )}
            </div>

            {/* Show Button */}
            <motion.button
              whileTap={{ scale: disabled ? 1 : 0.98 }}
              onClick={btnClick}
              disabled={disabled}
              style={{
                width: '100%',
                background: disabled ? 'rgba(255, 255, 255, 0.1)' : '#007aff',
                border: 'none',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: disabled ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: disabled ? 0.5 : 1,
              }}
            >
              Show Secret Recovery Phrase
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Warning Text */}
            <p
              style={{
                fontSize: '15px',
                fontWeight: '600',
                color: '#ff9500',
                textAlign: 'center',
                margin: '0 0 32px 0',
                lineHeight: '1.5',
              }}
            >
              This phrase is the only way to recover your wallet. Keep it safe!
            </p>

            {/* Mnemonic Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                marginBottom: '24px',
              }}
            >
              {words.map((word, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: 'rgba(255, 255, 255, 0.5)',
                      width: '32px',
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}.
                  </span>
                  <div
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '15px',
                        fontWeight: '500',
                        color: '#ffffff',
                        userSelect: 'text',
                      }}
                    >
                      {word}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Copy Button */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCopy(mnemonic)}
              style={{
                width: '100%',
                background: copied ? 'rgba(52, 199, 89, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: '600',
                color: copied ? '#34c759' : '#ffffff',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                marginBottom: '24px',
              }}
            >
              {copied ? '✓ Copied!' : 'Copy to Clipboard'}
            </motion.button>

            {/* Advanced Options */}
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '20px',
              }}
            >
              <h3
                style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#ffffff',
                  margin: '0 0 16px 0',
                }}
              >
                Advanced Options
              </h3>
              <div style={{ marginBottom: passphrase ? '12px' : 0 }}>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    margin: '0 0 4px 0',
                  }}
                >
                  Derivation Path
                </p>
                <motion.p
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleCopy(keyring.hdPath)}
                  style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#007aff',
                    margin: 0,
                    cursor: 'pointer',
                    userSelect: 'text',
                  }}
                >
                  {keyring.hdPath}/0 ({pathName})
                </motion.p>
              </div>
              {passphrase && (
                <div>
                  <p
                    style={{
                      fontSize: '13px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      margin: '0 0 4px 0',
                    }}
                  >
                    Passphrase
                  </p>
                  <p
                    style={{
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#ffffff',
                      margin: 0,
                      userSelect: 'text',
                    }}
                  >
                    {passphrase}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Hide scrollbar style */}
      <style>{`
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
