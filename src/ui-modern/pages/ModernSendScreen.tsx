import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { COIN_DUST } from '@/shared/constant';
import { RawTxInfo } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { useDynamicFees } from '@/ui/hooks/useDynamicFees';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { usePrice } from '@/ui/provider/PriceProvider';
import { useAccountBalance } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import { useBitcoinTx, useFetchUtxosCallback, usePrepareSendUnifiedCallback } from '@/ui/state/transactions/hooks';
import { useUiTxCreateScreen, useUpdateUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { amountToSatoshis, isValidAddress, satoshisToAmount, useWallet } from '@/ui/utils';

import { BackIcon } from '../components/common/Icons';
import { ModernButton } from '../components/common/ModernButton';
import { ModernErrorMessage } from '../components/common/ModernErrorMessage';
import { ModernAddressInput } from '../components/wallet';
import type { Asset } from '../components/wallet/ModernAssetsList';
import { getAssetLogo } from '../config/asset-logos';

export const ModernSendScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const tools = useTools();
  const accountBalance = useAccountBalance();
  const bitcoinTx = useBitcoinTx();
  const btcUnit = useBTCUnit();
  const chain = useChain();
  const wallet = useWallet();
  const { coinPrice } = usePrice();

  // Dynamic fees hook
  const {
    feeRates: dynamicFeeRates,
    selectedFeeRate: dynamicFeeRate,
    selectedLevel,
    isLoading: feesLoading,
    setSelectedFeeRate: setDynamicFeeRate,
    setSelectedLevel: setDynamicLevel
  } = useDynamicFees();

  // Get selected asset from navigation state
  const selectedAsset = (location.state as any)?.selectedAsset as Asset | undefined;

  console.log('ModernSendScreen - Selected asset:', selectedAsset);

  // UI State
  const setUiState = useUpdateUiTxCreateScreen();
  const uiState = useUiTxCreateScreen();
  const toInfo = uiState.toInfo;
  const inputAmount = uiState.inputAmount;
  const enableRBF = uiState.enableRBF;
  // Utiliser les fees dynamiques au lieu des fees statiques
  const feeRate = dynamicFeeRate || uiState.feeRate;

  // Local state
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState('');
  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();
  const [selectedFeeOption, setSelectedFeeOption] = useState<'slow' | 'medium' | 'high' | 'custom'>('medium');
  const [customFeeRate, setCustomFeeRate] = useState('');

  // Token price states
  const [tokenPrice, setTokenPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  // Hooks
  const fetchUtxos = useFetchUtxosCallback();
  const prepareSendUnified = usePrepareSendUnifiedCallback();

  // Fonction pour fetch le prix du token spécifique
  const fetchTokenPrice = useCallback(async () => {
    if (!selectedAsset || selectedAsset.type === 'btc') {
      setTokenPrice(null);
      return;
    }

    setIsLoadingPrice(true);
    try {
      if (selectedAsset.type === 'simplicity') {
        const priceMap = await wallet.getSimplicitysPrice([selectedAsset.symbol || selectedAsset.name]);
        const price = priceMap[selectedAsset.symbol || selectedAsset.name];
        setTokenPrice(price ? price.curPrice : 0);
      }
      // Ajouter d'autres types de tokens si nécessaire (runes, cat20, etc.)
    } catch (error) {
      console.error('Failed to fetch token price:', error);
      setTokenPrice(0);
    } finally {
      setIsLoadingPrice(false);
    }
  }, [selectedAsset, wallet]);

  // Computed values
  const inputAmountNum = useMemo(() => {
    if (!inputAmount) return 0;
    return parseFloat(inputAmount);
  }, [inputAmount]);

  const toSatoshis = useMemo(() => {
    if (!inputAmount) return 0;
    return amountToSatoshis(inputAmount);
  }, [inputAmount]);

  const dustAmount = useMemo(() => satoshisToAmount(COIN_DUST), [COIN_DUST]);
  const availableAmount = satoshisToAmount(accountBalance.availableBalance);

  // Calculer le montant BTC nécessaire pour les tokens (frais + 330 sats)
  const btcAmountForTokens = useMemo(() => {
    if (!selectedAsset || selectedAsset.type === 'btc') {
      return toSatoshis; // Pour BTC, utiliser toSatoshis normal
    }

    // Pour les tokens, calculer le montant BTC nécessaire :
    // - Frais de transaction (estimés)
    // - 330 sats pour le destinataire
    const estimatedFee = 1000; // Estimation des frais en sats
    const recipientSats = 330; // Sats envoyés au destinataire pour recevoir le token
    return estimatedFee + recipientSats;
  }, [selectedAsset, toSatoshis]);

  // USD value calculation - SE MET À JOUR EN TEMPS RÉEL selon l'input
  const usdValue = useMemo(() => {
    if (!inputAmount || parseFloat(inputAmount) === 0) return '0.00';

    const inputAmountNum = parseFloat(inputAmount);

    if (!selectedAsset || selectedAsset.type === 'btc') {
      // Pour BTC - utiliser le prix BTC standard
      const btcAmount = inputAmountNum;
      const btcPrice = coinPrice?.btc || 50000; // Fallback si pas de prix
      const usd = btcAmount * btcPrice;
      return usd.toFixed(2);
    }

    // Pour les tokens spécifiques
    if (tokenPrice && tokenPrice > 0) {
      // Le tokenPrice est en satoshis par unité de token
      // Calculer la valeur en satoshis du montant saisi
      const valueInSats = inputAmountNum * tokenPrice;

      // Convertir les satoshis en BTC puis en USD
      const btcPrice = coinPrice?.btc || 50000;
      const usdValue = (valueInSats / 100000000) * btcPrice;

      return usdValue.toFixed(2);
    }

    // Si pas de prix disponible, essayer d'utiliser la valeur de l'asset
    if (selectedAsset.usdValue && selectedAsset.usdValue !== '-') {
      const assetAmount = parseFloat(selectedAsset.amount);
      if (assetAmount > 0) {
        const totalUsdValue = parseFloat(selectedAsset.usdValue.replace('$', '').replace(',', ''));
        const ratio = inputAmountNum / assetAmount;
        const inputUsdValue = totalUsdValue * ratio;
        return inputUsdValue.toFixed(2);
      }
    }

    return isLoadingPrice ? '...' : '0.00';
  }, [inputAmount, selectedAsset, tokenPrice, coinPrice, isLoadingPrice]);

  // Initialize
  useEffect(() => {
    tools.showLoading(true);
    fetchUtxos().finally(() => {
      tools.showLoading(false);
    });
  }, []);

  // Fetch le prix au montage ou changement d'asset
  useEffect(() => {
    fetchTokenPrice();
  }, [fetchTokenPrice]);

  // Validation and transaction preparation
  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toInfo.address)) {
      return;
    }
    if (!inputAmountNum) {
      return;
    }

    // Validation COIN_DUST - IMPORTANT pour les tokens car les frais sont en BTC
    if (btcAmountForTokens < COIN_DUST) {
      setError(`${t('amount_must_be_at_least')} ${dustAmount} ${btcUnit}`);
      return;
    }

    // Validation spécifique selon le type d'asset
    if (selectedAsset && selectedAsset.type !== 'btc') {
      const availableAmount = parseFloat(selectedAsset.amount);

      // Vérifier que l'utilisateur a assez de tokens
      if (inputAmountNum > availableAmount) {
        setError(t('amount_exceeds_your_available_balance'));
        return;
      }

      // Vérifier que l'utilisateur a assez de BTC pour les frais + 330 sats
      if (btcAmountForTokens > accountBalance.availableBalance) {
        setError(t('insufficient_btc_for_fees'));
        return;
      }
    } else {
      // Pour BTC, validation normale
      if (toSatoshis > accountBalance.availableBalance) {
        setError(t('amount_exceeds_your_available_balance'));
        return;
      }
    }

    if (feeRate <= 0) {
      return;
    }

    // Utiliser le hook unifié
    prepareSendUnified({
      selectedAsset: selectedAsset || { type: 'btc', id: 'btc', name: 'Bitcoin', amount: '0' },
      toAddressInfo: toInfo,
      toAmount: selectedAsset && selectedAsset.type !== 'btc' ? inputAmountNum : toSatoshis,
      feeRate,
      enableRBF
    })
      .then((data) => {
        setRawTxInfo(data);
        setDisabled(false);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [
    toInfo,
    inputAmount,
    feeRate,
    enableRBF,
    selectedAsset,
    inputAmountNum,
    toSatoshis,
    btcAmountForTokens,
    accountBalance,
    t,
    dustAmount,
    btcUnit,
    prepareSendUnified
  ]);

  // Handlers
  const handleBack = () => {
    navigate('#back');
  };

  const handleNext = () => {
    navigate('TxConfirmScreen', { rawTxInfo, toAmount: toSatoshis, enableRBF, feeRate, selectedAsset });
  };

  const handleMaxAmount = () => {
    const maxAmount = getAvailableAmount();
    setUiState({ inputAmount: maxAmount.toString() });
  };

  const handleAddressChange = (address: string) => {
    setUiState({ toInfo: { ...toInfo, address } });
  };

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    const sanitized = value.replace(/[^0-9.]/g, '');
    const parts = sanitized.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 8) return;

    setUiState({ inputAmount: sanitized });
  };

  const handleFeeOptionChange = (option: 'slow' | 'medium' | 'high' | 'custom') => {
    setSelectedFeeOption(option);

    if (option !== 'custom') {
      // Utiliser les fees dynamiques si disponibles
      const dynamicFee = getDynamicFeeRate(option);
      setUiState({ feeRate: dynamicFee });
    }
  };

  const handleCustomFeeChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setCustomFeeRate(sanitized);

    if (sanitized && parseInt(sanitized) > 0) {
      setUiState({ feeRate: parseInt(sanitized) });
    }
  };

  const getDynamicFeeRate = (option: string) => {
    switch (option) {
      case 'slow':
        return dynamicFeeRates.find((f) => f.label === 'Slow')?.feeRate || 1;
      case 'medium':
        return dynamicFeeRates.find((f) => f.label === 'Medium')?.feeRate || 5;
      case 'high':
        return dynamicFeeRates.find((f) => f.label === 'Fast')?.feeRate || 10;
      default:
        return feeRate;
    }
  };

  const handleRBFToggle = () => {
    setUiState({ enableRBF: !enableRBF });
  };

  // Helper function to get asset icon
  const getAssetIcon = () => {
    if (!selectedAsset) {
      // Default BTC icon in green
      return (
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#ffffff',
            boxShadow: '0 6px 18px rgba(52, 199, 89, 0.3)'
          }}>
          ₿
        </div>
      );
    }

    if (selectedAsset.type === 'btc') {
      return (
        <div
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #34c759 0%, #30d158 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '30px',
            fontWeight: 'bold',
            color: '#ffffff',
            boxShadow: '0 6px 18px rgba(52, 199, 89, 0.3)'
          }}>
          ₿
        </div>
      );
    }

    // Chercher le logo dans la liste des logos disponibles
    const assetLogoPath = getAssetLogo(selectedAsset.symbol, selectedAsset.name, selectedAsset.type);

    if (assetLogoPath) {
      return (
        <img
          src={assetLogoPath}
          alt={selectedAsset.name}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }

    // Si l'asset a déjà un icon défini, l'utiliser
    if (selectedAsset.icon) {
      return (
        <img
          src={selectedAsset.icon}
          alt={selectedAsset.name}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            objectFit: 'cover'
          }}
        />
      );
    }

    // Si pas de logo disponible, afficher juste le nom de l'asset sans le rond vert
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '18px',
          fontWeight: '700',
          textAlign: 'center',
          padding: '8px 12px',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
        {selectedAsset.symbol || selectedAsset.name}
      </div>
    );
  };

  // Get display name for the asset
  const getAssetDisplayName = () => {
    if (!selectedAsset) return btcUnit;
    return selectedAsset.symbol || selectedAsset.name;
  };

  // Get available amount for the asset
  const getAvailableAmount = () => {
    if (!selectedAsset || selectedAsset.type === 'btc') {
      return availableAmount;
    }
    return selectedAsset.amount;
  };

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
        {/* Back button */}
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

        {/* Title */}
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
          {t('send')} {getAssetDisplayName()}
        </motion.h1>

        {/* Spacer */}
        <div style={{ width: '40px' }} />
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        style={{
          flex: 1,
          padding: '20px',
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
        {/* Asset Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '4px'
          }}>
          {getAssetIcon()}
        </motion.div>

        {/* Address Input */}
        <ModernAddressInput
          value={toInfo.address}
          onChange={handleAddressChange}
          placeholder={t('recipient_address_placeholder')}
          label={t('recipient_address')}
          autoFocus={true}
        />

        {/* Amount Input with Fees - Combined */}
        <div>
          {/* Label and Available Balance */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label
                style={{
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#ffffff',
                  letterSpacing: '-0.08px'
                }}>
                {t('amount')}
              </label>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                {t('available')} {getAvailableAmount()} {getAssetDisplayName()}
              </span>
            </div>
          </div>

          {/* Combined Box */}
          <div
            style={{
              backgroundColor: 'var(--modern-bg-secondary)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
            {/* Amount Input Section */}
            <div style={{ padding: '8px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={inputAmount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  placeholder="0.00"
                  style={{
                    flex: 1,
                    background: 'none',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '15px',
                    fontWeight: '600'
                  }}
                />
                <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600' }}>
                  {getAssetDisplayName()}
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleMaxAmount}
                  style={{
                    background: 'rgba(52, 199, 89, 0.2)',
                    border: 'none',
                    color: '#34c759',
                    fontSize: '11px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}>
                  {t('max')}
                </motion.button>
              </div>
              {/* USD Value */}
              <div style={{ marginTop: '4px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                {isLoadingPrice ? '~$...' : `~$${usdValue}`}
              </div>
            </div>

            {/* Separator */}
            <div style={{ height: '1px', backgroundColor: 'var(--modern-border-color)' }} />

            {/* Network Fees - Band Style avec fees dynamiques */}
            <div
              style={{
                backgroundColor: 'var(--modern-bg-tertiary)',
                display: 'flex',
                gap: '0'
              }}>
              {(['slow', 'medium', 'high', 'custom'] as const).map((option, index) => {
                const isSelected = selectedFeeOption === option;
                const labels = { slow: t('slow'), medium: t('medium'), high: t('fast'), custom: t('custom') };
                const isFirst = index === 0;
                const isLast = index === 3;

                // Récupérer les fees dynamiques pour afficher les valeurs réelles
                const getDynamicFeeRate = (option: string) => {
                  switch (option) {
                    case 'slow':
                      return dynamicFeeRates.find((f) => f.label === 'Slow')?.feeRate || 1;
                    case 'medium':
                      return dynamicFeeRates.find((f) => f.label === 'Medium')?.feeRate || 5;
                    case 'high':
                      return dynamicFeeRates.find((f) => f.label === 'Fast')?.feeRate || 10;
                    default:
                      return feeRate;
                  }
                };

                if (option === 'custom') {
                  return (
                    <div
                      key={option}
                      style={{
                        flex: 1,
                        padding: '8px 6px',
                        backgroundColor: 'transparent',
                        border: isSelected ? '2px solid var(--modern-accent-primary)' : '2px solid transparent',
                        borderBottomRightRadius: isLast ? '12px' : '0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}>
                      <input
                        type="text"
                        value={customFeeRate}
                        onChange={(e) => handleCustomFeeChange(e.target.value)}
                        onFocus={() => handleFeeOptionChange('custom')}
                        placeholder={t('custom')}
                        style={{
                          width: '100%',
                          background: 'none',
                          border: 'none',
                          outline: 'none',
                          color: '#ffffff',
                          fontSize: '12px',
                          fontWeight: '600',
                          textAlign: 'center'
                        }}
                      />
                    </div>
                  );
                }

                return (
                  <motion.button
                    key={option}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => handleFeeOptionChange(option)}
                    style={{
                      flex: 1,
                      padding: '8px 6px',
                      border: isSelected ? '2px solid var(--modern-accent-primary)' : '2px solid transparent',
                      backgroundColor: 'transparent',
                      borderBottomLeftRadius: isFirst ? '12px' : '0',
                      borderBottomRightRadius: isLast ? '12px' : '0',
                      color: '#ffffff',
                      fontSize: '12px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '2px'
                    }}>
                    <div>{labels[option]}</div>
                    <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.6)' }}>
                      {getDynamicFeeRate(option)} sat/vB
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RBF Toggle - Compact */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 16px',
            backgroundColor: 'var(--modern-bg-secondary)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>{t('rbf')}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>{t('replace_by_fee')}</div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRBFToggle}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: enableRBF ? 'var(--modern-accent-primary)' : 'rgba(255, 255, 255, 0.2)',
              cursor: 'pointer',
              position: 'relative',
              transition: 'background-color 0.2s ease'
            }}>
            <motion.div
              animate={{ x: enableRBF ? 22 : 2 }}
              transition={{
                type: 'spring',
                stiffness: 500,
                damping: 30
              }}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: '#ffffff',
                position: 'absolute',
                top: '2px',
                left: '2px',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
              }}
            />
          </motion.button>
        </div>

        {/* Error Message */}
        {error && <ModernErrorMessage message={error} type="error" showIcon={true} />}
      </motion.div>

      {/* Bottom Buttons */}
      <div
        style={{
          padding: '16px 20px',
          display: 'flex',
          gap: '12px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
        <ModernButton variant="secondary" size="large" fullWidth onClick={handleBack} style={{ flex: 1 }}>
          {t('cancel')}
        </ModernButton>
        <ModernButton
          variant="primary"
          size="large"
          fullWidth
          disabled={disabled}
          onClick={handleNext}
          style={{ flex: 1 }}>
          {t('next')}
        </ModernButton>
      </div>
    </div>
  );
};
