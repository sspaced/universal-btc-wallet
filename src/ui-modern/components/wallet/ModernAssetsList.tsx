import { motion } from 'framer-motion';
import React, { useMemo } from 'react';

export interface Asset {
  id: string;
  type: 'ordinal' | 'rune' | 'alkane' | 'cat20' | 'cat721' | 'brc20';
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

export const ModernAssetsList: React.FC<ModernAssetsListProps> = ({
  assets,
  loading = false,
  onAssetClick,
}) => {
  // Sort assets by value (descending)
  const sortedAssets = useMemo(() => {
    return [...assets].sort((a, b) => b.value - a.value);
  }, [assets]);

  const getAssetIcon = (asset: Asset): React.ReactNode => {
    // If custom icon is provided, use it
    if (asset.icon) {
      return (
        <img
          src={asset.icon}
          alt={asset.name}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '8px',
            objectFit: 'cover',
          }}
        />
      );
    }

    // Default icons based on type
    const colorMap = {
      ordinal: '#ff9500',
      rune: '#af52de',
      alkane: '#34c759',
      cat20: '#007aff',
      cat721: '#ff3b30',
      brc20: '#5ac8fa',
    };

    const color = colorMap[asset.type] || '#8e8e93';

    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '8px',
          background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: '700',
          color: '#fff',
        }}
      >
        {asset.symbol ? asset.symbol.substring(0, 2).toUpperCase() : asset.name.substring(0, 2).toUpperCase()}
      </div>
    );
  };

  const isChangePositive = (change?: string): boolean => {
    return change ? change.startsWith('+') : false;
  };

  if (loading) {
    return (
      <div
        style={{
          padding: '40px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '32px',
            marginBottom: '12px',
          }}
        >
          ⏳
        </div>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          Loading assets...
        </div>
      </div>
    );
  }

  if (sortedAssets.length === 0) {
    return (
      <div
        style={{
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: '48px',
            marginBottom: '16px',
            opacity: 0.3,
          }}
        >
          📦
        </div>
        <div
          style={{
            fontSize: '16px',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '8px',
          }}
        >
          No assets found
        </div>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.4)',
          }}
        >
          Your assets will appear here
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: '0 20px 100px',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 0',
          marginBottom: '8px',
        }}
      >
        <h3
          style={{
            margin: 0,
            fontSize: '18px',
            fontWeight: '700',
            color: '#ffffff',
            letterSpacing: '-0.5px',
          }}
        >
          Jetons
        </h3>
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.5)',
          }}
        >
          {sortedAssets.length} asset{sortedAssets.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Assets List */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {sortedAssets.map((asset, index) => {
          const isPositive = isChangePositive(asset.change);
          return (
            <motion.button
              key={asset.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (asset.onClick) {
                  asset.onClick();
                } else if (onAssetClick) {
                  onAssetClick(asset);
                }
              }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '16px',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                transition: 'all 0.2s ease',
                textAlign: 'left',
              }}
            >
              {/* Asset Icon */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  flexShrink: 0,
                }}
              >
                {getAssetIcon(asset)}
              </div>

              {/* Asset Info */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {asset.name}
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {asset.amount} {asset.symbol || ''}
                </div>
              </div>

              {/* Value and Change */}
              <div
                style={{
                  textAlign: 'right',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    fontSize: '15px',
                    fontWeight: '600',
                    color: '#ffffff',
                    marginBottom: '4px',
                  }}
                >
                  {asset.usdValue}
                </div>
                {asset.change && (
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: isPositive ? '#34c759' : '#ff3b30',
                    }}
                  >
                    {asset.change}
                  </div>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
