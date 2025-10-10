# Services de Cache Unifié pour Assets

## Vue d'ensemble

Ce système unifie le traitement de tous les assets (BTC, Runes, Alkanes, CAT20, Simplicity) dans un système de cache cohérent et performant.

## Services

### 1. AssetCacheService

Service principal de cache en mémoire avec gestion multi-adresses.

**Fonctionnalités :**

- Cache par adresse avec clés uniques
- Gestion des timers de refresh en arrière-plan
- Nettoyage automatique du cache
- Invalidation intelligente du cache

**Méthodes principales :**

- `getAssets()` - Récupère les assets avec cache
- `forceRefresh()` - Force un refresh complet
- `invalidateCacheForBalanceChange()` - Invalide le cache lors de changements de balance
- `clearCacheForAddress()` - Nettoie le cache pour une adresse

### 2. PersistentAssetCache

Service de cache persistant utilisant `chrome.storage.local`.

**Fonctionnalités :**

- Sauvegarde automatique dans le stockage local
- Limitation du nombre d'adresses (10 max)
- Gestion de l'âge du cache (24h max)
- Nettoyage par adresse

### 3. BTCService

Service unifié pour la gestion du BTC, maintenant traité comme les autres tokens.

**Fonctionnalités :**

- Récupération du balance BTC via API
- Conversion satoshis/BTC
- Calcul des valeurs USD
- Création d'assets BTC unifiés
- Détection des changements de balance

## Hook useCachedUnifiedAssets

Hook optimisé qui remplace `useUnifiedAssets` avec les améliorations suivantes :

### Avantages

1. **Cache unifié** : Tous les assets (BTC inclus) utilisent le même système de cache
2. **Performance** : Pas de rechargement à chaque changement de page
3. **Multi-adresses** : Chaque adresse a son propre cache isolé
4. **Refresh intelligent** : Mise à jour en arrière-plan toutes les 2 minutes
5. **Persistance** : Les données survivent aux redémarrages
6. **Gestion mémoire** : Nettoyage automatique des caches non utilisés

### Changements apportés

#### Avant (useUnifiedAssets)

```typescript
// BTC récupéré depuis Redux state
const accountBalance = useAccountBalance();
// Autres tokens récupérés via API directe
const runesList = await wallet.getRunesList();
```

#### Après (useCachedUnifiedAssets)

```typescript
// Tous les assets (BTC inclus) récupérés via API et mis en cache
const btcAssets = await fetchBTCData(); // Utilise BTCService
const runesList = await wallet.getRunesList(); // Même API mais avec cache
```

## Architecture du Cache

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Component  │───▶│ useCachedUnified │───▶│ AssetCacheService│
│                 │    │     Assets       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
                       ┌──────────────────┐    ┌─────────────────┐
                       │   BTCService     │    │PersistentAsset  │
                       │                  │    │     Cache       │
                       └──────────────────┘    └─────────────────┘
```

## Clés de Cache

Format : `{address}-{chainType}-{supportedAssetsKey}`

Exemples :

- `bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4-mainnet-ordinals,runes,alkanes`
- `bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh-testnet-ordinals,runes`

## Cycle de Vie du Cache

1. **Premier chargement** : Récupération depuis l'API + mise en cache
2. **Chargements suivants** : Récupération depuis le cache (instantané)
3. **Refresh en arrière-plan** : Mise à jour automatique toutes les 2 minutes
4. **Invalidation** : Cache invalidé lors de changements de balance
5. **Nettoyage** : Suppression automatique des caches expirés

## Configuration

```typescript
const config = {
  cacheExpiryMs: 5 * 60 * 1000, // 5 minutes
  backgroundRefreshMs: 2 * 60 * 1000, // 2 minutes
  maxCacheSize: 50, // 50 entrées max
  maxAddresses: 10, // 10 adresses max en cache persistant
  maxAge: 24 * 60 * 60 * 1000 // 24 heures max
};
```

## Utilisation

```typescript
// Dans un composant
const { assets, loading, isRefreshing, refreshAssets } = useCachedUnifiedAssets();

// Refresh manuel
const handleRefresh = () => {
  refreshAssets();
};
```

## Avantages pour le BTC

1. **Unification** : Le BTC est maintenant traité comme les autres tokens
2. **Cache intelligent** : Pas de rechargement inutile du BTC
3. **API cohérente** : Utilise `wallet.getAddressBalanceV2()` comme les autres tokens
4. **Gestion des changements** : Invalidation automatique lors de changements de balance
5. **Performance** : Chargement instantané depuis le cache

## Migration

Pour migrer d'`useUnifiedAssets` vers `useCachedUnifiedAssets` :

1. Remplacer l'import :

   ```typescript
   // Avant
   // Après
   import { useCachedUnifiedAssets } from '../hooks/useCachedUnifiedAssets';
   import { useUnifiedAssets } from '../hooks/useUnifiedAssets';
   ```

2. Remplacer l'utilisation :

   ```typescript
   // Avant
   const { assets, loading } = useUnifiedAssets();

   // Après
   const { assets, loading, isRefreshing, refreshAssets } = useCachedUnifiedAssets();
   ```

3. Utiliser les nouvelles fonctionnalités :

   ```typescript
   // Refresh manuel
   const handleRefresh = () => {
     refreshAssets();
   };

   // Indicateur de refresh
   <button disabled={isRefreshing}>Refresh</button>;
   ```

