import { motion } from 'framer-motion';
import { Check, Wallet } from 'lucide-react';
import React from 'react';

interface ModernWalletCardProps {
  walletName: string;
  description?: string;
  onClick: () => void;
  index?: number;
  isSelected?: boolean;
}

export const ModernWalletCard: React.FC<ModernWalletCardProps> = ({
  walletName,
  description,
  onClick,
  index = 0,
  isSelected = false
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="modern-wallet-card"
      style={{
        background: isSelected ? 'rgba(114, 227, 173, 0.1)' : 'var(--modern-bg-secondary)',
        backdropFilter: 'blur(10px)',
        border: isSelected
          ? '1px solid var(--modern-accent-primary)'
          : isHovered
          ? '1px solid rgba(114, 227, 173, 0.6)'
          : '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        minHeight: '100px',
        height: '100%',
        position: 'relative'
      }}>
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'var(--modern-accent-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            pointerEvents: 'none'
          }}>
          <Check size={12} color="white" />
        </motion.div>
      )}

      <div
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '8px',
          background: isSelected ? 'rgba(114, 227, 173, 0.25)' : 'rgba(114, 227, 173, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
        <Wallet size={16} color="var(--modern-accent-primary)" />
      </div>

      <div
        style={{
          textAlign: 'center',
          width: '100%'
        }}>
        <div
          style={{
            fontSize: '12px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '1px',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
          }}>
          {walletName}
        </div>
        {description && (
          <div
            style={{
              fontSize: '10px',
              color: 'rgba(255, 255, 255, 0.5)',
              lineHeight: '1.2',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
            }}>
            {description}
          </div>
        )}
      </div>
    </motion.div>
  );
};
