import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';

import { BackIcon } from '../components/common/Icons';
import { ModernButton } from '../components/common/ModernButton';
import { ModernAssetsList } from '../components/wallet';
import { useAssets } from '../providers/AssetProvider';

export const ModernAssetSelectionScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { assets, loading } = useAssets();
  const [searchQuery, setSearchQuery] = useState('');

  const handleBack = () => {
    navigate('#back');
  };

  const handleAssetClick = (asset: any) => {
    console.log('Asset clicked for send:', asset);
    // Navigate to send screen with selected asset
    navigate('TxCreateScreen', { selectedAsset: asset });
  };

  // Filter assets based on search query
  const filteredAssets = assets.filter((asset) => {
    const query = searchQuery.toLowerCase();
    return asset.name.toLowerCase().includes(query) || (asset.symbol && asset.symbol.toLowerCase().includes(query));
  });

  return (
    <div
      className="modern-ui-container"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--modern-bg-primary)',
        overflow: 'hidden'
      }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--modern-bg-secondary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
          <BackIcon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
        </motion.button>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.3px'
          }}>
          {t('select_asset')}
        </motion.h1>

        <div style={{ width: '40px' }} />
      </motion.div>

      {/* Search bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        style={{ padding: '16px 20px' }}>
        <div style={{ position: 'relative' }}>
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              position: 'absolute',
              left: '16px',
              top: '50%',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}>
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 48px',
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              color: '#ffffff',
              fontSize: '14px',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            }}
            onBlur={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          />
        </div>
      </motion.div>

      {/* Assets List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          flex: 1,
          overflowY: 'auto'
        }}>
        <ModernAssetsList assets={filteredAssets} loading={loading} onAssetClick={handleAssetClick} />
      </motion.div>

      {/* Close Button */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
        <ModernButton variant="secondary" size="large" fullWidth onClick={handleBack}>
          {t('close')}
        </ModernButton>
      </div>
    </div>
  );
};
