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

export const useCachedUnifiedAssets = () => {
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const accountBalance = useAccountBalance();
  const chainType = useChainType();
  const btcUnit = useBTCUnit();
  const supportedAssets = useSupportedAssets();
  const { coinPrice } = usePrice();

  const [assets, setAssets] = useState<Asset[]>(() => {
    // Initialiser les assets avec le cache si disponible
    if (currentAccount.address) {
      const cacheKey = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
      const cachedData = assetCacheService.getCachedData(cacheKey);
      if (cachedData) {
        console.log('Initializing assets from cache:', cachedData.assets.length);
        return cachedData.assets;
      }
    }
    return [];
  });
  const [loading, setLoading] = useState(() => {
    // État initial intelligent : vérifier le cache au moment de l'initialisation
    if (currentAccount.address) {
      const cacheKey = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
      const cachedData = assetCacheService.getCachedData(cacheKey);
      console.log('Initial loading state check:', {
        hasCache: !!cachedData,
        cacheKey,
        initialLoading: !cachedData
      });
      return !cachedData; // loading = false si cache disponible
    }
    return true;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasInitialLoad, setHasInitialLoad] = useState(() => {
    // Si on a du cache, on considère qu'on a déjà fait un chargement initial
    if (currentAccount.address) {
      const cacheKey = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
      const cachedData = assetCacheService.getCachedData(cacheKey);
      return !!cachedData;
    }
    return false;
  });

  // Ref pour éviter les re-renders inutiles
  const lastFetchParams = useRef<string>('');
  const isInitialized = useRef<boolean>(false);
  const assetsRef = useRef<Asset[]>([]);
  const lastBalanceRef = useRef<number>(0);
  const coinPriceRef = useRef(coinPrice);
  const supportedAssetsRef = useRef(supportedAssets);

  // Convert satoshis to BTC
  const satoshisToAmount = (satoshis: number): string => {
    return (satoshis / 100000000).toFixed(8);
  };

  // Fonction de récupération des données BTC (unifiée avec le cache)
  const fetchBTCData = useCallback(async (): Promise<Asset[]> => {
    console.log('=== FETCHING BTC DATA ===');
    console.log('Account balance:', accountBalance);
    console.log('BTC unit:', btcUnit);
    console.log('Coin price:', coinPriceRef.current);

    const btcAssets: Asset[] = [];

    try {
      // Récupérer le balance BTC via l'API wallet (comme les autres tokens)
      const btcBalance = await BTCService.getBTCBalance(currentAccount.address, wallet);
      console.log('BTC balance from API:', btcBalance);

      // Créer l'asset BTC unifié
      const btcAsset = BTCService.createBTCAsset(btcBalance, coinPriceRef.current?.btc || 0, btcUnit);

      if (btcAsset) {
        console.log('=== BTC ASSET DEBUG ===');
        console.log('BTC balance stats:', BTCService.getBalanceStats(btcBalance));
        console.log('BTC asset created:', btcAsset);
        btcAssets.push(btcAsset);
      } else {
        console.log('No BTC balance found');
      }
    } catch (error) {
      console.error('Failed to fetch BTC data:', error);
    }

    return btcAssets;
  }, [currentAccount.address, btcUnit, wallet]);

  // Fonction de récupération des assets (logique extraite du hook original)
  const fetchAssetsData = useCallback(async (): Promise<Asset[]> => {
    console.log('=== FETCHING ASSETS DATA ===');
    console.log('Current account:', currentAccount);
    console.log('Account balance:', accountBalance);
    console.log('BTC unit:', btcUnit);
    console.log('Coin price:', coinPriceRef.current);
    console.log('Supported assets:', supportedAssetsRef.current);

    const allAssets: Asset[] = [];

    try {
      // Fetch BTC first (now using unified cache system)
      const btcAssets = await fetchBTCData();
      allAssets.push(...btcAssets);

      // Fetch Runes
      if (supportedAssetsRef.current.assets.runes) {
        console.log('=== FETCHING RUNES ===');
        try {
          const { list: runesList } = await wallet.getRunesList(currentAccount.address, 1, 100);
          console.log('Runes list:', runesList);

          const runesPriceMap =
            runesList.length > 0 ? await wallet.getRunesPrice(runesList.map((item) => item.spacedRune)) : {};
          console.log('Runes price map:', runesPriceMap);

          runesList.forEach((rune) => {
            const price = runesPriceMap[rune.spacedRune];
            const value = price ? price.curPrice * parseFloat(rune.amount) : 0;
            const runeAsset = {
              id: rune.runeid,
              type: 'rune' as const,
              name: rune.spacedRune,
              symbol: rune.symbol || rune.spacedRune,
              amount: rune.amount,
              value: value,
              usdValue: value > 0 ? `$${value.toFixed(2)}` : '-'
            };
            console.log('Rune asset created:', runeAsset);
            allAssets.push(runeAsset);
          });
        } catch (e) {
          console.error('Failed to fetch runes:', e);
        }
      } else {
        console.log('Runes not supported');
      }

      // Fetch Alkanes
      if (supportedAssetsRef.current.assets.alkanes) {
        console.log('=== FETCHING ALKANES ===');
        try {
          const { list: alkanesList } = await wallet.getAlkanesList(currentAccount.address, 1, 100);
          console.log('Alkanes list:', alkanesList);

          const alkanesPriceMap =
            alkanesList.length > 0 ? await wallet.getAlkanesPrice(alkanesList.map((item) => item.alkaneid)) : {};
          console.log('Alkanes price map:', alkanesPriceMap);

          alkanesList.forEach((alkane) => {
            const price = alkanesPriceMap[alkane.alkaneid];
            const value = price ? price.curPrice * parseFloat(alkane.amount) : 0;
            const alkaneAsset = {
              id: alkane.alkaneid,
              type: 'alkane' as const,
              name: alkane.name,
              symbol: alkane.symbol,
              amount: alkane.amount,
              value: value,
              usdValue: value > 0 ? `$${value.toFixed(2)}` : '-'
            };
            console.log('Alkane asset created:', alkaneAsset);
            allAssets.push(alkaneAsset);
          });
        } catch (e) {
          console.error('Failed to fetch alkanes:', e);
        }
      } else {
        console.log('Alkanes not supported');
      }

      // Fetch CAT20
      if (supportedAssetsRef.current.assets.CAT20) {
        console.log('=== FETCHING CAT20 ===');
        try {
          const { list: cat20List } = await wallet.getCAT20List(CAT_VERSION.V1, currentAccount.address, 1, 100);
          console.log('CAT20 list:', cat20List);

          const cat20PriceMap =
            cat20List.length > 0 ? await wallet.getCAT20sPrice(cat20List.map((item) => item.tokenId)) : {};
          console.log('CAT20 price map:', cat20PriceMap);

          cat20List.forEach((cat20) => {
            const price = cat20PriceMap[cat20.tokenId];
            const value = price ? price.curPrice * parseFloat(cat20.amount) : 0;
            const cat20Asset = {
              id: cat20.tokenId,
              type: 'cat20' as const,
              name: cat20.symbol,
              symbol: cat20.symbol,
              amount: cat20.amount,
              value: value,
              usdValue: value > 0 ? `$${value.toFixed(2)}` : '-'
            };
            console.log('CAT20 asset created:', cat20Asset);
            allAssets.push(cat20Asset);
          });
        } catch (e) {
          console.error('Failed to fetch CAT20:', e);
        }
      } else {
        console.log('CAT20 not supported');
      }

      // Fetch Simplicity tokens
      if (supportedAssetsRef.current.assets.simplicity) {
        console.log('=== FETCHING SIMPLICITY TOKENS ===');
        try {
          const { list: simplicityList } = await wallet.getSimplicityTokensList(currentAccount.address, 1, 100);
          console.log('Simplicity list:', simplicityList);

          if (simplicityList.length > 0) {
            // Get prices for all Simplicity tokens
            const tickers = simplicityList.map((token) => token.ticker);
            const priceMap = await wallet.getSimplicitysPrice(tickers);
            console.log('Simplicity price map:', priceMap);

            simplicityList.forEach((token) => {
              const price = priceMap[token.ticker];
              const tokenPrice = price ? price.curPrice : 0;
              const balance = parseFloat(token.balance);
              const valueInSats = balance * tokenPrice;

              const simplicityAsset = {
                id: token.ticker,
                type: 'simplicity' as const,
                name: token.ticker,
                symbol: token.ticker,
                amount: token.balance,
                value: valueInSats, // Value in satoshis
                usdValue:
                  valueInSats > 0
                    ? `$${((valueInSats / 100000000) * (coinPriceRef.current?.btc || 0)).toFixed(2)}`
                    : '-'
              };
              console.log('Simplicity asset created:', simplicityAsset);
              allAssets.push(simplicityAsset);
            });
          }
        } catch (e) {
          console.error('Failed to fetch Simplicity tokens:', e);
        }
      } else {
        console.log('Simplicity not supported');
      }

      console.log('=== ALL ASSETS BEFORE SORTING ===');
      console.log('Total assets found:', allAssets.length);
      allAssets.forEach((asset, index) => {
        console.log(`Asset ${index + 1}:`, {
          id: asset.id,
          type: asset.type,
          name: asset.name,
          symbol: asset.symbol,
          amount: asset.amount,
          value: asset.value,
          usdValue: asset.usdValue
        });
      });

      // Sort by value (ascending) - assets with lowest value first
      allAssets.sort((a, b) => a.value - b.value);

      console.log('=== ALL ASSETS AFTER SORTING ===');
      allAssets.forEach((asset, index) => {
        console.log(`Asset ${index + 1}:`, {
          id: asset.id,
          type: asset.type,
          name: asset.name,
          symbol: asset.symbol,
          amount: asset.amount,
          value: asset.value,
          usdValue: asset.usdValue
        });
      });

      console.log('=== ASSETS FETCH COMPLETE ===');
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
        setHasInitialLoad(false);
        return;
      }

      const currentParams = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;

      // Éviter les appels redondants
      if (!forceRefresh && lastFetchParams.current === currentParams && assetsRef.current.length > 0) {
        console.log('Skipping redundant asset fetch for same parameters');
        return;
      }

      // Si on a déjà des assets et qu'on fait un refresh silencieux, ne pas afficher le loading
      const isSilentRefresh = !forceRefresh && assetsRef.current.length > 0 && hasInitialLoad;

      lastFetchParams.current = currentParams;

      // Vérifier d'abord si on a des assets en cache
      const cacheKey = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
      const cachedData = assetCacheService.getCachedData(cacheKey);

      if (cachedData && !forceRefresh) {
        // Assets en cache, pas besoin de loading
        setAssets(cachedData.assets);
        assetsRef.current = cachedData.assets;
        setLoading(false);
        setHasInitialLoad(true);
        console.log('Assets loaded from cache instantly:', cachedData.assets.length);
        return;
      }

      // Pas de cache ou force refresh, afficher le loading seulement si c'est le premier chargement
      if (!hasInitialLoad) {
        setLoading(true);
      } else if (!isSilentRefresh) {
        setIsRefreshing(true);
      }

      try {
        let fetchedAssets: Asset[];

        if (forceRefresh) {
          console.log('Force refreshing assets...');
          fetchedAssets = await assetCacheService.forceRefresh(
            currentAccount.address,
            chainType,
            supportedAssets.key,
            fetchAssetsData
          );
        } else {
          console.log('Loading assets from API...');
          fetchedAssets = await assetCacheService.getAssets(
            currentAccount.address,
            chainType,
            supportedAssets.key,
            fetchAssetsData
          );
        }

        setAssets(fetchedAssets);
        assetsRef.current = fetchedAssets; // Mettre à jour la ref
        setHasInitialLoad(true);
        console.log('Assets loaded successfully:', fetchedAssets.length);
      } catch (error) {
        console.error('Failed to load assets:', error);
      } finally {
        if (!isSilentRefresh) {
          setLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [currentAccount.address, chainType, supportedAssets.key, fetchAssetsData, hasInitialLoad]
  );

  // Fonction pour refresh manuel
  const refreshAssets = useCallback(async () => {
    await loadAssets(true);
  }, [loadAssets]);

  // Initialiser les refs avec le cache au premier chargement
  useEffect(() => {
    if (!isInitialized.current && currentAccount.address) {
      isInitialized.current = true;

      // Initialiser les refs avec le cache si disponible
      const cacheKey = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
      const cachedData = assetCacheService.getCachedData(cacheKey);

      if (cachedData) {
        console.log('Initializing refs with cached data:', cachedData.assets.length);
        assetsRef.current = cachedData.assets;
        lastFetchParams.current = cacheKey;
      }

      // Le cache persistant sera chargé automatiquement par le service
      console.log('Initializing asset cache for address:', currentAccount.address);
    }
  }, [currentAccount.address, chainType, supportedAssets.key]);

  // Réinitialiser l'état quand on change d'adresse
  useEffect(() => {
    if (currentAccount.address) {
      const currentParams = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
      if (lastFetchParams.current !== currentParams) {
        console.log('[Asset Switch] Address changed, resetting state and clearing assets');
        
        // Réinitialiser complètement l'état
        setHasInitialLoad(false);
        setAssets([]); // Vider immédiatement les assets pour éviter d'afficher l'ancien compte
        assetsRef.current = [];
        lastFetchParams.current = '';
        
        // Vérifier immédiatement si on a du cache pour le nouveau compte
        const cacheKey = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
        const cachedData = assetCacheService.getCachedData(cacheKey);
        
        if (cachedData) {
          console.log('[Asset Switch] Found cache for new account, loading immediately');
          setAssets(cachedData.assets);
          assetsRef.current = cachedData.assets;
          setHasInitialLoad(true);
          lastFetchParams.current = currentParams;
          setLoading(false);
        } else {
          console.log('[Asset Switch] No cache for new account, will load from API');
          setLoading(true);
        }
      }
    }
  }, [currentAccount.address, chainType, supportedAssets.key]);

  // Initialiser la ref des assets
  useEffect(() => {
    assetsRef.current = assets;
  }, [assets]);

  // Mettre à jour les refs pour éviter les re-renders
  useEffect(() => {
    coinPriceRef.current = coinPrice;
  }, [coinPrice]);

  useEffect(() => {
    supportedAssetsRef.current = supportedAssets;
  }, [supportedAssets]);

  // Effet principal - se déclenche seulement quand les paramètres critiques changent
  useEffect(() => {
    if (currentAccount.address) {
      const currentParams = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;

      // Si on a déjà les bonnes données chargées, ne rien faire
      if (lastFetchParams.current === currentParams && assetsRef.current.length > 0 && hasInitialLoad) {
        console.log('Assets already loaded for this address, skipping loadAssets');
        return;
      }

      // Si on a déjà des assets (initialisés depuis le cache), programmer juste un refresh en arrière-plan
      if (assetsRef.current.length > 0 && hasInitialLoad) {
        console.log('Assets already initialized from cache, scheduling background refresh');
        setTimeout(() => {
          loadAssets(false); // Refresh silencieux en arrière-plan
        }, 100);
        return;
      }

      // Vérifier le cache au montage du composant (fallback)
      const cacheKey = `${currentAccount.address}-${chainType}-${supportedAssets.key}`;
      const cachedData = assetCacheService.getCachedData(cacheKey);

      if (cachedData) {
        // Assets en cache, les charger immédiatement sans loading
        console.log('Assets found in cache on mount, loading instantly:', cachedData.assets.length);
        setAssets(cachedData.assets);
        assetsRef.current = cachedData.assets;
        setLoading(false);
        setHasInitialLoad(true);
        lastFetchParams.current = currentParams;

        // Programmer un refresh en arrière-plan si nécessaire
        setTimeout(() => {
          loadAssets(false); // Refresh silencieux en arrière-plan
        }, 100);
        return;
      }

      // Pas de cache, charger normalement
      loadAssets();
    }
  }, [currentAccount.address, chainType, supportedAssets.key, loadAssets, hasInitialLoad]);

  // Effet pour mettre à jour les prix BTC en temps réel (sans recharger tout)
  useEffect(() => {
    if (assets.length > 0 && coinPrice) {
      setAssets((prevAssets) => {
        const updatedAssets = prevAssets.map((asset) => {
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
        });
        assetsRef.current = updatedAssets; // Mettre à jour la ref
        return updatedAssets;
      });
    }
  }, [coinPrice, assets.length]);

  // Effet pour mettre à jour le cache quand le balance BTC change
  useEffect(() => {
    if (currentAccount.address && accountBalance.totalBalance !== lastBalanceRef.current) {
      lastBalanceRef.current = accountBalance.totalBalance;
      // Invalider le cache pour forcer un refresh du BTC
      assetCacheService.invalidateCacheForBalanceChange(currentAccount.address, chainType, supportedAssets.key);
      console.log('BTC balance changed, cache invalidated');
    }
  }, [accountBalance.totalBalance, currentAccount.address, chainType, supportedAssets.key]);

  // Nettoyer le cache quand on change d'adresse
  useEffect(() => {
    return () => {
      // Nettoyer les timers de refresh en arrière-plan quand le composant se démonte
      // Le service gère déjà cela, mais on peut ajouter une logique supplémentaire si nécessaire
    };
  }, [currentAccount.address]);

  return {
    assets,
    loading,
    isRefreshing,
    refreshAssets
  };
};
