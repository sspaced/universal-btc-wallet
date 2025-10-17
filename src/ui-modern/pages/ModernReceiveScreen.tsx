import { motion } from 'framer-motion';
import QRCode from 'qrcode.react';
import React, { useState } from 'react';

import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountAddress, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useChain } from '@/ui/state/settings/hooks';
import { copyToClipboard } from '@/ui/utils';

import { BackIcon, CopyIcon } from '../components/common/Icons';

// Composant pour afficher le QR Code moderne
const ModernQRCode: React.FC<{ address: string; chainIcon: string }> = ({ address, chainIcon }) => {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      style={{
        width: '180px',
        height: '180px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '14px',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.3)',
        alignSelf: 'center'
      }}>
      <QRCode
        value={address}
        renderAs="svg"
        size={152}
        imageSettings={{
          src: chainIcon,
          width: 28,
          height: 28,
          excavate: true
        }}
      />
    </motion.div>
  );
};

// Composant pour afficher l'adresse avec bouton copier fusionné
const ModernAddressDisplay: React.FC<{ address: string; onCopy: () => void; copied: boolean }> = ({
  address,
  onCopy,
  copied
}) => {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      style={{
        width: '100%',
        maxWidth: '320px',
        alignSelf: 'center'
      }}>
      {/* Label */}
      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        style={{
          fontSize: '15px',
          fontWeight: '600',
          color: '#ffffff',
          textAlign: 'center',
          marginBottom: '8px',
          letterSpacing: '-0.3px',
          fontFamily:
            '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
        }}>
        Your Bitcoin Address
      </motion.p>

      {/* Boîte fusionnée : Adresse + Bouton Copier */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        style={{
          backgroundColor: 'var(--modern-bg-secondary)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
        {/* Partie Adresse */}
        <div
          style={{
            padding: '16px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
          <p
            style={{
              fontSize: '14px',
              color: '#ffffff',
              textAlign: 'center',
              wordBreak: 'break-all',
              lineHeight: '1.4',
              margin: 0,
              fontFamily: 'SF Mono, Monaco, Consolas, monospace'
            }}>
            {address}
          </p>
        </div>

        {/* Partie Bouton Copier */}
        <button
          onClick={onCopy}
          style={{
            width: '100%',
            padding: '12px 16px',
            backgroundColor: copied ? '#34C759' : 'var(--modern-accent-primary)',
            border: 'none',
            color: '#000000',
            fontSize: '14px',
            fontWeight: '600',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            transition: 'all 0.2s ease',
            boxShadow: copied ? '0 2px 8px rgba(52, 199, 89, 0.25)' : '0 2px 8px rgba(114, 227, 173, 0.25)'
          }}
          onMouseEnter={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = '#5dd39a';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(114, 227, 173, 0.35)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (!copied) {
              e.currentTarget.style.backgroundColor = 'var(--modern-accent-primary)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(114, 227, 173, 0.25)';
              e.currentTarget.style.transform = 'translateY(0px)';
            }
          }}>
          <CopyIcon style={{ width: '16px', height: '16px' }} />
          {copied ? 'Copied!' : 'Copy Address'}
        </button>
      </motion.div>
    </motion.div>
  );
};

export const ModernReceiveScreen: React.FC = () => {
  const navigate = useNavigate();
  const currentAccount = useCurrentAccount();
  const address = useAccountAddress();
  const chain = useChain();
  const { t } = useI18n();
  const tools = useTools();
  const [copied, setCopied] = useState(false);

  const handleBack = () => {
    navigate('#back');
  };

  const handleCopy = async () => {
    if (address) {
      try {
        await copyToClipboard(address);
        setCopied(true);
        tools.toastSuccess(t('copied'));
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        tools.toastError('Failed to copy address');
      }
    }
  };

  if (!address) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--modern-bg-primary)',
          color: '#ffffff'
        }}>
        <p>Loading address...</p>
      </div>
    );
  }

  return (
    <div
      className="modern-ui-container"
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'var(--modern-bg-primary)',
        overflow: 'hidden'
      }}>
      {/* Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
        {/* Left side - Back button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: 'var(--modern-bg-secondary)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}>
          <BackIcon style={{ width: '20px', height: '20px', color: '#ffffff' }} />
        </motion.button>

        {/* Center - Title */}
        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          style={{
            fontSize: '18px',
            fontWeight: '700',
            color: '#ffffff',
            margin: 0,
            letterSpacing: '-0.3px'
          }}>
          Receive Address
        </motion.h1>

        {/* Right side - Spacer */}
        <div style={{ width: '40px' }} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px 20px',
          gap: '16px',
          overflow: 'hidden'
        }}>
        {/* QR Code */}
        <ModernQRCode address={address} chainIcon={chain.icon} />

        {/* Address Display */}
        <ModernAddressDisplay address={address} onCopy={handleCopy} copied={copied} />

        {/* Disclaimer */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          style={{
            textAlign: 'center',
            maxWidth: '320px',
            alignSelf: 'center'
          }}>
          <p
            style={{
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.7)',
              lineHeight: '1.5',
              margin: '0 0 8px 0',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
            }}>
            This address can only be used to receive compatible tokens.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => window.open('https://blacknode.co/docs', '_blank')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--modern-accent-primary)',
              fontSize: '14px',
              fontWeight: '500',
              fontFamily:
                '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}>
            Learn More
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};
