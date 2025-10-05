# Intégration des Prix des Tokens Simplicity

## Vue d'ensemble

Cette implémentation ajoute le support pour récupérer et afficher les prix des tokens Simplicity en utilisant l'API BlackNode. Les prix sont récupérés en satoshis et convertis en dollars américains.

## Fonctionnalités Ajoutées

### 1. Service SimplicityService

**Fichier:** `src/background/service/simplicity.ts`

Nouvelles méthodes ajoutées :

- `getSimplicityTokenPrice(ticker: string)` - Récupère le prix d'un token spécifique
- `getSimplicityTokensPrice(tickers: string[])` - Récupère les prix de plusieurs tokens

### 2. WalletController

**Fichier:** `src/background/controller/wallet.ts`

Nouvelle méthode ajoutée :

- `getSimplicitysPrice(ticks: string[])` - Interface pour récupérer les prix des tokens Simplicity

### 3. Interface Utilisateur

**Fichier:** `src/ui/components/TickUsd/index.tsx`

Le composant `TickUsdWithoutPrice` supporte maintenant le type `TokenType.SIMPLICITY` pour afficher les prix des tokens Simplicity.

**Fichier:** `src/ui-modern/hooks/useUnifiedAssets.ts`

Le hook `useUnifiedAssets` affiche maintenant les valeurs USD des tokens Simplicity dans la liste des actifs unifiés.

## API Utilisée

### BlackNode API

- **Endpoint:** `https://www.blacknode.co/api/market/v1/brc20/ticker/<ticker>`
- **Méthode:** GET
- **Réponse:** JSON avec les statistiques du ticker

### Structure de la Réponse

```json
{
  "code": 0,
  "msg": "Ticker stats retrieved successfully.",
  "data": {
    "total_listings": "1763",
    "active_listings": "76",
    "total_trades_for_ticker": "568",
    "total_volume_token_amount_for_ticker": "9661017",
    "total_volume_satoshis_for_ticker": "93545123",
    "avg_price_per_token_traded_for_ticker": "202.8802816901408451",
    "min_price_per_token_traded_for_ticker": "1",
    "max_price_per_token_traded_for_ticker": "88888",
    "current_floor_price_satoshis_active_listings": "24.8800000000000000"
  }
}
```

### Prix Utilisé

Le prix utilisé est `current_floor_price_satoshis_active_listings`, qui représente le prix minimum actuel des listings actifs en satoshis.

## Conversion des Prix

### Satoshis → BTC → USD

1. **Prix en satoshis** : Récupéré directement de l'API BlackNode
2. **Conversion en BTC** : `prix_satoshis / 100,000,000`
3. **Conversion en USD** : `prix_btc * prix_btc_usd`

### Exemple de Calcul

```
Prix token: 24.88 satoshis
Prix en BTC: 24.88 / 100,000,000 = 0.0000002488 BTC
Prix en USD: 0.0000002488 * 50,000 = $0.01244
```

## Utilisation

### 1. Récupérer le Prix d'un Token

```typescript
const wallet = useWallet();
const priceMap = await wallet.getSimplicitysPrice(['ORDI']);
const ordiPrice = priceMap['ORDI'];
console.log(`Prix ORDI: ${ordiPrice.curPrice} satoshis`);
```

### 2. Afficher le Prix dans l'Interface

```tsx
<TickUsdWithoutPrice tick="ORDI" balance="1000" type={TokenType.SIMPLICITY} />
```

### 3. Composant de Test

Un composant de test est disponible dans `src/ui/components/SimplicityPriceTest.tsx` pour tester la récupération des prix.

## Gestion des Erreurs

- Les erreurs de l'API sont capturées et loggées
- En cas d'échec, les prix sont définis à 0
- Les tokens sans prix affichent "-" dans l'interface

## Cache et Performance

- Les prix sont récupérés à la demande
- Pas de cache implémenté actuellement
- Les appels API sont faits en parallèle pour plusieurs tokens

## Limitations

1. **Pas de données de changement de prix** : L'API BlackNode ne fournit pas de pourcentage de changement
2. **Prix en temps réel** : Les prix ne sont pas mis à jour automatiquement
3. **Dépendance à l'API externe** : La fonctionnalité dépend de la disponibilité de l'API BlackNode

## Tests

Pour tester l'implémentation :

1. Utilisez le composant `SimplicityPriceTest` avec un ticker valide
2. Vérifiez que les prix s'affichent correctement dans `useUnifiedAssets`
3. Testez l'affichage des prix dans `TickUsdWithoutPrice`

## Exemple de Tickers Testés

- ORDI
- SATS
- BRC20
- Autres tokens BRC-20 supportés par BlackNode
