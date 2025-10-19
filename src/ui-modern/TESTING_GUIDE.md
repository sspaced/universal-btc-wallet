# 🧪 Guide de Test : Système de Réinitialisation/Suppression du Wallet

## ✅ Routes Enregistrées

Les routes suivantes ont été ajoutées au système de navigation :

```typescript
// Dans MainRoute.tsx
ForgotPasswordScreen: '/account/forgot-password'
ResetWalletScreen: '/account/reset-wallet'  
DeleteWalletScreen: '/settings/delete-wallet'
```

---

## 🔍 Comment Tester

### 1. Recompiler l'extension

```bash
npm run build:chrome:dev
# ou
yarn build:chrome:dev
```

### 2. Recharger l'extension dans Chrome

1. Aller sur `chrome://extensions/`
2. Cliquer sur le bouton "🔄 Reload" de votre extension
3. Ouvrir l'extension

---

## 📋 Checklist de Test

### ✅ Test du flux "Forgot Password"

1. **Depuis l'écran de déverrouillage** :
   - [ ] Cliquer sur "Forgot password?" en bas
   - [ ] ✓ Devrait naviguer vers ForgotPasswordScreen

2. **Sur ForgotPasswordScreen** :
   - [ ] Voir les avertissements (icône ⚠️)
   - [ ] Voir la liste des conséquences
   - [ ] Voir les 2 checkboxes obligatoires
   - [ ] Tenter de cliquer "Continue Reset" sans cocher → bouton désactivé
   - [ ] Cocher les 2 checkboxes → bouton activé
   - [ ] Cliquer "Continue Reset"
   - [ ] ✓ Devrait naviguer vers ResetWalletScreen

3. **Sur ResetWalletScreen** :
   - [ ] Voir le champ de seed phrase
   - [ ] Entrer une seed invalide (ex: "test test test")
   - [ ] ✓ Voir l'erreur "Invalid recovery phrase"
   - [ ] Entrer une seed valide :
     ```
     abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about
     ```
   - [ ] ✓ Voir le compteur "12 words" en vert
   - [ ] ✓ Voir "✓ Valid"
   - [ ] Les champs password apparaissent
   - [ ] Entrer un nouveau mot de passe (min 8 caractères)
   - [ ] Confirmer le mot de passe
   - [ ] Cliquer "Restore Wallet"
   - [ ] ✓ Voir les étapes de progression
   - [ ] ✓ Redirection vers MainScreen

4. **Vérifier la restauration** :
   - [ ] Le wallet est déverrouillé
   - [ ] Les comptes sont visibles
   - [ ] Le nouveau mot de passe fonctionne

---

### ✅ Test du flux "Delete Wallet"

1. **Depuis l'écran principal** :
   - [ ] Ouvrir Settings (icône ⚙️)
   - [ ] Scroll vers le bas
   - [ ] ✓ Voir "Delete Wallet" en ROUGE avec bordure rouge

2. **Cliquer sur "Delete Wallet"** :
   - [ ] ✓ Naviguer vers DeleteWalletScreen (Étape 1)

3. **Étape 1 - Avertissements** :
   - [ ] Voir l'icône 🗑️ rouge
   - [ ] Voir le titre "Delete This Wallet" en rouge
   - [ ] Voir les avertissements danger (rouge)
   - [ ] Voir la checklist (3 points)
   - [ ] Cliquer "Cancel" → retour aux settings
   - [ ] Revenir et cliquer "I Understand"
   - [ ] ✓ Passer à l'étape 2

4. **Étape 2 - Afficher la seed (optionnel)** :
   - [ ] Voir "View Recovery Phrase One Last Time?"
   - [ ] Option de Skip ou View Phrase
   - [ ] Cliquer "View Phrase"
   - [ ] ✓ Voir la seed phrase affichée en grille
   - [ ] Cliquer "Continue"
   - [ ] ✓ Passer à l'étape 3

