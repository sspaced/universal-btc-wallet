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

  const shortenAddress = (address: string): string => {
    if (!address || address.length < 8) return address;
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(currentAccount.address);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
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
      {/* Hamburger Menu Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onToggleSidebar}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '8px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Hamburger Lines */}
        <div style={{ width: '24px', height: '2px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '2px' }} />
        <div style={{ width: '24px', height: '2px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '2px' }} />
        <div style={{ width: '24px', height: '2px', background: 'rgba(255, 255, 255, 0.8)', borderRadius: '2px' }} />
      </motion.button>

      {/* Address with Copy Button */}
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={handleCopyAddress}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '6px 8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        <span
          style={{
            fontSize: '12px',
            fontWeight: '500',
            color: 'rgba(255, 255, 255, 0.7)',
            letterSpacing: '0.3px',
          }}
        >
          {shortenAddress(currentAccount.address)}
        </span>
        {/* Copy Icon */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="rgba(255, 255, 255, 0.6)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      </motion.button>
    </div>
  );
};
