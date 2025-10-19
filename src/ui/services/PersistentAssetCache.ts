import { CachedAssetData } from './AssetCacheService';

export class PersistentAssetCache {
  private static readonly STORAGE_KEY = 'unified-assets-cache';
  private static readonly MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 heures
  private static readonly MAX_ADDRESSES = 10; // Limiter le nombre d'adresses en cache

  static async saveCache(cacheData: Map<string, CachedAssetData>): Promise<void> {
    try {
      // Convertir en objet pour le stockage
      const serializedData = Array.from(cacheData.entries());

      // Limiter le nombre d'adresses en cache
      const limitedData = this.limitCacheByAddresses(serializedData);

      await chrome.storage.local.set({
        [this.STORAGE_KEY]: {
          data: limitedData,
          timestamp: Date.now()
        }
      });
    } catch (error) {
      console.error('Failed to save cache to storage:', error);
    }
  }

  private static limitCacheByAddresses(data: [string, CachedAssetData][]): [string, CachedAssetData][] {
    // Grouper par adresse
    const addressGroups = new Map<string, [string, CachedAssetData][]>();

    data.forEach(([key, value]) => {
      const address = value.address;
      if (!addressGroups.has(address)) {
        addressGroups.set(address, []);
      }
      addressGroups.get(address)!.push([key, value]);
    });

    // Garder seulement les adresses les plus récemment utilisées
    const sortedAddresses = Array.from(addressGroups.entries())
      .sort((a, b) => {
        const aLatest = Math.max(...a[1].map(([, data]) => data.lastUpdated));
        const bLatest = Math.max(...b[1].map(([, data]) => data.lastUpdated));
        return bLatest - aLatest;
      })
      .slice(0, this.MAX_ADDRESSES);

    // Reconstituer les données limitées
    return sortedAddresses.flatMap(([, entries]) => entries);
  }

  static async loadCache(): Promise<Map<string, CachedAssetData> | null> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const cacheData = result[this.STORAGE_KEY];

      if (!cacheData || !cacheData.data) {
        return null;
      }

      // Vérifier l'âge du cache
      if (Date.now() - cacheData.timestamp > this.MAX_AGE_MS) {
        await this.clearCache();
        return null;
      }

      return new Map(cacheData.data);
    } catch (error) {
      console.error('Failed to load cache from storage:', error);
      return null;
    }
  }

  // Nettoyer le cache pour une adresse spécifique
  static async clearCacheForAddress(address: string): Promise<void> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const cacheData = result[this.STORAGE_KEY];

      if (cacheData && cacheData.data) {
        const filteredData = cacheData.data.filter(
          ([key, value]: [string, CachedAssetData]) => !key.startsWith(address)
        );

        await chrome.storage.local.set({
          [this.STORAGE_KEY]: {
            ...cacheData,
            data: filteredData
          }
        });
      }
    } catch (error) {
      console.error('Failed to clear cache for address:', error);
    }
  }

  static async clearCache(): Promise<void> {
    try {
      await chrome.storage.local.remove(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear cache from storage:', error);
    }
  }

  // Obtenir les statistiques du cache persistant
  static async getCacheStats(): Promise<{
    size: number;
    addresses: string[];
    oldestEntry: number;
    newestEntry: number;
    age: number;
  } | null> {
    try {
      const result = await chrome.storage.local.get(this.STORAGE_KEY);
      const cacheData = result[this.STORAGE_KEY];

      if (!cacheData || !cacheData.data) {
        return null;
      }

      const data = cacheData.data as [string, CachedAssetData][];
      const addresses = Array.from(new Set(data.map(([, value]) => value.address)));
      const timestamps = data.map(([, value]) => value.lastUpdated);

      return {
        size: data.length,
        addresses,
        oldestEntry: Math.min(...timestamps),
        newestEntry: Math.max(...timestamps),
        age: Date.now() - cacheData.timestamp
      };
    } catch (error) {
      console.error('Failed to get cache stats:', error);
      return null;
    }
  }
}

