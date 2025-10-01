import { motion } from 'framer-motion';
import React from 'react';

export type BottomNavTab = 'home' | 'swap' | 'history' | 'search';

interface ModernBottomNavProps {
  activeTab: BottomNavTab;
  onTabChange: (tab: BottomNavTab) => void;
}

interface NavItem {
  id: BottomNavTab;
  label: string;
  icon: React.ReactNode;
}

export const ModernBottomNav: React.FC<ModernBottomNavProps> = ({ activeTab, onTabChange }) => {
  const navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      ),
    },
    {
      id: 'swap',
      label: 'Swap',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
          />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'History',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    {
      id: 'search',
      label: 'Search',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(0, 0, 0, 0.95)',
        backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 16px',
        zIndex: 1000,
      }}
    >
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        return (
          <motion.button
            key={item.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => onTabChange(item.id)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 12px',
              flex: 1,
              maxWidth: '80px',
            }}
          >
            <div
              style={{
                color: isActive ? '#007aff' : 'rgba(255, 255, 255, 0.6)',
                transition: 'color 0.3s ease',
              }}
            >
              {item.icon}
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? '#007aff' : 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.3s ease',
              }}
            >
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
