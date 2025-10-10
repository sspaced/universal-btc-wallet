# Optimisations du Hook useCachedUnifiedAssets

## Problème résolu : Chargement constant dans la page asset du flow send

### 🔍 **Problèmes identifiés :**

1. **Dépendances instables dans `fetchAssetsData`** :

   - `coinPrice` change constamment
   - `supportedAssets` est un objet qui change à chaque render
   - `wallet` peut changer

2. **Chaîne de dépendances circulaires** :

   - `fetchAssetsData` change → `loadAssets` change → effet principal se redéclenche
   - Boucle infinie de re-renders

3. **Re-création constante des callbacks** :
   - Chaque changement de prix ou d'assets recrée les fonctions
   - Déclenche des re-fetch inutiles

### ✅ **Solutions implémentées :**

#### 1. **Utilisation de refs pour les valeurs instables**

```typescript
const coinPriceRef = useRef(coinPrice);
const supportedAssetsRef = useRef(supportedAssets);
```

#### 2. **Stabilisation des dépendances de `fetchBTCData`**

```typescript
// Avant
[fetchBTCData, currentAccount.address, supportedAssets, coinPrice, btcUnit, wallet][
  // Après
  (fetchBTCData, currentAccount.address, btcUnit, wallet)
];
```

#### 3. **Stabilisation des dépendances de `fetchAssetsData`**

```typescript
// Avant
[fetchBTCData, currentAccount.address, supportedAssets, coinPrice, btcUnit, wallet][
  // Après
  (fetchBTCData, currentAccount.address, btcUnit, wallet)
];
```

#### 4. **Utilisation des refs dans les fonctions**

```typescript
// Utilisation de coinPriceRef.current au lieu de coinPrice
const btcAsset = BTCService.createBTCAsset(btcBalance, coinPriceRef.current?.btc || 0, btcUnit);

// Utilisation de supportedAssetsRef.current au lieu de supportedAssets
if (supportedAssetsRef.current.assets.runes) {
```

#### 5. **Mise à jour des refs via des effets dédiés**

```typescript
useEffect(() => {
  coinPriceRef.current = coinPrice;
}, [coinPrice]);

useEffect(() => {
  supportedAssetsRef.current = supportedAssets;
}, [supportedAssets]);
```

### 🚀 **Résultats attendus :**

1. **✅ Pas de re-création constante** : Les callbacks ne se recréent plus à chaque changement de prix
2. **✅ Cache stable** : Le cache fonctionne correctement sans invalidation inutile
3. **✅ Chargement instantané** : Les assets se chargent depuis le cache
4. **✅ Performance optimisée** : Pas de re-fetch inutiles
5. **✅ Page asset sans chargement constant** : Le loading state se stabilise

### 📊 **Impact sur les performances :**

- **Avant** : Re-fetch à chaque changement de prix (toutes les secondes)
- **Après** : Fetch initial + cache + refresh en arrière-plan seulement

- **Avant** : Boucle infinie de re-renders
- **Après** : Renders optimisés avec refs

- **Avant** : Chargement constant dans select_asset
- **Après** : Chargement instantané depuis le cache

### 🔧 **Architecture optimisée :**

```
Hook useCachedUnifiedAssets
├── Refs stables (coinPriceRef, supportedAssetsRef)
├── Callbacks stabilisés (fetchBTCData, fetchAssetsData)
├── Cache intelligent (AssetCacheService)
└── Effets optimisés (dépendances minimales)
```

### 🎯 **Tests de validation :**

1. **Navigation vers select_asset** : Chargement instantané
2. **Changement de prix BTC** : Mise à jour sans re-fetch
3. **Changement d'adresse** : Cache isolé par adresse
4. **Refresh manuel** : Fonctionne correctement
5. **Performance** : Pas de lag ou de chargement constant

