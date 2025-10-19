import { motion } from 'framer-motion';
import React from 'react';

import { ModernButton } from './ModernButton';

export interface ModernDangerZoneProps {
  title: string;
  description: string;
  buttonText: string;
  onAction: () => void;
  disabled?: boolean;
  icon?: string;
}

export const ModernDangerZone: React.FC<ModernDangerZoneProps> = ({
  title,
  description,
  buttonText,
  onAction,
  disabled = false,
  icon = '🗑️'
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        backgroundColor: 'rgba(255, 59, 48, 0.08)',
        border: '1px solid rgba(255, 59, 48, 0.3)',
        borderRadius: '12px',
        padding: '20px',
        marginTop: '24px'
      }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <span style={{ fontSize: '24px' }}>{icon}</span>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#FF3B30',
            margin: 0,
            letterSpacing: '-0.3px'
          }}>
          {title}
        </h3>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.7)',
          lineHeight: '1.5',
          marginBottom: '16px',
          letterSpacing: '-0.022em'
        }}>
        {description}
      </p>

      {/* Action Button */}
      <ModernButton
        variant="primary"
        size="medium"
        onClick={onAction}
        disabled={disabled}
        style={{
          backgroundColor: '#FF3B30',
          borderColor: '#FF3B30',
          width: '100%'
        }}>
        {buttonText}
      </ModernButton>
    </motion.div>
  );
};

