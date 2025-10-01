import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';

export interface Account {
  address: string;
  alianName?: string;
  index: number;
}

interface ModernSidebarProps {
  visible: boolean;
  onToggle: () => void;
  accounts: Account[];
  selectedAccount: Account | null;
  onSelectAccount: (account: Account) => void;
  onAddAccount?: () => void;
  onManageAccounts?: () => void;
  onSettings?: () => void;
}

export const ModernSidebar: React.FC<ModernSidebarProps> = ({
  visible,
  onToggle,
  accounts,
  selectedAccount,
  onSelectAccount,
  onAddAccount,
  onManageAccounts,
  onSettings,
}) => {
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
              backdropFilter: 'blur(4px)',
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
              bottom: 0,
              width: '280px',
              maxWidth: '80vw',
              background: 'rgba(20, 20, 20, 0.98)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(255, 255, 255, 0.1)',
              zIndex: 999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#ffffff',
                  letterSpacing: '-0.5px',
                }}
              >
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
                  justifyContent: 'center',
                }}
              >
                ×
              </motion.button>
            </div>

            {/* Accounts List */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '12px',
              }}
            >
              {accounts.map((account) => {
                const isSelected = selectedAccount?.address === account.address;
                return (
                  <motion.button
                    key={account.address}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectAccount(account);
                      onToggle();
                    }}
                    style={{
                      width: '100%',
                      background: isSelected
                        ? 'rgba(0, 122, 255, 0.15)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: isSelected
                        ? '1px solid rgba(0, 122, 255, 0.3)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '12px',
                      marginBottom: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    {/* Account Avatar */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: isSelected
                          ? 'linear-gradient(135deg, #007aff 0%, #0056cc 100%)'
                          : 'linear-gradient(135deg, #444 0%, #333 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#ffffff',
                        flexShrink: 0,
                      }}
                    >
                      {getAccountInitials(account)}
                    </div>

                    {/* Account Info */}
                    <div
                      style={{
                        flex: 1,
                        textAlign: 'left',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: isSelected ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getAccountName(account)}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: 'rgba(255, 255, 255, 0.5)',
                          fontFamily: 'monospace',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {account.address.substring(0, 8)}...
                        {account.address.substring(account.address.length - 6)}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Footer Actions */}
            <div
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {onAddAccount && (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={onAddAccount}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
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
                    transition: 'all 0.2s ease',
                  }}
                >
                  <span style={{ fontSize: '18px' }}>+</span>
                  Add Account
                </motion.button>
              )}

              <div style={{ display: 'flex', gap: '8px' }}>
                {onManageAccounts && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onManageAccounts}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px',
                      cursor: 'pointer',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '20px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ✏️
                  </motion.button>
                )}

                {onSettings && (
                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={onSettings}
                    style={{
                      flex: 1,
                      background: 'transparent',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      borderRadius: '10px',
                      padding: '10px',
                      cursor: 'pointer',
                      color: 'rgba(255, 255, 255, 0.7)',
                      fontSize: '20px',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    ⚙️
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
