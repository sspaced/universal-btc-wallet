import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { useTools } from '@/ui/components/ActionComponent';

import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernButton } from '../components/common/ModernButton';
import WalletResetService from '../services/WalletResetService';

/**
 * Écran "Mot de passe oublié" - Version simplifiée
 * 2 options : avec ou sans recovery phrase
 */
export const ModernForgotPasswordScreen: React.FC = () => {
  const navigate = useNavigate();
  const tools = useTools();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleBack = () => {
    navigate('UnlockScreen');
  };

  const handleDeleteWallet = async () => {
    // Confirmation finale
    const confirmed = window.confirm(
      'Are you sure you want to delete all wallet data?\n\nThis action is PERMANENT and cannot be undone.\n\nAfter deletion, you can create a new wallet or import an existing one.\n\nClick OK to continue.'
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);

      // Supprimer toutes les données
      await WalletResetService.deleteAllWalletData();

      tools.toastSuccess('Wallet data deleted. Reloading extension...');

      // Attendre un peu
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Recharger l'extension complètement pour vider la mémoire
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.reload) {
        chrome.runtime.reload();
      } else {
        // Fallback: rediriger vers welcome
        navigate('WelcomeScreen');
        // Forcer un reload de la page
        setTimeout(() => {
          window.location.reload();
        }, 100);
      }
    } catch (error) {
      console.error('[ForgotPassword] Error:', error);
      tools.toastError('Failed to delete wallet data');
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="modern-ui-container"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        backgroundColor: 'var(--modern-bg-primary)'
      }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '448px' }}>
        {/* Title */}
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{
            fontSize: '24px',
            fontWeight: '700',
            marginBottom: '6px',
            color: '#ffffff',
            textAlign: 'center',
            letterSpacing: '-0.5px'
          }}>
          Reset Wallet
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
            lineHeight: '1.47059',
            letterSpacing: '-0.022em'
          }}>
          This will delete all local wallet data. Your funds remain safe on the blockchain.
        </motion.p>

        {/* Info Box */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ marginBottom: '24px' }}>
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--modern-bg-secondary)',
              border: '1px solid var(--modern-border-color)',
              borderRadius: '12px'
            }}>
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.8)',
                lineHeight: '1.5',
                marginBottom: '8px'
              }}>
              After deletion, you can:
            </div>
            <div
              style={{
                fontSize: '13px',
                color: 'rgba(255, 255, 255, 0.6)',
                lineHeight: '1.6',
                paddingLeft: '16px'
              }}>
              • Create a new wallet<br />
              • Import an existing wallet with your recovery phrase
            </div>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          style={{ display: 'flex', gap: '12px' }}>
          <ModernButton variant="secondary" size="large" onClick={handleBack} disabled={isDeleting} style={{ flex: 1 }}>
            Cancel
          </ModernButton>

          <ModernButton
            variant="primary"
            size="large"
            onClick={handleDeleteWallet}
            disabled={isDeleting}
            loading={isDeleting}
            style={{ flex: 1 }}>
            {isDeleting ? 'Deleting...' : 'Delete Wallet'}
          </ModernButton>
        </motion.div>
      </motion.div>
    </div>
  );
};

