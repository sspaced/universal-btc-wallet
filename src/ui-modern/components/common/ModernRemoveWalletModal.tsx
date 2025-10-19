import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { ModernButton } from './ModernButton';

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
  // Can't remove if it's the last account in its keyring (backend constraint)
  const cannotRemove = isLastAccountInKeyring;

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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'relative',
              width: '90%',
              maxWidth: '400px',
              background: 'rgba(28, 28, 30, 0.98)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)'
            }}>
            {/* Title */}
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: '18px',
                fontWeight: '600',
                color: '#ffffff',
                textAlign: 'left',
                letterSpacing: '-0.3px'
              }}>
              {cannotRemove ? 'Cannot Remove Account' : 'Remove Account'}
            </h2>

            {/* Description */}
            <div
              style={{
                marginBottom: '24px'
              }}>
              {cannotRemove ? (
                <p
                  style={{
                    margin: '0',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    color: 'rgba(255, 255, 255, 0.6)',
                    letterSpacing: '-0.022em'
                  }}>
                  You cannot remove the last account from this wallet.
                </p>
              ) : (
                <>
                  {/* Wallet Info */}
                  <div
                    style={{
                      marginBottom: '16px'
                    }}>
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: 'rgba(255, 255, 255, 0.9)',
                        marginBottom: '4px',
                        letterSpacing: '-0.022em'
                      }}>
                      {walletName}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        fontFamily: 'monospace',
                        color: 'rgba(255, 255, 255, 0.4)',
                        letterSpacing: '0'
                      }}>
                      {walletAddress.substring(0, 12)}...{walletAddress.substring(walletAddress.length - 12)}
                    </div>
                  </div>

                  {/* Warning */}
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13px',
                      lineHeight: '1.5',
                      color: 'rgba(255, 255, 255, 0.6)',
                      letterSpacing: '-0.022em'
                    }}>
                    This action cannot be undone. Make sure you have backed up your private key.
                  </p>
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
              {!cannotRemove ? (
                <>
                  <ModernButton variant="secondary" onClick={onCancel} style={{ flex: 1 }}>
                    Cancel
                  </ModernButton>
                  <ModernButton variant="primary" onClick={onConfirm} style={{ flex: 1 }}>
                    Remove
                  </ModernButton>
                </>
              ) : (
                <ModernButton variant="primary" onClick={onCancel} fullWidth>
                  OK
                </ModernButton>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

