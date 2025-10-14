import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle, Key } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { ADDRESS_TYPES, getRestoreWallets } from '@/shared/constant';
import { AddressType, RestoreWalletType } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { satoshisToAmount, useWallet } from '@/ui/utils';

import { useNavigate } from '../../ui/pages/MainRoute';
import { ModernButton } from '../components/common/ModernButton';
import { ModernInput } from '../components/common/ModernInput';

interface ContextData {
  wif: string;
  addressType: AddressType;
  step1Completed: boolean;
  currentStep: 'input' | 'address-type';
}

interface UpdateContextDataParams {
  wif?: string;
  addressType?: AddressType;
  step1Completed?: boolean;
  currentStep?: 'input' | 'address-type';
}

export const ModernCreateSimpleWalletScreen: React.FC = () => {
  const { state } = useLocation();
  const { restoreWalletType } = (state as { restoreWalletType?: RestoreWalletType }) || {};
  const navigate = useNavigate();
  const wallet = useWallet();
  const tools = useTools();
  const { t } = useI18n();

  // Get the default address type based on the restore wallet type
  const getDefaultAddressType = (walletType?: RestoreWalletType): AddressType => {
    if (!walletType) return AddressType.P2WPKH;

    const restoreWallets = getRestoreWallets();
    const wallet = restoreWallets.find((w) => w.value === walletType);
    return wallet?.addressTypes[0] || AddressType.P2WPKH;
  };

  const [contextData, setContextData] = useState<ContextData>({
    wif: '',
    addressType: getDefaultAddressType(restoreWalletType),
    step1Completed: false,
    currentStep: 'input'
  });

  const [previewAddresses, setPreviewAddresses] = useState<string[]>([]);
  const [addressAssets, setAddressAssets] = useState<{
    [key: string]: { total_btc: string; satoshis: number; total_inscription: number };
  }>({});

  const updateContextData = useCallback((params: UpdateContextDataParams) => {
    setContextData((prev) => ({ ...prev, ...params }));
  }, []);

  // Get available address types based on restore wallet type
  const availableAddressTypes = useMemo(() => {
    if (!restoreWalletType) {
      return ADDRESS_TYPES.filter((v) => v.displayIndex >= 0 && !v.isUnisatLegacy).sort(
        (a, b) => a.displayIndex - b.displayIndex
      );
    }

    const restoreWallets = getRestoreWallets();
    const wallet = restoreWallets.find((w) => w.value === restoreWalletType);
    if (!wallet) return ADDRESS_TYPES.filter((v) => v.displayIndex >= 0 && !v.isUnisatLegacy);

    return ADDRESS_TYPES.filter(
      (v) => wallet.addressTypes.includes(v.value) && v.displayIndex >= 0 && !v.isUnisatLegacy
    ).sort((a, b) => a.displayIndex - b.displayIndex);
  }, [restoreWalletType]);

  // Generate preview addresses
  useEffect(() => {
    const generatePreviewAddresses = async () => {
      if (!contextData.wif || contextData.currentStep !== 'address-type') return;

      const addresses: string[] = [];
      for (let i = 0; i < availableAddressTypes.length; i++) {
        try {
          const res = await wallet.createTmpKeyringWithPrivateKey(contextData.wif, availableAddressTypes[i].value);
          if (res.accounts.length > 0) {
            addresses.push(res.accounts[0].address);
          } else {
            addresses.push('');
          }
        } catch (e) {
          addresses.push('');
        }
      }
      setPreviewAddresses(addresses);
    };

    generatePreviewAddresses();
  }, [contextData.wif, contextData.currentStep, availableAddressTypes, wallet]);

  // Fetch address assets
  useEffect(() => {
    const fetchAddressAssets = async () => {
      if (previewAddresses.length === 0) return;

      try {
        const assets = await wallet.getMultiAddressAssets(previewAddresses);
        setAddressAssets(assets);
      } catch (e) {
        console.error('Failed to fetch address assets:', e);
      }
    };

    fetchAddressAssets();
  }, [previewAddresses, wallet]);

  const handlePrivateKeySubmit = async () => {
    if (!contextData.wif) return;

    try {
      const res = await wallet.createTmpKeyringWithPrivateKey(contextData.wif, contextData.addressType);
      if (res.accounts.length === 0) {
        throw new Error(t('invalid_privatekey'));
      }
      updateContextData({ currentStep: 'address-type' });
    } catch (e) {
      tools.toastError((e as Error).message);
    }
  };

  const handleAddressTypeSelect = (addressType: AddressType) => {
    updateContextData({ addressType });
  };

  const handleFinalSubmit = async () => {
    try {
      await wallet.createKeyringWithPrivateKey(contextData.wif, contextData.addressType);
      navigate('MainScreen');
    } catch (e) {
      tools.toastError((e as Error).message);
    }
  };

  const handleBack = () => {
    if (contextData.currentStep === 'address-type') {
      updateContextData({ currentStep: 'input' });
    } else {
      navigate('#back');
    }
  };

  const getWalletName = () => {
    if (!restoreWalletType) return 'Wallet';
    const restoreWallets = getRestoreWallets();
    const wallet = restoreWallets.find((w) => w.value === restoreWalletType);
    return wallet?.name || 'Wallet';
  };

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

        <h1
          style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'white',
            margin: 0,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
          }}>
          {contextData.currentStep === 'input' ? 'Import Private Key' : 'Choose Address Type'}
        </h1>
      </motion.div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px'
        }}>
        {contextData.currentStep === 'input' ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
            {/* Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '20px',
                background: 'rgba(114, 227, 173, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <Key size={40} color="var(--modern-accent-primary)" />
            </motion.div>

            {/* Title and Description */}
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 8px 0',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
                }}>
                Import {getWalletName()}
              </h2>
              <p
                style={{
                  fontSize: '15px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0,
                  lineHeight: '1.6',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
                }}>
                Enter your private key to import your existing wallet
              </p>
            </div>

            {/* Private Key Input */}
            <div style={{ width: '100%' }}>
              <ModernInput
                placeholder="Enter private key (WIF or hex format)"
                value={contextData.wif}
                onChange={(e) => updateContextData({ wif: e.target.value })}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && contextData.wif) {
                    handlePrivateKeySubmit();
                  }
                }}
                autoFocus
                fullWidth
              />
            </div>

            {/* Continue Button */}
            <ModernButton
              variant="primary"
              size="large"
              fullWidth
              disabled={!contextData.wif}
              onClick={handlePrivateKeySubmit}
              style={{
                background: contextData.wif ? 'var(--modern-accent-primary)' : 'rgba(255, 255, 255, 0.1)',
                color: contextData.wif ? 'black' : 'rgba(255, 255, 255, 0.3)',
                cursor: contextData.wif ? 'pointer' : 'not-allowed',
                border: 'none',
                boxShadow: 'none'
              }}>
              Continue
            </ModernButton>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
              maxWidth: '400px',
              margin: '0 auto'
            }}>
            {/* Title */}
            <div style={{ textAlign: 'center' }}>
              <h2
                style={{
                  fontSize: '20px',
                  fontWeight: '600',
                  color: 'white',
                  margin: '0 0 8px 0',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
                }}>
                Choose Address Type
              </h2>
              <p
                style={{
                  fontSize: '14px',
                  color: 'rgba(255, 255, 255, 0.7)',
                  margin: 0,
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
                }}>
                Select the address type for your {getWalletName()}
              </p>
            </div>

            {/* Address Type Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {availableAddressTypes.map((addressType, index) => {
                const address = previewAddresses[index] || '';
                const assets = addressAssets[address] || { total_btc: '0', satoshis: 0, total_inscription: 0 };
                const isSelected = contextData.addressType === addressType.value;

                return (
                  <motion.div
                    key={addressType.value}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleAddressTypeSelect(addressType.value)}
                    style={{
                      background: isSelected ? 'rgba(114, 227, 173, 0.1)' : 'var(--modern-bg-secondary)',
                      border: isSelected
                        ? '1px solid var(--modern-accent-primary)'
                        : '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '12px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      position: 'relative'
                    }}>
                    {/* Selection indicator */}
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '20px',
                          height: '20px',
                          borderRadius: '50%',
                          background: 'var(--modern-accent-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          pointerEvents: 'none'
                        }}>
                        <CheckCircle size={12} color="white" />
                      </motion.div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div
                        style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: 'white',
                          fontFamily:
                            '-apple-system, BlinkMacSystemFont, \'SF Pro Display\', \'SF Pro Text\', \'Helvetica Neue\', Helvetica, Arial, sans-serif'
                        }}>
                        {addressType.name}
                      </div>

                      {address && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            fontFamily: 'monospace',
                            wordBreak: 'break-all'
                          }}>
                          {address}
                        </div>
                      )}

                      {assets.satoshis > 0 && (
                        <div
                          style={{
                            fontSize: '14px',
                            color: 'var(--modern-accent-primary)',
                            fontWeight: '500'
                          }}>
                          {satoshisToAmount(assets.satoshis)} BTC
                          {assets.total_inscription > 0 && ` • ${assets.total_inscription} inscriptions`}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Import Button */}
            <ModernButton
              variant="primary"
              size="large"
              fullWidth
              onClick={handleFinalSubmit}
              style={{
                marginTop: '20px'
              }}>
              Import Wallet
            </ModernButton>
          </motion.div>
        )}
      </div>
    </div>
  );
};
