import { motion } from 'framer-motion';
import React, { useEffect, useMemo } from 'react';

import { useI18n } from '@/ui/hooks/useI18n';

import { getAssetLogo, testAssetLogos } from '../../config/asset-logos';
import { PackageIcon } from '../common/ModernIcons';

export interface Asset {
  id: string;
  type: 'ordinal' | 'rune' | 'alkane' | 'cat20' | 'cat721' | 'brc20' | 'btc' | 'simplicity';
  name: string;
  symbol?: string;
  icon?: string;
  amount: string;
  value: number; // Value in USD for sorting
  usdValue: string;
  change?: string;
  onClick?: () => void;
}

interface ModernAssetsListProps {
  assets: Asset[];
  loading?: boolean;
  onAssetClick?: (asset: Asset) => void;
}

export const ModernAssetsList: React.FC<ModernAssetsListProps> = ({ assets, loading = false, onAssetClick }) => {
  const { t } = useI18n();
  // Debug logs for assets
  useEffect(() => {
    console.log('=== ModernAssetsList DEBUG ===');
    console.log('Assets received:', assets);
    console.log('Assets count:', assets.length);
    console.log('Loading state:', loading);

    // Test des logos au premier chargement
    if (assets.length > 0) {
      testAssetLogos();
    }

    assets.forEach((asset, index) => {
      console.log(`Asset ${index + 1} details:`, {
        id: asset.id,
        type: asset.type,
        name: asset.name,
        symbol: asset.symbol,
        amount: asset.amount,
        value: asset.value,
        usdValue: asset.usdValue,
        hasOnClick: !!asset.onClick
      });
    });
    console.log('===============================');
  }, [assets, loading]);

  // Sort assets by value (ascending)
  const sortedAssets = useMemo(() => {
    console.log('=== SORTING ASSETS ===');
    console.log('Assets before sorting:', assets);

    const sorted = [...assets].sort((a, b) => a.value - b.value);

    console.log('Assets after sorting:', sorted);
    console.log('Sorting complete');

    return sorted;
  }, [assets]);

  const getAssetIcon = (asset: Asset) => {
    console.log(`Getting icon for asset: ${asset.name} (${asset.type})`);

    if (asset.type === 'btc') {
      console.log('Using BTC icon');
      return (
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f7931a 0%, #ffb347 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: 'bold',
            color: '#ffffff'
          }}>
          ₿
        </div>
      );
    }

    // Chercher le logo dans la liste des logos disponibles
    const assetLogoPath = getAssetLogo(asset.symbol, asset.name, asset.type);

    if (assetLogoPath) {
      console.log('Using available logo:', assetLogoPath);
      return (
        <img
          src={assetLogoPath}
          alt={asset.name}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }

    if (asset.icon) {
      console.log('Using custom icon:', asset.icon);
      return (
        <img
          src={asset.icon}
          alt={asset.name}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }

    // Si pas de logo disponible, afficher juste le nom de l'asset sans icône
    console.log(`Using text fallback for: ${asset.name}`);
    return (
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: '600',
          textAlign: 'center',
          padding: '2px'
        }}>
        {asset.symbol?.charAt(0) || asset.name.charAt(0)}
      </div>
    );
  };

  const handleAssetClick = (asset: Asset) => {
    console.log(`Asset clicked: ${asset.name} (${asset.type})`);

    if (onAssetClick) {
      console.log('Calling onAssetClick for:', asset);
      onAssetClick(asset);
    } else {
      console.log('No onAssetClick handler provided');
    }
  };

  if (loading) {
    console.log('Rendering loading state');
    return (
      <div
        style={{
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
        {[...Array(3)].map((_, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 15px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '15px',
              animation: 'pulse 2s infinite'
            }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)'
              }}
            />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  height: '16px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '4px',
                  marginBottom: '8px',
                  width: '60%'
                }}
              />
              <div
                style={{
                  height: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '4px',
                  width: '40%'
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (sortedAssets.length === 0) {
    console.log('Rendering empty state - no assets found');
    return (
      <div
        style={{
          padding: '40px 20px',
          textAlign: 'center',
          color: 'rgba(255, 255, 255, 0.5)'
        }}>
        <div style={{ marginBottom: '16px', opacity: 0.3 }}>
          <PackageIcon size={48} />
        </div>
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>{t('no_assets_found')}</div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>{t('assets_will_appear_here')}</div>
      </div>
    );
  }

  console.log(`Rendering ${sortedAssets.length} assets`);

  return (
    <div
      style={{
        padding: '0 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px'
      }}>
      {sortedAssets.map((asset, index) => {
        console.log(`Rendering asset ${index + 1}: ${asset.name} (${asset.type})`);

        return (
          <motion.div
            key={asset.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            onClick={() => handleAssetClick(asset)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '8px 15px',
              background: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            whileHover={{
              background: 'rgba(255, 255, 255, 0.05)',
              borderColor: 'rgba(255, 255, 255, 0.3)'
            }}>
            {/* Asset Icon */}
            {getAssetIcon(asset)}

            {/* Asset Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                <span
                  style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#ffffff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                  {asset.name}
                </span>
              </div>

              <div
                style={{
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}>
                {asset.amount} {asset.symbol}
              </div>
            </div>

            {/* Asset Value */}
            <div style={{ textAlign: 'right' }}>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: '300',
                  color: '#ffffff',
                  marginBottom: '2px'
                }}>
                {asset.usdValue}
              </div>
              {asset.change && (
                <div
                  style={{
                    fontSize: '12px',
                    color: asset.change.startsWith('+') ? '#34c759' : '#ff3b30'
                  }}>
                  {asset.change}
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
