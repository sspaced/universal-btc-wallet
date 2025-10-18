import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { useTools } from '@/ui/components/ActionComponent';
import { useWallet } from '@/ui/utils';
import { MIN_PASSWORD_LENGTH } from '@/ui/utils/password-utils';

import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernButton } from '../components/common/ModernButton';
import { ModernPasswordInput } from '../components/common/ModernPasswordInput';
import { ModernSeedInput } from '../components/common/ModernSeedInput';
import { ModernWarningBox } from '../components/common/ModernWarningBox';
import WalletResetService from '../services/WalletResetService';

/**
 * Écran de réinitialisation du wallet
 * Import de la seed phrase + création d'un nouveau mot de passe
 */
export const ModernResetWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const tools = useTools();

  const [seedPhrase, setSeedPhrase] = useState('');
  const [isSeedValid, setIsSeedValid] = useState(false);
  const [seedError, setSeedError] = useState<string | undefined>();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const [isResetting, setIsResetting] = useState(false);
  const [deletionProgress, setDeletionProgress] = useState<string>('');

  const handleBack = () => {
    navigate('ForgotPasswordScreen');
  };

  const handleSeedValidationChange = (isValid: boolean, error?: string) => {
    setIsSeedValid(isValid);
    setSeedError(error);
  };

  const isPasswordValid =
    newPassword.length >= MIN_PASSWORD_LENGTH && newPassword === confirmPassword && !passwordError && !confirmError;

  const canReset = isSeedValid && isPasswordValid && !isResetting;

  const handleReset = async () => {
    if (!canReset) return;

    try {
      setIsResetting(true);

      // Étape 1 : Créer un backup de sécurité (au cas où)
      setDeletionProgress('Creating safety backup...');
      const backup = await WalletResetService.createBackup();
      console.log('[ResetWallet] Backup created');

      // Étape 2 : Supprimer toutes les données
      setDeletionProgress('Deleting all wallet data...');
      await WalletResetService.deleteAllWalletData();
      console.log('[ResetWallet] All data deleted');

      // Attendre un peu pour s'assurer que tout est supprimé
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Étape 3 : Ré-initialiser le wallet avec la seed phrase
      setDeletionProgress('Restoring wallet from seed phrase...');
      
      // Normaliser la seed phrase
      const normalizedSeed = WalletResetService.normalizeSeedPhrase(seedPhrase);

      // Boot avec le nouveau mot de passe
      await wallet.boot(newPassword);

      // Étape 4 : Créer le wallet avec la seed importée
      setDeletionProgress('Generating keys...');
      
      // Utiliser la fonction existante pour créer le keyring depuis la seed
      await wallet.createKeyringWithMnemonics(
        normalizedSeed,
        "m/84'/0'/0'/0", // BIP84 (Native SegWit)
        '', // Pas de passphrase par défaut
        0, // AddressType.P2WPKH
        1 // 1 compte par défaut
      );

      console.log('[ResetWallet] Wallet restored successfully');

      // Étape 5 : Rediriger vers l'écran principal
      setDeletionProgress('Wallet restored!');
      tools.toastSuccess('Wallet restored successfully! 🎉');

      // Attendre un peu avant de rediriger
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Naviguer vers l'écran principal
      navigate('MainScreen');
    } catch (error) {
      console.error('[ResetWallet] Error during reset:', error);
      setDeletionProgress('');
      tools.toastError('Failed to reset wallet. Please try again.');
      
      // Si on a un backup et qu'on a échoué après la suppression,
      // on pourrait proposer de restaurer le backup ici
      // (mais c'est complexe car on ne peut pas savoir à quelle étape on a échoué)
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'var(--modern-bg-primary)',
        overflow: 'auto'
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '520px', paddingTop: '20px', paddingBottom: '20px' }}>
        {/* Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
          }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '16px',
              backgroundColor: 'rgba(10, 132, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '36px'
            }}>
            🔄
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '8px',
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '-0.5px'
          }}>
          Restore Your Wallet
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.6)',
            textAlign: 'center',
            marginBottom: '24px',
            lineHeight: '1.5',
            letterSpacing: '-0.022em'
          }}>
          Enter your recovery phrase and create a new password
        </motion.p>

        {/* Info Box */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <ModernWarningBox
            variant="info"
            message="Your recovery phrase will regenerate your wallet. Make sure you're entering the correct phrase."
          />
        </motion.div>

        {/* Seed Phrase Input */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ marginBottom: '24px' }}>
          <ModernSeedInput
            value={seedPhrase}
            onChange={setSeedPhrase}
            onValidationChange={handleSeedValidationChange}
            autoFocus
            showValidation
          />
        </motion.div>

        {/* Password Section */}
        {isSeedValid && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
            <div
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: 'rgba(255, 255, 255, 0.9)',
                marginBottom: '8px'
              }}>
              Create New Password
            </div>

            <ModernPasswordInput
              label="New Password"
              placeholder="Enter a strong password"
              value={newPassword}
              onChange={setNewPassword}
              error={passwordError}
              helperText={!newPassword ? `Minimum ${MIN_PASSWORD_LENGTH} characters required` : undefined}
              showStrengthIndicator={newPassword.length > 0}
            />

            <ModernPasswordInput
              label="Confirm New Password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={confirmError}
              onBlur={() => {
                if (confirmPassword && newPassword !== confirmPassword) {
                  setConfirmError('Passwords do not match');
                } else {
                  setConfirmError('');
                }
              }}
            />
          </motion.div>
        )}

        {/* Progress Indicator */}
        {isResetting && deletionProgress && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginBottom: '20px',
              padding: '16px',
              backgroundColor: 'rgba(10, 132, 255, 0.1)',
              border: '1px solid rgba(10, 132, 255, 0.3)',
              borderRadius: '12px',
              textAlign: 'center'
            }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>⏳</div>
            <div
              style={{
                fontSize: '13px',
                color: '#0A84FF',
                fontWeight: '500'
              }}>
              {deletionProgress}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{ display: 'flex', gap: '12px' }}>
          <ModernButton variant="secondary" size="large" onClick={handleBack} disabled={isResetting} style={{ flex: 1 }}>
            Back
          </ModernButton>

          <ModernButton
            variant="primary"
            size="large"
            onClick={handleReset}
            disabled={!canReset}
            loading={isResetting}
            style={{ flex: 2 }}>
            {isResetting ? 'Restoring...' : 'Restore Wallet'}
          </ModernButton>
        </motion.div>

        {/* Security Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            marginTop: '24px',
            padding: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.5)',
              margin: 0,
              lineHeight: '1.5'
            }}>
            🔒 Your recovery phrase will regenerate all your accounts and restore access to your funds.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

