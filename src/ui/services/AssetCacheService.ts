import { Asset } from '@/ui-modern/components/wallet/ModernAssetsList';

import { PersistentAssetCache } from './PersistentAssetCache';

export interface CachedAssetData {
  assets: Asset[];
  lastUpdated: number;
  address: string;
  chainType: string;
  supportedAssetsKey: string;
}

export interface AssetCacheConfig {
  cacheExpiryMs: number; // 5 minutes par défaut
  backgroundRefreshMs: number; // 2 minutes pour refresh en arrière-plan
  maxCacheSize: number; // Limite de taille du cache
}

export class AssetCacheService {
  private cache = new Map<string, CachedAssetData>();
  private refreshTimers = new Map<string, NodeJS.Timeout>();
  private config: AssetCacheConfig;

  constructor(config: Partial<AssetCacheConfig> = {}) {
    this.config = {
      cacheExpiryMs: 5 * 60 * 1000, // 5 minutes
      backgroundRefreshMs: 2 * 60 * 1000, // 2 minutes
      maxCacheSize: 50,
      ...config
    };

    // Charger le cache persistant au démarrage
    this.loadPersistentCache();
  }

  private generateCacheKey(address: string, chainType: string, supportedAssetsKey: string): string {
    return `${address}-${chainType}-${supportedAssetsKey}`;
  }

  private isCacheValid(cachedData: CachedAssetData): boolean {
    return Date.now() - cachedData.lastUpdated < this.config.cacheExpiryMs;
  }

  // Méthode pour vérifier si des données sont en cache sans déclencher de fetch
  getCachedData(cacheKey: string): CachedAssetData | null {
    const cachedData = this.cache.get(cacheKey);
    if (cachedData && this.isCacheValid(cachedData)) {
      return cachedData;
    }
    return null;
  }

  async getAssets(
    address: string,
    chainType: string,
    supportedAssetsKey: string,
    fetchFn: () => Promise<Asset[]>
  ): Promise<Asset[]> {
    const cacheKey = this.generateCacheKey(address, chainType, supportedAssetsKey);
    const cachedData = this.cache.get(cacheKey);

    // Si le cache est valide, retourner les données mises en cache
    if (cachedData && this.isCacheValid(cachedData)) {
      // Démarrer un refresh en arrière-plan si pas déjà en cours
      this.scheduleBackgroundRefresh(cacheKey, fetchFn);
      return cachedData.assets;
    }

    // Sinon, récupérer les données et les mettre en cache
    return this.refreshAssets(cacheKey, address, chainType, supportedAssetsKey, fetchFn);
  }

  private async refreshAssets(
    cacheKey: string,
    address: string,
    chainType: string,
    supportedAssetsKey: string,
    fetchFn: () => Promise<Asset[]>
  ): Promise<Asset[]> {
    try {
      const assets = await fetchFn();
      const cachedData: CachedAssetData = {
        assets,
        lastUpdated: Date.now(),
        address,
        chainType,
        supportedAssetsKey
      };

      this.cache.set(cacheKey, cachedData);
      this.cleanupCache();

      // Sauvegarder dans le cache persistant
      await this.savePersistentCache();

      // Programmer le prochain refresh en arrière-plan
      this.scheduleBackgroundRefresh(cacheKey, fetchFn);

      return assets;
    } catch (error) {
      console.error('Failed to refresh assets:', error);
      // En cas d'erreur, retourner les données en cache si disponibles
      const cachedData = this.cache.get(cacheKey);
      return cachedData ? cachedData.assets : [];
    }
  }

  private scheduleBackgroundRefresh(cacheKey: string, fetchFn: () => Promise<Asset[]>) {
    // Annuler le timer existant s'il y en a un
    const existingTimer = this.refreshTimers.get(cacheKey);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Programmer un nouveau refresh
    const timer = setTimeout(async () => {
      try {
        const assets = await fetchFn();
        const cachedData = this.cache.get(cacheKey);
        if (cachedData) {
          cachedData.assets = assets;
          cachedData.lastUpdated = Date.now();
        }
      } catch (error) {
        console.error('Background refresh failed:', error);
      }
    }, this.config.backgroundRefreshMs);

    this.refreshTimers.set(cacheKey, timer);
  }

  private cleanupCache() {
    if (this.cache.size > this.config.maxCacheSize) {
      // Supprimer les entrées les plus anciennes
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].lastUpdated - b[1].lastUpdated);

      const toDelete = entries.slice(0, this.cache.size - this.config.maxCacheSize);
      toDelete.forEach(([key]) => {
        this.cache.delete(key);
        const timer = this.refreshTimers.get(key);
        if (timer) {
          clearTimeout(timer);
          this.refreshTimers.delete(key);
        }
      });
    }
  }

  // Méthode pour forcer un refresh (utile pour les actions utilisateur)
  async forceRefresh(
    address: string,
    chainType: string,
    supportedAssetsKey: string,
    fetchFn: () => Promise<Asset[]>
  ): Promise<Asset[]> {
    const cacheKey = this.generateCacheKey(address, chainType, supportedAssetsKey);
    this.cache.delete(cacheKey);
    return this.refreshAssets(cacheKey, address, chainType, supportedAssetsKey, fetchFn);
  }

  // Méthode pour invalider le cache quand le balance BTC change
  invalidateCacheForBalanceChange(address: string, chainType: string, supportedAssetsKey: string) {
    const cacheKey = this.generateCacheKey(address, chainType, supportedAssetsKey);
    const cachedData = this.cache.get(cacheKey);

    if (cachedData) {
      // Marquer le cache comme expiré pour forcer un refresh
      cachedData.lastUpdated = 0;
      console.log('Cache invalidated for balance change:', cacheKey);
    }
  }

  // Nettoyer le cache pour une adresse spécifique
  async clearCacheForAddress(address: string) {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) => key.startsWith(address));
    keysToDelete.forEach((key) => {
      this.cache.delete(key);
      const timer = this.refreshTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.refreshTimers.delete(key);
      }
    });

    // Nettoyer aussi le cache persistant
    await PersistentAssetCache.clearCacheForAddress(address);
  }

  // Nettoyer tout le cache
  clearAllCache() {
    this.cache.clear();
    this.refreshTimers.forEach((timer) => clearTimeout(timer));
    this.refreshTimers.clear();
  }

  // Charger le cache persistant
  private async loadPersistentCache() {
    try {
      const persistentCache = await PersistentAssetCache.loadCache();
      if (persistentCache) {
        // Fusionner avec le cache en mémoire
        persistentCache.forEach((value, key) => {
          this.cache.set(key, value);
        });
        console.log('Loaded persistent cache:', persistentCache.size, 'entries');
      }
    } catch (error) {
      console.error('Failed to load persistent cache:', error);
    }
  }

  // Sauvegarder le cache persistant
  private async savePersistentCache() {
    try {
      await PersistentAssetCache.saveCache(this.cache);
    } catch (error) {
      console.error('Failed to save persistent cache:', error);
    }
  }

  // Obtenir les statistiques du cache
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize,
      addresses: Array.from(new Set(Array.from(this.cache.values()).map((data) => data.address))),
      oldestEntry: Math.min(...Array.from(this.cache.values()).map((data) => data.lastUpdated)),
      newestEntry: Math.max(...Array.from(this.cache.values()).map((data) => data.lastUpdated))
    };
  }
}

// Instance singleton
export const assetCacheService = new AssetCacheService();
