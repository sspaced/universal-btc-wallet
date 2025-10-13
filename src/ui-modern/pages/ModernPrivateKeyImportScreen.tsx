import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Key } from 'lucide-react';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ADDRESS_TYPES } from '@/shared/constant';
import { AddressType } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useWallet } from '@/ui/utils';

import { ModernButton, ModernCard } from '../components/common';

interface ContextData {
  privateKey: string;
  addressType: AddressType;
  step1Completed: boolean;
  currentStep: number;
}

interface UpdateContextDataParams {
  privateKey?: string;
  addressType?: AddressType;
  step1Completed?: boolean;
  currentStep?: number;
}

const ModernPrivateKeyImportScreen: React.FC = () => {
  const navigate = useNavigate();
  const wallet = useWallet();
  const tools = useTools();

  const [contextData, setContextData] = useState<ContextData>({
    privateKey: '',
    addressType: AddressType.P2WPKH,
    step1Completed: false,
    currentStep: 1
  });

  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewAddresses, setPreviewAddresses] = useState<string[]>([]);
  const [addressAssets, setAddressAssets] = useState<{
    [key: string]: { total_btc: string; satoshis: number; total_inscription: number };
  }>({});

  const updateContextData = useCallback((params: UpdateContextDataParams) => {
    setContextData((prev) => ({ ...prev, ...params }));
  }, []);

  const addressTypes = useMemo(() => {
    return ADDRESS_TYPES.filter((item) => {
      if (item.displayIndex < 0) return false;
      if (item.isUnisatLegacy) return false;
      return true;
    }).sort((a, b) => a.displayIndex - b.displayIndex);
  }, []);

  const handleBack = () => {
    if (contextData.currentStep === 1) {
      navigate('#back');
    } else {
      updateContextData({ currentStep: 1 });
    }
  };

  const handlePrivateKeyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value.trim();
    updateContextData({
      privateKey: value,
      step1Completed: value.length > 0
    });
  };

  const validatePrivateKey = async () => {
    if (!contextData.privateKey) {
      tools.toastError('Please enter a private key');
      return;
    }

    setIsLoading(true);
    try {
      const _res = await wallet.createTmpKeyringWithPrivateKey(contextData.privateKey, AddressType.P2TR);
      if (_res.accounts.length === 0) {
        throw new Error('Invalid private key');
      }
      updateContextData({ currentStep: 2 });
    } catch (e) {
      tools.toastError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const generatePreviewAddresses = async () => {
    if (!contextData.privateKey) return;

    const addresses: string[] = [];
    const assets: { [key: string]: { total_btc: string; satoshis: number; total_inscription: number } } = {};

    try {
      for (let i = 0; i < addressTypes.length; i++) {
        const addressType = addressTypes[i];
        const keyring = await wallet.createTmpKeyringWithPrivateKey(contextData.privateKey, addressType.value);
        const address = keyring.accounts[0].address;
        addresses.push(address);
      }

      const balances = await wallet.getMultiAddressAssets(addresses.join(','));
      for (let i = 0; i < addresses.length; i++) {
        const address = addresses[i];
        const balance = balances[i];
        assets[address] = {
          total_btc: (balance.totalSatoshis / 100000000).toFixed(8),
          satoshis: balance.totalSatoshis,
          total_inscription: balance.inscriptionCount
        };
      }

      setPreviewAddresses(addresses);
      setAddressAssets(assets);
    } catch (e) {
      console.error('Error generating preview addresses:', e);
    }
  };

  useEffect(() => {
    if (contextData.currentStep === 2) {
      generatePreviewAddresses();
    }
  }, [contextData.currentStep, contextData.privateKey]);

  const handleAddressTypeSelect = (addressType: AddressType) => {
    updateContextData({ addressType });
  };

  const handleImportWallet = async () => {
    setIsLoading(true);
    try {
      await wallet.createKeyringWithPrivateKey(contextData.privateKey, contextData.addressType);
      tools.toastSuccess('Wallet imported successfully!');
      navigate('MainScreen');
    } catch (e) {
      tools.toastError((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: '400px', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 8px 0',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
          }}>
          Import Private Key
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0,
            lineHeight: '1.6',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
          }}>
          Enter your private key (WIF or hex format) to import your wallet
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative' }}>
          <textarea
            value={contextData.privateKey}
            onChange={handlePrivateKeyChange}
            placeholder="Enter your private key (WIF or hex format)"
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '16px',
              paddingRight: '48px',
              background: 'var(--modern-bg-secondary)',
              border: 'var(--modern-border-width) solid var(--modern-border-color)',
              borderRadius: '10px',
              color: 'white',
              fontSize: '14px',
              fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
              resize: 'vertical',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--modern-border-focus)';
              e.target.style.background = 'var(--modern-bg-tertiary)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--modern-border-color)';
              e.target.style.background = 'var(--modern-bg-secondary)';
            }}
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowPrivateKey(!showPrivateKey)}
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'rgba(255, 255, 255, 0.6)',
              padding: '4px'
            }}>
            {showPrivateKey ? <EyeOff size={20} /> : <Eye size={20} />}
          </motion.button>
        </div>
      </div>

      <ModernButton
        variant="primary"
        size="large"
        fullWidth
        onClick={validatePrivateKey}
        disabled={!contextData.step1Completed || isLoading}
        loading={isLoading}>
        Continue
      </ModernButton>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ maxWidth: '400px', width: '100%' }}>
      <div style={{ marginBottom: '32px' }}>
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 8px 0',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
          }}>
          Choose Address Type
        </h2>
        <p
          style={{
            fontSize: '15px',
            color: 'rgba(255, 255, 255, 0.7)',
            margin: 0,
            lineHeight: '1.6',
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
          }}>
          Select the address type that matches your wallet
        </p>
      </div>

      <div style={{ marginBottom: '24px' }}>
        {addressTypes.map((addressType, index) => {
          const address = previewAddresses[index];
          const assets = addressAssets[address] || {
            total_btc: '--',
            satoshis: 0,
            total_inscription: 0
          };
          const isSelected = contextData.addressType === addressType.value;
          const hasBalance = assets.satoshis > 0;

          return (
            <motion.div
              key={addressType.value}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{ marginBottom: '12px' }}>
              <ModernCard
                padding="md"
                hoverable
                onClick={() => handleAddressTypeSelect(addressType.value)}
                style={{
                  background: isSelected ? 'var(--modern-bg-tertiary)' : 'var(--modern-bg-secondary)',
                  border: isSelected
                    ? 'var(--modern-border-width) solid var(--modern-border-focus)'
                    : 'var(--modern-border-width) solid var(--modern-border-color)',
                  cursor: 'pointer'
                }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                  <h3
                    style={{
                      fontSize: '16px',
                      fontWeight: '600',
                      color: 'white',
                      margin: 0,
                      fontFamily:
                        "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
                    }}>
                    {addressType.name}
                  </h3>
                  {hasBalance && (
                    <div
                      style={{
                        padding: '4px 8px',
                        background: 'var(--modern-accent-primary)',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: '600',
                        color: 'white'
                      }}>
                      {assets.total_btc} BTC
                    </div>
                  )}
                </div>

                <p
                  style={{
                    fontSize: '12px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    margin: '0 0 8px 0',
                    fontFamily: "Monaco, Menlo, 'Ubuntu Mono', monospace",
                    wordBreak: 'break-all'
                  }}>
                  {address}
                </p>

                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  <span>Balance: {assets.total_btc} BTC</span>
                  <span>Inscriptions: {assets.total_inscription}</span>
                </div>
              </ModernCard>
            </motion.div>
          );
        })}
      </div>

      <ModernButton
        variant="primary"
        size="large"
        fullWidth
        onClick={handleImportWallet}
        disabled={isLoading}
        loading={isLoading}>
        Import Wallet
      </ModernButton>
    </motion.div>
  );

  return (
    <div
      className="modern-ui-container"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'var(--modern-bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        style={{
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleBack}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            marginRight: '12px'
          }}>
          <ArrowLeft size={24} color="var(--modern-accent-primary)" />
        </motion.button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={20} color="var(--modern-accent-primary)" />
          <h1
            style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'white',
              margin: 0,
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Helvetica Neue', Helvetica, Arial, sans-serif"
            }}>
            Import Private Key
          </h1>
        </div>
      </motion.div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start'
        }}>
        {contextData.currentStep === 1 ? renderStep1() : renderStep2()}
      </div>
    </div>
  );
};

export default ModernPrivateKeyImportScreen;
