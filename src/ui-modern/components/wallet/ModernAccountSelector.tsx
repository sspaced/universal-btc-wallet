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
  onSearch?: () => void;
  onNotifications?: () => void;
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
            borderRadius: '12px',
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
              background: 'linear-gradient(135deg, #007aff 0%, #0056cc 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              fontWeight: '600',
              color: '#ffffff',
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

      {/* Right: Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginLeft: '12px',
        }}
      >
        {/* Search Button */}
        {onSearch && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onSearch}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 16l-4-4m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </motion.button>
        )}

        {/* Notifications Button */}
        {onNotifications && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onNotifications}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              position: 'relative',
              flexShrink: 0,
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#fff">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 13.5H3L4.5 12V7.5a4.5 4.5 0 019 0V12l1.5 1.5z"
              />
            </svg>
            {/* Notification badge */}
            <div
              style={{
                position: 'absolute',
                top: '6px',
                right: '6px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ff3b30',
                border: '2px solid #000',
              }}
            />
          </motion.button>
        )}
      </div>
    </div>
  );
};
