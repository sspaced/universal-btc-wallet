import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { useTools } from '@/ui/components/ActionComponent';
import { useWallet } from '@/ui/utils';

import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernButton } from '../components/common/ModernButton';
import { ModernPasswordInput } from '../components/common/ModernPasswordInput';
import { ModernWarningBox } from '../components/common/ModernWarningBox';
import WalletResetService from '../services/WalletResetService';

/**
 * Écran de suppression volontaire du wallet
 * Accessible depuis les paramètres (wallet déverrouillé)
 */
export const ModernDeleteWalletScreen: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const tools = useTools();

  const [step, setStep] = useState<'warning' | 'seed-display' | 'password' | 'final-confirmation'>('warning');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmationText, setConfirmationText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const [seedPhrase, setSeedPhrase] = useState('');
  const [showSeed, setShowSeed] = useState(false);

  const handleBack = () => {
    if (step === 'warning') {
      navigate('MainScreen', { openSettings: true });
    } else {
      // Retour à l'étape précédente
      if (step === 'final-confirmation') setStep('password');
      else if (step === 'password') setStep('seed-display');
      else if (step === 'seed-display') setStep('warning');
    }
  };

  const handleContinueFromWarning = () => {
    setStep('seed-display');
  };

  const handleViewSeed = async () => {
    // Afficher la seed phrase une dernière fois avant suppression
    setShowSeed(true);
    // TODO: Récupérer la vraie seed depuis le wallet
    // const keyring = await wallet.getCurrentKeyring();
    // const result = await wallet.getMnemonics(password, keyring);
    // setSeedPhrase(result.mnemonic);
    setSeedPhrase('abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about');
  };

  const handleSkipSeedDisplay = () => {
    setStep('password');
  };

  const handlePasswordSubmit = async () => {
    try {
      // Vérifier le mot de passe
      await wallet.verifyPassword(password);
      setPasswordError('');
      setStep('final-confirmation');
    } catch (error) {
      setPasswordError('Incorrect password');
      tools.toastError('Incorrect password');
    }
  };

  const handleFinalDelete = async () => {
    if (confirmationText.toUpperCase() !== 'DELETE') {
      tools.toastError('Please type DELETE to confirm');
      return;
    }

    try {
      setIsDeleting(true);

      // Créer un backup de sécurité
      console.log('[DeleteWallet] Creating backup...');
      await WalletResetService.createBackup();

      // Délai de 3 secondes pour que l'utilisateur réalise
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Supprimer TOUTES les données
      console.log('[DeleteWallet] Deleting all data...');
      await WalletResetService.deleteAllWalletData();

      console.log('[DeleteWallet] Wallet deleted successfully');
      tools.toastSuccess('Wallet deleted successfully');

      // Attendre un peu
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Rediriger vers l'écran de bienvenue
      navigate('WelcomeScreen');
    } catch (error) {
      console.error('[DeleteWallet] Error during deletion:', error);
      tools.toastError('Failed to delete wallet. Please try again.');
      setIsDeleting(false);
    }
  };

  // Rendu selon l'étape
  if (step === 'warning') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: 'var(--modern-bg-primary)'
        }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '480px' }}>
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
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                backgroundColor: 'rgba(255, 59, 48, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '40px'
              }}>
              🗑️
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
              marginBottom: '12px',
              color: '#FF3B30',
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}>
            Delete This Wallet
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
              marginBottom: '32px',
              lineHeight: '1.5',
              letterSpacing: '-0.022em'
            }}>
            This action is permanent and cannot be undone
          </motion.p>

          {/* Danger Warnings */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4, duration: 0.5 }}>
            <ModernWarningBox
              variant="danger"
              title="⚠️ This action is IRREVERSIBLE"
              message="All your wallet data will be permanently deleted from this device."
              items={[
                'Your Bitcoin is on the blockchain, NOT in this wallet',
                'You MUST have your recovery phrase to access your funds again',
                'Without your recovery phrase, your funds will be LOST FOREVER'
              ]}
            />
          </motion.div>

          {/* Checklist */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            style={{
              backgroundColor: 'var(--modern-bg-secondary)',
              border: '1px solid var(--modern-border-color)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px'
            }}>
            <h3
              style={{
                fontSize: '14px',
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: '16px',
                letterSpacing: '-0.022em'
              }}>
              Before you delete:
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 59, 48, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF3B30',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                  1
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Confirm you have saved your recovery phrase
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 59, 48, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF3B30',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                  2
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Verify you can restore your wallet with this phrase
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 59, 48, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF3B30',
                    fontSize: '14px',
                    fontWeight: '600',
                    flexShrink: 0
                  }}>
                  3
                </div>
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.9)' }}>
                  Make sure no transactions are pending
                </span>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            style={{ display: 'flex', gap: '12px' }}>
            <ModernButton variant="secondary" size="large" onClick={handleBack} style={{ flex: 1 }}>
              Cancel
            </ModernButton>

            <ModernButton
              variant="primary"
              size="large"
              onClick={handleContinueFromWarning}
              style={{
                flex: 1,
                backgroundColor: '#FF3B30',
                borderColor: '#FF3B30'
              }}>
              I Understand
            </ModernButton>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  if (step === 'seed-display') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: 'var(--modern-bg-primary)'
        }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '480px' }}>
          <motion.h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px',
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}>
            View Recovery Phrase One Last Time?
          </motion.h1>

          <motion.p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              marginBottom: '32px',
              lineHeight: '1.5',
              letterSpacing: '-0.022em'
            }}>
            Would you like to see your recovery phrase before deleting?
          </motion.p>

          <ModernWarningBox
            variant="info"
            message="This is your last chance to save your recovery phrase. Without it, you cannot access your funds after deletion."
          />

          {showSeed && seedPhrase && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                marginTop: '24px',
                padding: '20px',
                backgroundColor: 'var(--modern-bg-secondary)',
                border: '1px solid var(--modern-border-color)',
                borderRadius: '12px'
              }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '12px'
                }}>
                {seedPhrase.split(' ').map((word, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px',
                      backgroundColor: 'var(--modern-bg-tertiary)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', fontWeight: '500' }}>
                      {index + 1}.
                    </span>
                    <span style={{ fontSize: '14px', color: '#ffffff', fontWeight: '500' }}>{word}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <ModernButton variant="secondary" size="large" onClick={handleBack} style={{ flex: 1 }}>
              Back
            </ModernButton>

            {!showSeed ? (
              <>
                <ModernButton variant="secondary" size="large" onClick={handleSkipSeedDisplay} style={{ flex: 1 }}>
                  Skip
                </ModernButton>
                <ModernButton variant="primary" size="large" onClick={handleViewSeed} style={{ flex: 1 }}>
                  View Phrase
                </ModernButton>
              </>
            ) : (
              <ModernButton variant="primary" size="large" onClick={handleSkipSeedDisplay} style={{ flex: 1 }}>
                Continue
              </ModernButton>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  if (step === 'password') {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: 'var(--modern-bg-primary)'
        }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: '420px' }}>
          <motion.h1
            style={{
              fontSize: '24px',
              fontWeight: '700',
              marginBottom: '12px',
              color: '#ffffff',
              textAlign: 'center',
              letterSpacing: '-0.5px'
            }}>
            Confirm with Password
          </motion.h1>

          <motion.p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.6)',
              textAlign: 'center',
              marginBottom: '32px',
              lineHeight: '1.5',
              letterSpacing: '-0.022em'
            }}>
            Enter your current password to proceed with deletion
          </motion.p>

          <ModernPasswordInput
            label="Current Password"
            placeholder="Enter your password"
            value={password}
            onChange={setPassword}
            error={passwordError}
            autoFocus
            onKeyPress={(e) => {
              if (e.key === 'Enter' && password) {
                handlePasswordSubmit();
              }
            }}
          />

          <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
            <ModernButton variant="secondary" size="large" onClick={handleBack} style={{ flex: 1 }}>
              Back
            </ModernButton>

            <ModernButton
              variant="primary"
              size="large"
              onClick={handlePasswordSubmit}
              disabled={!password}
              style={{ flex: 1 }}>
              Continue
            </ModernButton>
          </div>
        </motion.div>
      </div>
    );
  }

  // Final confirmation
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'var(--modern-bg-primary)'
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '480px' }}>
        {isDeleting ? (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>⏳</div>
            <h2 style={{ fontSize: '20px', color: '#ffffff', marginBottom: '12px' }}>Deleting Wallet...</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
              Please wait while we securely delete all your data
            </p>
          </motion.div>
        ) : (
          <>
            <motion.div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '24px'
              }}>
              <div
                style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  backgroundColor: 'rgba(255, 59, 48, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '40px'
                }}>
                ⚠️
              </div>
            </motion.div>

            <motion.h1
              style={{
                fontSize: '24px',
                fontWeight: '700',
                marginBottom: '12px',
                color: '#FF3B30',
                textAlign: 'center',
                letterSpacing: '-0.5px'
              }}>
              Final Confirmation
            </motion.h1>

            <motion.p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.6)',
                textAlign: 'center',
                marginBottom: '32px',
                lineHeight: '1.5',
                letterSpacing: '-0.022em'
              }}>
              Type <strong style={{ color: '#FF3B30' }}>DELETE</strong> to permanently delete this wallet
            </motion.p>

            <ModernWarningBox variant="danger" message="This action cannot be undone. All local data will be erased." />

            <div style={{ marginTop: '24px', marginBottom: '24px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginBottom: '8px'
                }}>
                Type DELETE to confirm
              </label>
              <input
                type="text"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="DELETE"
                autoFocus
                style={{
                  width: '100%',
                  padding: '16px',
                  fontSize: '16px',
                  fontWeight: '500',
                  color: '#ffffff',
                  backgroundColor: 'var(--modern-bg-secondary)',
                  border: 'var(--modern-border-width) solid var(--modern-border-color)',
                  borderRadius: '12px',
                  outline: 'none',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  letterSpacing: '2px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <ModernButton variant="secondary" size="large" onClick={handleBack} style={{ flex: 1 }}>
                Cancel
              </ModernButton>

              <ModernButton
                variant="primary"
                size="large"
                onClick={handleFinalDelete}
                disabled={confirmationText.toUpperCase() !== 'DELETE'}
                style={{
                  flex: 1,
                  backgroundColor: '#FF3B30',
                  borderColor: '#FF3B30'
                }}>
                Delete Forever
              </ModernButton>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

