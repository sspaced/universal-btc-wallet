import { motion } from 'framer-motion';
import React from 'react';

import { QRCodeIcon, MailIcon, SwapIcon, DollarIcon } from '../common/ModernIcons';

interface ActionButton {
  id: string;
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

interface ModernQuickActionsProps {
  onSend: () => void;
  onReceive: () => void;
  onBuy: () => void;
  onExchange: () => void;
}

export const ModernQuickActions: React.FC<ModernQuickActionsProps> = ({
  onSend,
  onReceive,
  onBuy,
  onExchange,
}) => {
  const actions: ActionButton[] = [
    {
      id: 'receive',
      label: 'Receive',
      icon: <QRCodeIcon size={24} />,
      onClick: onReceive,
    },
    {
      id: 'send',
      label: 'Send',
      icon: <MailIcon size={24} />,
      onClick: onSend,
    },
    {
      id: 'swap',
      label: 'Swap',
      icon: <SwapIcon size={24} />,
      onClick: onExchange,
      disabled: false,
    },
    {
      id: 'buy',
      label: 'Buy',
      icon: <DollarIcon size={24} />,
      onClick: onBuy,
    },
  ];

  return (
    <div
      style={{
        padding: '0 20px',
        marginBottom: '24px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
        }}
      >
        {actions.map((action, index) => (
          <motion.button
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: [0.25, 0.1, 0.25, 1],
            }}
            whileHover={
              action.disabled
                ? {}
                : {
                    scale: 1.05,
                    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
                  }
            }
            whileTap={
              action.disabled
                ? {}
                : {
                    scale: 0.95,
                    transition: { duration: 0.1, ease: [0.25, 0.1, 0.25, 1] },
                  }
            }
            onClick={action.onClick}
            disabled={action.disabled}
            style={{
              background: 'transparent',
              border: 'none',
              padding: '0',
              cursor: action.disabled ? 'not-allowed' : 'pointer',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '8px',
              opacity: action.disabled ? 0.5 : 1,
            }}
          >
            <motion.div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: action.disabled ? 'rgba(255, 255, 255, 0.1)' : '#007aff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: action.disabled ? 'rgba(255, 255, 255, 0.3)' : '#ffffff',
              }}
            >
              {action.icon}
            </motion.div>
            <span
              style={{
                fontSize: '13px',
                fontWeight: '600',
                color: action.disabled ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.9)',
                textAlign: 'center',
              }}
            >
              {action.label}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
};