5. **Étape 3 - Confirmation par mot de passe** :
   - [ ] Voir "Confirm with Password"
   - [ ] Entrer un mauvais mot de passe → erreur
   - [ ] Entrer le bon mot de passe
   - [ ] Cliquer "Continue"
   - [ ] ✓ Passer à l'étape 4

6. **Étape 4 - Confirmation finale** :
   - [ ] Voir "Final Confirmation"
   - [ ] Voir l'input pour taper "DELETE"
   - [ ] Taper "delete" (minuscule) → bouton reste désactivé
   - [ ] Taper "DELETE" (majuscule) → bouton activé
   - [ ] Cliquer "Delete Forever"
   - [ ] ✓ Voir "Deleting Wallet..." avec icône ⏳
   - [ ] Attendre ~3 secondes
   - [ ] ✓ Redirection vers WelcomeScreen

7. **Vérifier la suppression complète** :
   - [ ] Ouvrir DevTools Console (F12)
   - [ ] Taper : `chrome.storage.local.get(null, console.log)`
   - [ ] ✓ Devrait afficher un objet vide `{}`
   - [ ] Taper : `localStorage.length`
   - [ ] ✓ Devrait afficher `0`
   - [ ] Le wallet est complètement réinitialisé

---

## 🐛 Erreurs Courantes et Solutions

### Erreur : "Route not found"
**Solution** : Vérifier que MainRoute.tsx a bien été recompilé
```bash
# Arrêter le serveur dev et relancer
npm run build:chrome:dev
```

### Erreur : "Cannot read property 'navigate' of undefined"
**Solution** : Le hook useNavigate() doit être utilisé dans un composant enfant de <HashRouter>

### Erreur : Les données ne sont pas supprimées
**Solution** : 
1. Vérifier que chrome.storage.local est accessible
2. Vérifier la console pour les erreurs
3. Tester manuellement : `chrome.storage.local.clear(() => console.log('cleared'))`

### Le style "danger" n'apparaît pas dans Settings
**Solution** : Vérifier que ModernSettingsPanel.tsx a bien été recompilé

---

## 📝 Logs à Vérifier

### Console logs attendus (sans données sensibles) :

**Pendant la réinitialisation** :
```
[WalletResetService] Starting complete wallet data deletion...
[WalletResetService] chrome.storage.local cleared
[WalletResetService] localStorage cleared
[WalletResetService] sessionStorage cleared
[WalletResetService] Memory wiped
[WalletResetService] Caches cleared
[WalletResetService] All wallet data deleted successfully
[ResetWallet] Backup created
[ResetWallet] All data deleted
[ResetWallet] Wallet restored successfully
```

**Pendant la suppression** :
```
[DeleteWallet] Creating backup...
[DeleteWallet] Deleting all data...
[DeleteWallet] Wallet deleted successfully
```

### ⚠️ Logs à NE JAMAIS voir :
- ❌ Seed phrase en clair
- ❌ Mot de passe en clair
- ❌ Clés privées

---

## ✅ Tests Réussis Si :

1. ✓ Tous les boutons fonctionnent (navigation)
2. ✓ Les validations fonctionnent (seed phrase, password)
3. ✓ Les avertissements s'affichent correctement
4. ✓ Les confirmations empêchent les actions accidentelles
5. ✓ Le wallet peut être restauré avec une seed valide
6. ✓ Toutes les données sont supprimées après delete
7. ✓ Aucune donnée sensible dans les logs
8. ✓ Le style "danger" (rouge) apparaît pour Delete Wallet

---

## 🎯 Résultat Attendu

Après tests complets, vous devriez pouvoir :
- ✅ Réinitialiser le wallet avec mot de passe oublié
- ✅ Restaurer le wallet avec une seed phrase
- ✅ Supprimer complètement le wallet
- ✅ Recommencer avec un nouveau wallet

Tout fonctionne = **Prêt pour la production ! 🚀**

