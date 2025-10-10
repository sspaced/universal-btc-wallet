import React, { createContext, useContext, ReactNode } from 'react';

import { Asset } from '../components/wallet/ModernAssetsList';
import { useCachedUnifiedAssets } from '../hooks/useCachedUnifiedAssets';

interface AssetContextValue {
  assets: Asset[];
  loading: boolean;
  isRefreshing: boolean;
  refreshAssets: () => Promise<void>;
}

const AssetContext = createContext<AssetContextValue | undefined>(undefined);

interface AssetProviderProps {
  children: ReactNode;
}

export const AssetProvider: React.FC<AssetProviderProps> = ({ children }) => {
  // Instance unique du hook partagée par tous les composants enfants
  const assetData = useCachedUnifiedAssets();

  return <AssetContext.Provider value={assetData}>{children}</AssetContext.Provider>;
};

export const useAssets = (): AssetContextValue => {
  const context = useContext(AssetContext);
  if (!context) {
    throw new Error('useAssets must be used within an AssetProvider');
  }
  return context;
};
