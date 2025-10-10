import { motion } from 'framer-motion';
import React from 'react';

export interface ModernAccount {
  address: string;
  alianName?: string;
  index: number;
}

interface ModernAccountSelectorProps {
  currentAccount: ModernAccount;
  onToggleSidebar: () => void;
}

export const ModernAccountSelector: React.FC<ModernAccountSelectorProps> = ({
  currentAccount,
  onToggleSidebar,
  onSearch,
  onNotifications,
}) => {
  const getAccountInitials = (account: ModernAccount): string => {
    const name = account.alianName || `Account ${account.index + 1}`;
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const getAccountName = (account: ModernAccount): string => {
    return account.alianName || `Account ${account.index + 1}`;
  };

  return (
    <div
      style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'transparent',
      }}
    >
      {/* Left: Account Info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1,
          minWidth: 0,
        }}
      >
        {/* Account Avatar and Name (clickable to open sidebar) */}
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onToggleSidebar}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '8px',
            padding: '6px 12px 6px 6px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            cursor: 'pointer',
            flex: 1,
            minWidth: 0,
            transition: 'all 0.2s ease',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #72e3ad 0%, #5dd39a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#000000',
              flexShrink: 0,
            }}
          >
            {getAccountInitials(currentAccount)}
          </div>

          {/* Account Name */}
          <div
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: 'left',
            }}
          >
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {getAccountName(currentAccount)}
            </div>
          </div>

          {/* Dropdown Arrow */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="rgba(255, 255, 255, 0.5)"
            style={{ flexShrink: 0 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6l4 4 4-4" />
          </svg>
        </motion.button>
      </div>

    </div>
  );
};
