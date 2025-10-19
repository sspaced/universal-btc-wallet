# Analyse de sécurité - Problème de vérification de mot de passe

## Problème identifié

Le système actuel permet de taper n'importe quel mot de passe pour accéder à la phrase secrète car :

1. **KeyringService utilise MemoryStorageAdapter** : Pas de vraie persistance
2. **submitPassword() ne fait pas de vraie vérification** : Accepte n'importe quel mot de passe
3. **verifyPassword() n'est pas utilisé correctement** : Même problème

## Solutions implémentées

### 1. Verrouillage forcé avant vérification

```typescript
// S'assurer que le wallet est verrouillé avant de vérifier
if (this.isUnlocked()) {
  await this.lockWallet();
}
```

### 2. Gestion d'erreur pour submitPassword

```typescript
try {
  await keyringService.submitPassword(password);
} catch (error) {
  throw new Error('Invalid password');
}
```

## Problème persistant

Le `keyringService` utilise un `MemoryStorageAdapter` qui ne fait pas de vraie vérification cryptographique.

## Recommandations pour une vraie sécurité

1. **Remplacer MemoryStorageAdapter** par un vrai storage persistant
2. **Implémenter une vraie vérification de mot de passe** avec hash stocké
3. **Utiliser le SecurityManager** pour la vérification cryptographique
4. **Ajouter une limite de tentatives** pour éviter les attaques par force brute

## Code actuel

Le code actuel force le verrouillage et gère les erreurs, mais le problème fondamental reste : le système de test ne fait pas de vraie vérification.
