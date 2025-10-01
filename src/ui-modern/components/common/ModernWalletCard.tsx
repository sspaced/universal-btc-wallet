import React from 'react';
import { motion } from 'framer-motion';
import { WalletIcon } from './Icons';

interface ModernWalletCardProps {
  walletName: string;
  description?: string;
  onClick: () => void;
  index?: number;
}

export const ModernWalletCard: React.FC<ModernWalletCardProps> = ({
  walletName,
  description,
  onClick,
  index = 0,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94],
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="modern-wallet-card"
      style={{
        background: 'rgba(255, 255, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        border: isHovered ? '1px solid rgba(0, 122, 255, 0.6)' : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        padding: '16px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        minHeight: '110px',
      }}
    >
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          background: 'rgba(0, 122, 255, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <WalletIcon
          style={{
            width: '20px',
            height: '20px',
            color: '#007aff',
          }}
        />
      </div>

      <div
        style={{
          textAlign: 'center',
          width: '100%',
        }}
      >
        <div
          style={{
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '2px',
          }}
        >
          {walletName}
        </div>
        {description && (
          <div
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: '1.3',
            }}
          >
            {description}
          </div>
        )}
      </div>
    </motion.div>
  );
};
