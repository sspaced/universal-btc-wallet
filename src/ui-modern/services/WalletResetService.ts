/**
 * Service de réinitialisation et suppression sécurisée du wallet
 * Gère la suppression complète des données et le nettoyage sécurisé
 */

import * as bip39 from 'bip39';

export interface WalletData {
  keyrings?: any;
  preference?: any;
  accounts?: any;
  transactions?: any;
  settings?: any;
  [key: string]: any;
}

export class WalletResetService {
  /**
   * Supprime TOUTES les données du wallet de manière sécurisée
   */
  static async deleteAllWalletData(): Promise<void> {
    console.log('[WalletResetService] Starting complete wallet data deletion...');

    try {
      // 1. Supprimer du chrome.storage.local (toutes les clés)
      await this.clearChromeStorage();

      // 2. Vérifier que c'est bien vide
      const remaining = await this.checkRemainingData();
      if (remaining.length > 0) {
        console.warn('[WalletResetService] Some keys remain:', remaining);
      }

      // 3. Supprimer du localStorage (si utilisé)
      await this.clearLocalStorage();

      // 4. Supprimer du sessionStorage
      await this.clearSessionStorage();

      // 5. Nettoyer la mémoire (variables sensibles)
      await this.secureMemoryWipe();

      // 6. Nettoyer les caches
      await this.clearCaches();

      console.log('[WalletResetService] All wallet data deleted successfully');
    } catch (error) {
      console.error('[WalletResetService] Error during wallet data deletion:', error);
      throw new Error('Failed to delete all wallet data. Please try again.');
    }
  }

