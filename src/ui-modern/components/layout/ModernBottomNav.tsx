import { motion } from 'framer-motion';
import { ArrowUpDown, Clock, Home, Settings } from 'lucide-react';
import React from 'react';

import { useI18n } from '@/ui/hooks/useI18n';

export type BottomNavTab = 'home' | 'swap' | 'history' | 'settings';

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
  const { t } = useI18n();

  const navItems: NavItem[] = [
    {
      id: 'home',
      label: t('home'),
      icon: <Home size={24} />
    },
    {
      id: 'swap',
      label: t('swap'),
      icon: <ArrowUpDown size={24} />
    },
    {
      id: 'history',
      label: t('history'),
      icon: <Clock size={24} />
    },
    {
      id: 'settings',
      label: t('settings'),
      icon: <Settings size={24} />
    }
  ];

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '8px',
        left: '16px',
        right: '16px',
        height: '64px',
        background: 'var(--modern-bg-primary)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '32px',
        boxShadow:
          '0 -40px 100px rgba(0, 0, 0, 0.8), 0 -16px 40px rgba(0, 0, 0, 0.6), 0 -8px 20px rgba(0, 0, 0, 0.4), 0 8px 20px rgba(0, 0, 0, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        padding: '0 16px',
        zIndex: 1000
      }}>
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
              maxWidth: '80px'
            }}>
            <div
              style={{
                color: isActive ? 'var(--modern-accent-primary)' : 'rgba(255, 255, 255, 0.6)',
                transition: 'color 0.3s ease'
              }}>
              {item.icon}
            </div>
            <span
              style={{
                fontSize: '11px',
                fontWeight: isActive ? '600' : '500',
                color: isActive ? 'var(--modern-accent-primary)' : 'rgba(255, 255, 255, 0.6)',
                transition: 'all 0.3s ease'
              }}>
              {item.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};
