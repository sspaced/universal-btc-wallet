import { AnimatePresence, motion } from 'framer-motion';
import React, { useEffect, useState } from 'react';

import { KeyringType } from '@unisat/keyring-service/types';

import { KeyIcon, PlusIcon, TrashIcon } from '../common/ModernIcons';

export interface Account {
  address: string;
  alianName?: string;
  index: number;
  type?: string; // Keyring type
  keyringIndex?: number; // Index du keyring pour référence
}

interface ModernSidebarProps {
  visible: boolean;
  onToggle: () => void;
  accounts: Account[];
  selectedAccount: Account | null;
  onSelectAccount: (account: Account) => void;
  onAddAccount?: () => void;
  onEditWalletName?: (account: Account) => void;
  onShowSecretPhrase?: (account: Account) => void;
  onExportPrivateKey?: (account: Account) => void;
  onRemoveWallet?: (account: Account) => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  visible,
  onToggle,
  accounts,
  selectedAccount,
  onSelectAccount,
  onAddAccount,
  onEditWalletName,
  onShowSecretPhrase,
  onExportPrivateKey,
  onRemoveWallet
}) => {
  const [openMenuForAccount, setOpenMenuForAccount] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<string | null>(null);
  const [editingName, setEditingName] = useState<string>('');
  const [clickTimeout, setClickTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout) {
        clearTimeout(clickTimeout);
      }
    };
  }, [clickTimeout]);

  const getAccountInitials = (account: Account): string => {
    const name = account.alianName || `Account ${account.index + 1}`;
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAccountName = (account: Account): string => {
    return account.alianName || `Account ${account.index + 1}`;
  };

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onToggle}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 998,
              backdropFilter: 'blur(4px)'
            }}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              bottom: '64px',
              width: '280px',
              maxWidth: '80vw',
              background: 'rgba(20, 20, 20, 0.98)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}>
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '-0.5px'
                }}>
                Accounts
              </h2>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onToggle}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'rgba(255, 255, 255, 0.7)',
                  cursor: 'pointer',
                  fontSize: '24px',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                ×
              </motion.button>
            </div>

            {/* Accounts List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
                minHeight: 0
              }}>
              {accounts.map((account) => {
                const isSelected = selectedAccount?.address === account.address;
                const isMenuOpen = openMenuForAccount === account.address;
                return (
                  <div
                    key={account.address}
                    onClick={(e) => {
                      // Clear any existing timeout
                      if (clickTimeout) {
                        clearTimeout(clickTimeout);
                        setClickTimeout(null);
                        return;
                      }

                      // Set a timeout to handle single click
                      const timeout = setTimeout(() => {
                        onSelectAccount(account);
                        onToggle();
                        setClickTimeout(null);
                      }, 200);

                      setClickTimeout(timeout);
                    }}
                    onDoubleClick={(e) => {
                      // Clear the single click timeout
                      if (clickTimeout) {
                        clearTimeout(clickTimeout);
                        setClickTimeout(null);
                      }

                      // Handle double click for editing
                      setEditingAccount(account.address);
                      setEditingName(account.alianName || `Account ${account.index + 1}`);
                    }}
                    style={{
                      width: '100%',
                      background: isSelected ? 'var(--modern-bg-primary)' : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected ? '1px solid rgba(114, 227, 173, 0.3)' : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '8px',
                      padding: '12px',
                      marginBottom: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.2)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                        e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
                      }
                    }}>
                    {/* Account Avatar */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: isSelected
                          ? 'linear-gradient(135deg, var(--modern-accent-primary) 0%, #5dd39a 100%)'
                          : 'linear-gradient(135deg, #444 0%, #333 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: isSelected ? '#000000' : '#ffffff',
                        flexShrink: 0
                      }}>
                      {getAccountInitials(account)}
                    </div>

                    {/* Account Info - Clickable area or inline edit */}
                    <div
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        overflow: 'hidden'
                      }}>
                      {editingAccount === account.address ? (
                        // Inline editing mode
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => {
                            if (e.target.value.length <= 20) {
                              setEditingName(e.target.value);
                            }
                          }}
                          onBlur={() => {
                            // Save on blur
                            if (editingName.trim().length > 0 && onEditWalletName) {
                              onEditWalletName({ ...account, alianName: editingName });
                            }
                            setEditingAccount(null);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              // Save on Enter
                              if (editingName.trim().length > 0 && onEditWalletName) {
                                onEditWalletName({ ...account, alianName: editingName });
                              }
                              setEditingAccount(null);
                            } else if (e.key === 'Escape') {
                              // Cancel on Escape
                              setEditingAccount(null);
                            }
                          }}
                          autoFocus
                          maxLength={20}
                          style={{
                            width: '100%',
                            fontSize: '14px',
                            fontWeight: '600',
                            color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                            background: 'rgba(255, 255, 255, 0.1)',
                            border: '1px solid rgba(114, 227, 173, 0.5)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            outline: 'none',
                            marginBottom: '4px'
                          }}
                        />
                      ) : (
                        // Normal display mode
                        <div
                          style={{
                            cursor: 'inherit'
                          }}>
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            onDoubleClick={(e) => {
                              e.stopPropagation();
                              setEditingAccount(account.address);
                              setEditingName(account.alianName || `Account ${account.index + 1}`);
                            }}
                            style={{
                              fontSize: '14px',
                              fontWeight: '600',
                              color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                              marginBottom: '2px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              cursor: 'inherit'
                            }}>
                            {getAccountName(account)}
                          </div>
                        </div>
                      )}
                      <div
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await navigator.clipboard.writeText(account.address);
                            // Simple toast notification
                            const toast = document.createElement('div');
                            toast.textContent = 'Address copied!';
                            toast.style.cssText = `
                              position: fixed;
                              top: 20px;
                              right: 20px;
                              background: rgba(0, 0, 0, 0.8);
                              color: white;
                              padding: 12px 16px;
                              border-radius: 8px;
                              font-size: 14px;
                              z-index: 10000;
                              animation: fadeInOut 2s ease-in-out;
                            `;

                            // Add animation styles
                            const style = document.createElement('style');
                            style.textContent = `
                              @keyframes fadeInOut {
                                0% { opacity: 0; transform: translateY(-10px); }
                                20% { opacity: 1; transform: translateY(0); }
                                80% { opacity: 1; transform: translateY(0); }
                                100% { opacity: 0; transform: translateY(-10px); }
                              }
                            `;
                            document.head.appendChild(style);

                            document.body.appendChild(toast);
                            setTimeout(() => {
                              document.body.removeChild(toast);
                              document.head.removeChild(style);
                            }, 2000);
                          } catch (err) {
                            console.error('Failed to copy address:', err);
                          }
                        }}
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontFamily: 'monospace',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          cursor: 'pointer',
                          transition: 'color 0.2s ease',
                          padding: '2px 4px',
                          marginTop: '2px'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = 'var(--modern-accent-primary)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = 'rgba(255, 255, 255, 0.5)';
                        }}
                        title="Click to copy address">
                        {account.address.substring(0, 8)}...
                        {account.address.substring(account.address.length - 6)}
                      </div>
                    </div>

                    {/* Settings Button - Opens wallet options menu */}
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuForAccount(isMenuOpen ? null : account.address);
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: isMenuOpen ? 'var(--modern-accent-primary)' : 'rgba(255, 255, 255, 0.6)',
                        transition: 'color 0.2s ease',
                        flexShrink: 0
                      }}>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 3v1.5m0 9V15m4.5-10.5L12.75 5.25m-7.5 7.5L4.5 13.5m10.5-4.5H13.5m-9 0H3m10.5 4.5l-.75-.75m-7.5-7.5L4.5 4.5M12 9a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </motion.button>

                    {/* Contextual Menu */}
                    <AnimatePresence>
                      {isMenuOpen && (
                        <>
                          {/* Backdrop to close menu when clicking outside */}
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuForAccount(null);
                            }}
                            style={{
                              position: 'fixed',
                              top: 0,
                              left: 0,
                              right: 0,
                              bottom: 0,
                              zIndex: 999
                            }}
                          />

                          {/* Menu */}
                          <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            style={{
                              position: 'absolute',
                              top: '100%',
                              right: '0',
                              marginTop: '8px',
                              background: 'rgba(28, 28, 30, 0.98)',
                              backdropFilter: 'blur(20px)',
                              border: '1px solid rgba(255, 255, 255, 0.15)',
                              borderRadius: '8px',
                              padding: '8px',
                              minWidth: '200px',
                              zIndex: 1000,
                              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)'
                            }}>
                            {/* Show Secret Recovery Phrase (HD wallets only) */}
                            {onShowSecretPhrase && account.type === KeyringType.HdKeyring && (
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  onShowSecretPhrase(account);
                                  setOpenMenuForAccount(null);
                                }}
                                style={{
                                  width: '100%',
                                  background: 'transparent',
                                  border: 'none',
                                  padding: '10px 12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  borderRadius: '8px',
                                  transition: 'background 0.2s ease',
                                  color: 'rgba(255, 255, 255, 0.9)',
                                  fontSize: '14px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}>
                                <KeyIcon size={18} />
                                <span>Show Secret Phrase</span>
                              </motion.button>
                            )}

                            {/* Export Private Key (Simple wallets only) */}
                            {onExportPrivateKey &&
                              account.type !== KeyringType.HdKeyring &&
                              account.type !== KeyringType.KeystoneKeyring &&
                              account.type !== KeyringType.ColdWalletKeyring && (
                                <motion.button
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => {
                                    onExportPrivateKey(account);
                                    setOpenMenuForAccount(null);
                                  }}
                                  style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    padding: '10px 12px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    borderRadius: '8px',
                                    transition: 'background 0.2s ease',
                                    color: 'rgba(255, 255, 255, 0.9)',
                                    fontSize: '14px'
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                  }}>
                                  <KeyIcon size={18} />
                                  <span>Export Private Key</span>
                                </motion.button>
                              )}

                            {/* Divider - Only show if there are options above */}
                            {(onShowSecretPhrase && account.type === KeyringType.HdKeyring) ||
                            (onExportPrivateKey &&
                              account.type !== KeyringType.HdKeyring &&
                              account.type !== KeyringType.KeystoneKeyring &&
                              account.type !== KeyringType.ColdWalletKeyring) ? (
                              <div
                                style={{
                                  height: '1px',
                                  background: 'rgba(255, 255, 255, 0.1)',
                                  margin: '8px 0'
                                }}
                              />
                            ) : null}

                            {/* Remove Wallet */}
                            {onRemoveWallet && (
                              <motion.button
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  onRemoveWallet(account);
                                  setOpenMenuForAccount(null);
                                }}
                                style={{
                                  width: '100%',
                                  background: 'transparent',
                                  border: 'none',
                                  padding: '10px 12px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px',
                                  borderRadius: '8px',
                                  transition: 'background 0.2s ease',
                                  color: '#ff3b30',
                                  fontSize: '14px'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}>
                                <TrashIcon size={18} color="#ff3b30" />
                                <span>Remove Wallet</span>
                              </motion.button>
                            )}
                          </motion.div>
                        </>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Footer Actions */}
            {onAddAccount && (
              <div
                style={{
                  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                  padding: '12px'
                }}>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onAddAccount}
                  style={{
                    width: '100%',
                    background: 'var(--modern-bg-secondary)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    borderRadius: '10px',
                    padding: '12px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    color: '#ffffff',
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.2s ease'
                  }}>
                  <PlusIcon size={20} />
                  Add Wallet
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
