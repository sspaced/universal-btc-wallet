import { useCallback, useEffect, useRef, useState } from 'react';

import { CAT_VERSION } from '@/shared/types';
import { usePrice } from '@/ui/provider/PriceProvider';
import { assetCacheService } from '@/ui/services/AssetCacheService';
import { BTCService } from '@/ui/services/BTCService';
import { useAccountBalance, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChainType } from '@/ui/state/settings/hooks';
import { useSupportedAssets } from '@/ui/state/ui/hooks';
import { useWallet } from '@/ui/utils';

import { Asset } from '../components/wallet/ModernAssetsList';

const DEBUG = false; // Toggle pour les logs de debug

export const useCachedUnifiedAssets = () => {
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const accountBalance = useAccountBalance();
  const chainType = useChainType();
  const btcUnit = useBTCUnit();
  const supportedAssets = useSupportedAssets();
  const { coinPrice } = usePrice();

  // États initialisés avec le cache
  const [assets, setAssets] = useState<Asset[]>(() => {
    if (currentAccount.address) {
      const cacheKey = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
      const cachedData = assetCacheService.getCachedData(cacheKey);
      if (cachedData) {
        if (DEBUG) console.log('🔄 Initializing assets from cache:', cachedData.assets.length);
        return cachedData.assets;
      }
    }
    return [];
  });

  const [loading, setLoading] = useState(() => {
    if (currentAccount.address) {
      const cacheKey = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
      return !assetCacheService.getCachedData(cacheKey);
    }
    return true;
  });

  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refs pour éviter les re-renders inutiles
  const lastFetchParams = useRef<string>('');
  const lastBalanceRef = useRef<number>(0);
  const coinPriceRef = useRef(coinPrice);
  const supportedAssetsRef = useRef(supportedAssets);

  // Fonction de récupération des données BTC
  const fetchBTCData = useCallback(async (): Promise<Asset[]> => {
    if (DEBUG) console.log('🔵 Fetching BTC data');
    const btcAssets: Asset[] = [];

    try {
      const btcBalance = await BTCService.getBTCBalance(currentAccount.address, wallet);
      const btcAsset = BTCService.createBTCAsset(btcBalance, coinPriceRef.current?.btc || 0, btcUnit);

      if (btcAsset) {
        btcAssets.push(btcAsset);
      }
    } catch (error) {
      console.error('Failed to fetch BTC data:', error);
    }

    return btcAssets;
  }, [currentAccount.address, btcUnit, wallet]);

  // Fonction de récupération des assets
  const fetchAssetsData = useCallback(async (): Promise<Asset[]> => {
    if (DEBUG) console.log('🟢 Fetching all assets data');
    const allAssets: Asset[] = [];

    try {
      // Fetch BTC
      const btcAssets = await fetchBTCData();
      allAssets.push(...btcAssets);

      // Fetch Runes
      if (supportedAssetsRef.current.assets.runes) {
        try {
          const { list: runesList } = await wallet.getRunesList(currentAccount.address, 1, 100);
          const runesPriceMap =
            runesList.length > 0 ? await wallet.getRunesPrice(runesList.map((item) => item.spacedRune)) : {};

          runesList.forEach((rune) => {
            const price = runesPriceMap[rune.spacedRune];
            const value = price ? price.curPrice * parseFloat(rune.amount) : 0;
            allAssets.push({
              id: rune.runeid,
              type: 'rune' as const,
              name: rune.spacedRune,
              symbol: rune.symbol || rune.spacedRune,
              amount: rune.amount,
              value: value,
              usdValue: value > 0 ? `$${value.toFixed(2)}` : '-'
            });
          });
        } catch (e) {
          console.error('Failed to fetch runes:', e);
        }
      }

      // Fetch Alkanes
      if (supportedAssetsRef.current.assets.alkanes) {
        try {
          const { list: alkanesList } = await wallet.getAlkanesList(currentAccount.address, 1, 100);
          const alkanesPriceMap =
            alkanesList.length > 0 ? await wallet.getAlkanesPrice(alkanesList.map((item) => item.alkaneid)) : {};

          alkanesList.forEach((alkane) => {
            const price = alkanesPriceMap[alkane.alkaneid];
            const value = price ? price.curPrice * parseFloat(alkane.amount) : 0;
            allAssets.push({
              id: alkane.alkaneid,
              type: 'alkane' as const,
              name: alkane.name,
              symbol: alkane.symbol,
              amount: alkane.amount,
              value: value,
              usdValue: value > 0 ? `$${value.toFixed(2)}` : '-'
            });
          });
        } catch (e) {
          console.error('Failed to fetch alkanes:', e);
        }
      }

      // Fetch CAT20
      if (supportedAssetsRef.current.assets.CAT20) {
        try {
          const { list: cat20List } = await wallet.getCAT20List(CAT_VERSION.V1, currentAccount.address, 1, 100);
          const cat20PriceMap =
            cat20List.length > 0 ? await wallet.getCAT20sPrice(cat20List.map((item) => item.tokenId)) : {};

          cat20List.forEach((cat20) => {
            const price = cat20PriceMap[cat20.tokenId];
            const value = price ? price.curPrice * parseFloat(cat20.amount) : 0;
            allAssets.push({
              id: cat20.tokenId,
              type: 'cat20' as const,
              name: cat20.symbol,
              symbol: cat20.symbol,
              amount: cat20.amount,
              value: value,
              usdValue: value > 0 ? `$${value.toFixed(2)}` : '-'
            });
          });
        } catch (e) {
          console.error('Failed to fetch CAT20:', e);
        }
      }

      // Fetch Simplicity tokens
      if (supportedAssetsRef.current.assets.simplicity) {
        try {
          const { list: simplicityList } = await wallet.getSimplicityTokensList(currentAccount.address, 1, 100);

          if (simplicityList.length > 0) {
            const tickers = simplicityList.map((token) => token.ticker);
            const priceMap = await wallet.getSimplicitysPrice(tickers);

            simplicityList.forEach((token) => {
              const price = priceMap[token.ticker];
              const tokenPrice = price ? price.curPrice : 0;
              const balance = parseFloat(token.balance);
              const valueInSats = balance * tokenPrice;

              allAssets.push({
                id: token.ticker,
                type: 'simplicity' as const,
                name: token.ticker,
                symbol: token.ticker,
                amount: token.balance,
                value: valueInSats,
                usdValue:
                  valueInSats > 0
                    ? `$${((valueInSats / 100000000) * (coinPriceRef.current?.btc || 0)).toFixed(2)}`
                    : '-'
              });
            });
          }
        } catch (e) {
          console.error('Failed to fetch Simplicity tokens:', e);
        }
      }

      // Sort by value (ascending)
      allAssets.sort((a, b) => a.value - b.value);

      if (DEBUG) console.log('✅ Assets fetch complete:', allAssets.length);
      return allAssets;
    } catch (error) {
      console.error('Failed to fetch assets data:', error);
      return [];
    }
  }, [fetchBTCData, currentAccount.address, btcUnit, wallet]);

  // Fonction pour charger les assets avec cache
  const loadAssets = useCallback(
    async (forceRefresh = false) => {
      if (!currentAccount.address) {
        setAssets([]);
        setLoading(false);
        return;
      }

      const currentParams = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;

      // Éviter les appels redondants
      if (!forceRefresh && lastFetchParams.current === currentParams && assets.length > 0) {
        if (DEBUG) console.log('⏭️ Skipping redundant fetch');
        return;
      }

      lastFetchParams.current = currentParams;
      const cacheKey = currentParams;

      // Vérifier le cache
      const cachedData = assetCacheService.getCachedData(cacheKey);

      if (cachedData && !forceRefresh) {
        setAssets(cachedData.assets);
        setLoading(false);
        if (DEBUG) console.log('💾 Loaded from cache:', cachedData.assets.length);
        return;
      }

      // Charger depuis l'API
      const shouldShowLoading = assets.length === 0;
      if (shouldShowLoading) {
        setLoading(true);
      } else {
        setIsRefreshing(true);
      }

      try {
        const fetchedAssets = forceRefresh
          ? await assetCacheService.forceRefresh(
              currentAccount.address,
              chainType,
              supportedAssets.key,
              fetchAssetsData
            )
          : await assetCacheService.getAssets(currentAccount.address, chainType, supportedAssets.key, fetchAssetsData);

        setAssets(fetchedAssets);
        if (DEBUG) console.log('🔄 Assets loaded:', fetchedAssets.length);
      } catch (error) {
        console.error('Failed to load assets:', error);
      } finally {
        setLoading(false);
        setIsRefreshing(false);
      }
    },
    [currentAccount.address, chainType, supportedAssets.key, fetchAssetsData, assets.length]
  );

  // Fonction pour refresh manuel
  const refreshAssets = useCallback(async () => {
    await loadAssets(true);
  }, [loadAssets]);

  // Mettre à jour les refs
  useEffect(() => {
    coinPriceRef.current = coinPrice;
  }, [coinPrice]);

  useEffect(() => {
    supportedAssetsRef.current = supportedAssets;
  }, [supportedAssets]);

  // Effet principal - charger les assets au montage ou changement de compte
  useEffect(() => {
    if (currentAccount.address) {
      loadAssets();
    }
  }, [currentAccount.address, chainType, supportedAssets.key, loadAssets]);

  // Mettre à jour les prix BTC en temps réel
  useEffect(() => {
    if (assets.length > 0 && coinPrice) {
      setAssets((prevAssets) =>
        prevAssets.map((asset) => {
          if (asset.type === 'btc') {
            const btcAmount = parseFloat(asset.amount);
            const btcValue = BTCService.calculateUSDValue(btcAmount, coinPrice.btc);
            return {
              ...asset,
              value: btcValue,
              usdValue: BTCService.formatUSDValue(btcValue)
            };
          }
          return asset;
        })
      );
    }
  }, [coinPrice, assets.length]);

  // Invalider le cache quand le balance BTC change
  useEffect(() => {
    if (currentAccount.address && accountBalance.totalBalance !== lastBalanceRef.current) {
      lastBalanceRef.current = accountBalance.totalBalance;
      assetCacheService.invalidateCacheForBalanceChange(currentAccount.address, chainType, supportedAssets.key);
      if (DEBUG) console.log('💰 BTC balance changed, cache invalidated');
    }
  }, [accountBalance.totalBalance, currentAccount.address, chainType, supportedAssets.key]);

  return {
    assets,
    loading,
    isRefreshing,
    refreshAssets
  };
};
