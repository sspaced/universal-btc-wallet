import { motion } from 'framer-motion';
import React, { useEffect, useMemo } from 'react';

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
  // Debug logs for assets
  useEffect(() => {
    console.log('=== ModernAssetsList DEBUG ===');
    console.log('Assets received:', assets);
    console.log('Assets count:', assets.length);
    console.log('Loading state:', loading);

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

  // Sort assets by value (descending)
  const sortedAssets = useMemo(() => {
    console.log('=== SORTING ASSETS ===');
    console.log('Assets before sorting:', assets);

    const sorted = [...assets].sort((a, b) => b.value - a.value);

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

    // Default icon based on type
    const iconColor =
      {
        rune: '#8b5cf6',
        alkane: '#06b6d4',
        cat20: '#10b981',
        cat721: '#f59e0b',
        brc20: '#ef4444',
        ordinal: '#6b7280'
      }[asset.type] || '#6b7280';

    console.log(`Using default icon with color: ${iconColor}`);
    return (
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '12px',
          fontWeight: '600'
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
              padding: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
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
        <PackageIcon size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
        <div style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>No assets found</div>
        <div style={{ fontSize: '14px', opacity: 0.7 }}>Your assets will appear here once you receive them</div>
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
        gap: '8px'
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
              padding: '16px',
              background: asset.type === 'btc' ? 'rgba(247, 147, 26, 0.05)' : 'rgba(255, 255, 255, 0.02)',
              border:
                asset.type === 'btc' ? '1px solid rgba(247, 147, 26, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              position: 'relative'
            }}
            whileHover={{
              background: asset.type === 'btc' ? 'rgba(247, 147, 26, 0.08)' : 'rgba(255, 255, 255, 0.04)',
              borderColor: asset.type === 'btc' ? 'rgba(247, 147, 26, 0.3)' : 'rgba(255, 255, 255, 0.1)'
            }}>
            {/* Asset Icon */}
            {getAssetIcon(asset)}

            {/* Asset Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '4px'
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
                  fontSize: '14px',
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
                  fontWeight: '600',
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
