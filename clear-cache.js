// Script pour vider le cache des assets et forcer un rechargement
console.log('🧹 Nettoyage du cache des assets...');

// Simuler l'accès au service de cache
const { assetCacheService } = require('./src/ui/services/AssetCacheService.ts');

// Vider tout le cache
assetCacheService.clearAllCache();

console.log('✅ Cache vidé avec succès !');
console.log('📊 Statistiques du cache:', assetCacheService.getCacheStats());
console.log('🔄 Les assets seront rechargés avec le bon tri lors du prochain accès.');