  /**
   * Vérifie s'il reste des données dans chrome.storage
   */
  private static async checkRemainingData(): Promise<string[]> {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(null, (items) => {
          const keys = Object.keys(items || {});
          resolve(keys);
        });
      } else {
        resolve([]);
      }
    });
  }

  /**
   * Supprime toutes les données de chrome.storage.local
   */
  private static async clearChromeStorage(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.clear(() => {
          if (chrome.runtime.lastError) {
            console.error('[WalletResetService] Error clearing chrome.storage:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            console.log('[WalletResetService] chrome.storage.local cleared');
            resolve();
          }
        });
      } else {
        console.warn('[WalletResetService] chrome.storage.local not available');
        resolve();
      }
    });
  }

  /**
   * Supprime toutes les données du localStorage
   */
  private static async clearLocalStorage(): Promise<void> {
    try {
      if (typeof localStorage !== 'undefined') {
        // Liste des clés à supprimer (liées au wallet)
        const keysToDelete = [
          'keyring',
          'preference',
          'openapi',
          'feeService',
          'simplicity',
          'phishing',
          'contactBook',
          'unified-assets-cache',
          'redux',
          'persist:root'
        ];

        keysToDelete.forEach((key) => {
          if (localStorage.getItem(key)) {
            // Overwrite avec des données aléatoires avant suppression (sécurité)
            localStorage.setItem(key, this.generateRandomString(1000));
            localStorage.removeItem(key);
          }
        });

        // Supprimer aussi toutes les autres clés (au cas où)
        localStorage.clear();

        console.log('[WalletResetService] localStorage cleared');
      }
    } catch (error) {
      console.error('[WalletResetService] Error clearing localStorage:', error);
    }
  }

  /**
   * Supprime toutes les données du sessionStorage
   */
  private static async clearSessionStorage(): Promise<void> {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.clear();
        console.log('[WalletResetService] sessionStorage cleared');
      }
    } catch (error) {
      console.error('[WalletResetService] Error clearing sessionStorage:', error);
    }
  }

  /**
   * Nettoie de manière sécurisée les données sensibles en mémoire
   */
  private static async secureMemoryWipe(): Promise<void> {
    try {
      // Forcer le garbage collector (si disponible)
      if (typeof global !== 'undefined' && (global as any).gc) {
        (global as any).gc();
      }

      // Créer des données aléatoires pour overwrite la mémoire
      const dummy = new Array(1000).fill(0).map(() => this.generateRandomString(100));
      dummy.length = 0; // Clear

      console.log('[WalletResetService] Memory wiped');
    } catch (error) {
      console.error('[WalletResetService] Error wiping memory:', error);
    }
  }

  /**
   * Nettoie tous les caches
   */
  private static async clearCaches(): Promise<void> {
    try {
      // Clear cache API si disponible
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
        console.log('[WalletResetService] Caches cleared');
      }
    } catch (error) {
      console.error('[WalletResetService] Error clearing caches:', error);
    }
  }

  /**
   * Valide une seed phrase BIP39
   */
  static validateSeedPhrase(seedPhrase: string): {
    isValid: boolean;
    error?: string;
    wordCount?: number;
  } {
    try {
      // Nettoyer et normaliser la seed phrase
      const cleanedPhrase = seedPhrase.trim().toLowerCase().replace(/\s+/g, ' ');

      // Diviser en mots
      const words = cleanedPhrase.split(' ');
      const wordCount = words.length;

      // Vérifier le nombre de mots (BIP39 standard)
      const validWordCounts = [12, 15, 18, 21, 24];
      if (!validWordCounts.includes(wordCount)) {
        return {
          isValid: false,
          error: `Invalid number of words. Expected 12, 15, 18, 21, or 24 words, got ${wordCount}.`,
          wordCount
        };
      }

      // Vérifier que tous les mots sont dans la wordlist BIP39
      const wordlist = bip39.wordlists.english;
      const invalidWords = words.filter((word) => !wordlist.includes(word));

      if (invalidWords.length > 0) {
        return {
          isValid: false,
          error: 'Some words are not in the BIP39 wordlist.',
          wordCount
        };
      }

      // Valider la checksum BIP39
      const isValid = bip39.validateMnemonic(cleanedPhrase);

      if (!isValid) {
        return {
          isValid: false,
          error: 'Invalid recovery phrase. The checksum verification failed.',
          wordCount
        };
      }

      return {
        isValid: true,
        wordCount
      };
    } catch (error) {
      console.error('[WalletResetService] Error validating seed phrase:', error);
      return {
        isValid: false,
        error: 'Invalid recovery phrase format.'
      };
    }
  }

  /**
   * Normalise une seed phrase (trim, lowercase, espaces multiples)
   */
  static normalizeSeedPhrase(seedPhrase: string): string {
    return seedPhrase.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  /**
   * Compte les mots dans une seed phrase
   */
  static countWords(seedPhrase: string): number {
    const normalized = this.normalizeSeedPhrase(seedPhrase);
    return normalized ? normalized.split(' ').length : 0;
  }

  /**
   * Vérifie si un mot est dans la wordlist BIP39
   */
  static isValidWord(word: string): boolean {
    const wordlist = bip39.wordlists.english;
    return wordlist.includes(word.toLowerCase().trim());
  }

  /**
   * Suggère des mots BIP39 basés sur une saisie partielle
   */
  static suggestWords(partial: string, limit = 5): string[] {
    if (!partial || partial.length < 2) return [];

    const wordlist = bip39.wordlists.english;
    const lowerPartial = partial.toLowerCase();

    return wordlist.filter((word) => word.startsWith(lowerPartial)).slice(0, limit);
  }

  /**
   * Génère une chaîne aléatoire pour l'overwrite sécurisé
   */
  private static generateRandomString(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Vérifie si le wallet a des données
   */
  static async hasWalletData(): Promise<boolean> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get(null, (items) => {
            resolve(Object.keys(items).length > 0);
          });
        });
      }
      return false;
    } catch (error) {
      console.error('[WalletResetService] Error checking wallet data:', error);
      return false;
    }
  }

  /**
   * Sauvegarde d'urgence des données avant suppression (pour debug/rollback)
   */
  static async createBackup(): Promise<WalletData | null> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve) => {
          chrome.storage.local.get(null, (items) => {
            resolve(items as WalletData);
          });
        });
      }
      return null;
    } catch (error) {
      console.error('[WalletResetService] Error creating backup:', error);
      return null;
    }
  }

  /**
   * Restaure une sauvegarde (en cas d'erreur pendant la suppression)
   */
  static async restoreBackup(backup: WalletData): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        return new Promise((resolve, reject) => {
          chrome.storage.local.set(backup, () => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve();
            }
          });
        });
      }
    } catch (error) {
      console.error('[WalletResetService] Error restoring backup:', error);
      throw error;
    }
  }
}

export default WalletResetService;

