import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { TrashIcon } from './ModernIcons';

interface ModernRemoveWalletModalProps {
  visible: boolean;
  walletName: string;
  walletAddress: string;
  isLastKeyring: boolean;
  isLastAccountInKeyring: boolean; // True if it's the last account in this keyring
  totalAccountsInWallet: number; // Total number of accounts across all keyrings
  onConfirm: () => void;
  onCancel: () => void;
}

export const ModernRemoveWalletModal: React.FC<ModernRemoveWalletModalProps> = ({
  visible,
  walletName,
  walletAddress,
  isLastKeyring,
  isLastAccountInKeyring,
  totalAccountsInWallet,
  onConfirm,
  onCancel
}) => {
  // Can't remove if it's the last account in the last keyring
  const cannotRemove = isLastKeyring && isLastAccountInKeyring;

  // Will remove entire keyring if it's the last account in the keyring
  const willRemoveKeyring = isLastAccountInKeyring;

  return (
    <AnimatePresence>
      {visible && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10001,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCancel}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(8px)'
            }}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'relative',
              width: '90%',
              maxWidth: '400px',
              background: 'rgba(28, 28, 30, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.6)'
            }}>
            {/* Icon */}
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: cannotRemove
                  ? 'linear-gradient(135deg, rgba(255, 149, 0, 0.2) 0%, rgba(255, 69, 58, 0.2) 100%)'
                  : 'linear-gradient(135deg, rgba(255, 59, 48, 0.2) 0%, rgba(255, 45, 85, 0.2) 100%)',
                border: cannotRemove ? '2px solid rgba(255, 149, 0, 0.5)' : '2px solid rgba(255, 59, 48, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px'
              }}>
              <TrashIcon size={24} color={cannotRemove ? '#FF9500' : '#ff3b30'} />
            </div>

            {/* Title */}
            <h2
              style={{
                margin: '0 0 12px',
                fontSize: '22px',
                fontWeight: '700',
                color: '#ffffff',
                textAlign: 'center',
                letterSpacing: '-0.5px'
              }}>
              {cannotRemove ? 'Cannot Remove Account' : willRemoveKeyring ? 'Remove Keyring?' : 'Remove Account?'}
            </h2>

            {/* Description */}
            <div
              style={{
                marginBottom: '24px'
              }}>
              {cannotRemove ? (
                <p
                  style={{
                    margin: '0 0 16px',
                    fontSize: '15px',
                    lineHeight: '1.5',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textAlign: 'center'
                  }}>
                  You cannot remove your last account. You must have at least one account to use the extension.
                </p>
              ) : (
                <>
                  {/* Wallet Info Card */}
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      marginBottom: '16px'
                    }}>
                    <div
                      style={{
                        fontSize: '16px',
                        fontWeight: '600',
                        color: '#ffffff',
                        marginBottom: '8px',
                        textAlign: 'center'
                      }}>
                      {walletName}
                    </div>
                    <div
                      style={{
                        fontSize: '13px',
                        fontFamily: 'monospace',
                        color: 'rgba(255, 255, 255, 0.5)',
                        textAlign: 'center',
                        wordBreak: 'break-all'
                      }}>
                      {walletAddress.substring(0, 12)}...
                      {walletAddress.substring(walletAddress.length - 12)}
                    </div>
                  </div>

                  {/* Info Message for Keyring deletion */}
                  {willRemoveKeyring && (
                    <div
                      style={{
                        background: 'rgba(94, 158, 214, 0.15)',
                        border: '1px solid rgba(94, 158, 214, 0.3)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                        marginBottom: '12px'
                      }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '14px',
                          lineHeight: '1.5',
                          color: '#5E9ED6',
                          fontWeight: '500'
                        }}>
                        ℹ️ This is the last account in this keyring. The entire keyring will be removed.
                      </p>
                    </div>
                  )}

                  {/* Warning Messages */}
                  <div
                    style={{
                      background: 'rgba(255, 149, 0, 0.1)',
                      border: '1px solid rgba(255, 149, 0, 0.3)',
                      borderRadius: '10px',
                      padding: '12px 16px',
                      marginBottom: '12px'
                    }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#FF9500',
                        fontWeight: '500'
                      }}>
                      ⚠️ Please ensure you have backed up your{' '}
                      {willRemoveKeyring ? 'recovery phrase or private key' : 'private key'}
                    </p>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 59, 48, 0.1)',
                      border: '1px solid rgba(255, 59, 48, 0.3)',
                      borderRadius: '10px',
                      padding: '12px 16px'
                    }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: '1.5',
                        color: '#ff3b30',
                        fontWeight: '500'
                      }}>
                      🚨 This action is irreversible and cannot be undone
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div
              style={{
                display: 'flex',
                gap: '12px',
                flexDirection: cannotRemove ? 'column' : 'row'
              }}>
              {!cannotRemove && (
                <>
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onCancel}
                    style={{
                      flex: 1,
                      background: 'rgba(255, 255, 255, 0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                    }}>
                    Cancel
                  </motion.button>

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onConfirm}
                    style={{
                      flex: 1,
                      background: 'linear-gradient(135deg, #ff3b30 0%, #ff2d55 100%)',
                      border: 'none',
                      borderRadius: '12px',
                      padding: '14px',
                      cursor: 'pointer',
                      color: '#ffffff',
                      fontSize: '16px',
                      fontWeight: '600',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(255, 59, 48, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 59, 48, 0.4)';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 59, 48, 0.3)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}>
                    {willRemoveKeyring ? 'Remove Keyring' : 'Remove Account'}
                  </motion.button>
                </>
              )}

              {cannotRemove && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onCancel}
                  style={{
                    width: '100%',
                    background: 'var(--modern-accent-primary)',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '14px',
                    cursor: 'pointer',
                    color: '#000000',
                    fontSize: '16px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1';
                  }}>
                  OK
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
