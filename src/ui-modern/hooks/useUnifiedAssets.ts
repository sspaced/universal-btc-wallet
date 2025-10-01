import { useEffect, useState } from 'react';
import { useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChainType } from '@/ui/state/settings/hooks';
import { useSupportedAssets } from '@/ui/state/ui/hooks';
import { useWallet } from '@/ui/utils';
import { Asset } from '../components/wallet/ModernAssetsList';
import { CAT_VERSION } from '@/shared/types';

export const useUnifiedAssets = () => {
  const wallet = useWallet();
  const currentAccount = useCurrentAccount();
  const chainType = useChainType();
  const supportedAssets = useSupportedAssets();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllAssets = async () => {
      setLoading(true);
      const allAssets: Asset[] = [];

      try {
        // Fetch Runes
        if (supportedAssets.assets.runes) {
          try {
            const { list: runesList } = await wallet.getRunesList(currentAccount.address, 1, 100);
            const runesPriceMap = runesList.length > 0
              ? await wallet.getRunesPrice(runesList.map(item => item.spacedRune))
              : {};

            runesList.forEach((rune) => {
              const price = runesPriceMap[rune.spacedRune];
              const value = price ? parseFloat(price.price || '0') * parseFloat(rune.amount) : 0;
              allAssets.push({
                id: rune.runeid,
                type: 'rune',
                name: rune.spacedRune,
                symbol: rune.symbol || rune.spacedRune,
                amount: rune.amount,
                value: value,
                usdValue: value > 0 ? `$${value.toFixed(2)}` : '-',
                onClick: () => {
                  // Will be handled in ModernWalletTabScreen
                }
              });
            });
          } catch (e) {
            console.error('Failed to fetch runes:', e);
          }
        }

        // Fetch Alkanes
        if (supportedAssets.assets.alkanes) {
          try {
            const { list: alkanesList } = await wallet.getAlkanesList(currentAccount.address, 1, 100);
            const alkanesPriceMap = alkanesList.length > 0
              ? await wallet.getAlkanesPrice(alkanesList.map(item => item.alkaneid))
              : {};

            alkanesList.forEach((alkane) => {
              const price = alkanesPriceMap[alkane.alkaneid];
              const value = price ? parseFloat(price.price || '0') * parseFloat(alkane.amount) : 0;
              allAssets.push({
                id: alkane.alkaneid,
                type: 'alkane',
                name: alkane.alkanename,
                symbol: alkane.alkanename,
                amount: alkane.amount,
                value: value,
                usdValue: value > 0 ? `$${value.toFixed(2)}` : '-',
              });
            });
          } catch (e) {
            console.error('Failed to fetch alkanes:', e);
          }
        }

        // Fetch CAT20
        if (supportedAssets.assets.CAT20) {
          try {
            const { list: cat20List } = await wallet.getCAT20List(
              CAT_VERSION.CAT20,
              currentAccount.address,
              1,
              100
            );
            const cat20PriceMap = cat20List.length > 0
              ? await wallet.getCAT20sPrice(cat20List.map(item => item.tokenId))
              : {};

            cat20List.forEach((cat20) => {
              const price = cat20PriceMap[cat20.tokenId];
              const value = price ? parseFloat(price.price || '0') * parseFloat(cat20.amount) : 0;
              allAssets.push({
                id: cat20.tokenId,
                type: 'cat20',
                name: cat20.symbol,
                symbol: cat20.symbol,
                amount: cat20.amount,
                value: value,
                usdValue: value > 0 ? `$${value.toFixed(2)}` : '-',
              });
            });
          } catch (e) {
            console.error('Failed to fetch CAT20:', e);
          }
        }

        // Sort by value (descending)
        allAssets.sort((a, b) => b.value - a.value);

        setAssets(allAssets);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentAccount.address) {
      fetchAllAssets();
    }
  }, [currentAccount.address, chainType, supportedAssets.key]);

  return { assets, loading };
};
