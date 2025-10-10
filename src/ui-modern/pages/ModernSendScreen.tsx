import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import { COIN_DUST } from '@/shared/constant';
import { RawTxInfo } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChain } from '@/ui/state/settings/hooks';
import { useBitcoinTx, useFetchUtxosCallback, usePrepareSendBTCCallback } from '@/ui/state/transactions/hooks';
import { useUiTxCreateScreen, useUpdateUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { amountToSatoshis, isValidAddress, satoshisToAmount } from '@/ui/utils';

import { BackIcon } from '../components/common/Icons';
import { ModernButton } from '../components/common/ModernButton';
import { ModernErrorMessage } from '../components/common/ModernErrorMessage';
import { ModernAddressInput } from '../components/wallet';
import type { Asset } from '../components/wallet/ModernAssetsList';

export const ModernSendScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const location = useLocation();
  const tools = useTools();
  const accountBalance = useAccountBalance();
  const bitcoinTx = useBitcoinTx();
  const btcUnit = useBTCUnit();
  const chain = useChain();

  // Get selected asset from navigation state
  const selectedAsset = (location.state as any)?.selectedAsset as Asset | undefined;

  console.log('ModernSendScreen - Selected asset:', selectedAsset);

  // UI State
  const setUiState = useUpdateUiTxCreateScreen();
  const uiState = useUiTxCreateScreen();
  const toInfo = uiState.toInfo;
  const inputAmount = uiState.inputAmount;
  const enableRBF = uiState.enableRBF;
  const feeRate = uiState.feeRate;

  // Local state
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState('');
  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();
  const [selectedFeeOption, setSelectedFeeOption] = useState<'slow' | 'medium' | 'high' | 'custom'>('medium');
  const [customFeeRate, setCustomFeeRate] = useState('');

  // Hooks
  const fetchUtxos = useFetchUtxosCallback();
  const prepareSendBTC = usePrepareSendBTCCallback();

  // Computed values
  const toSatoshis = useMemo(() => {
    if (!inputAmount) return 0;
    return amountToSatoshis(inputAmount);
  }, [inputAmount]);

  const dustAmount = useMemo(() => satoshisToAmount(COIN_DUST), [COIN_DUST]);
  const availableAmount = satoshisToAmount(accountBalance.availableBalance);

  // USD value calculation
  const usdValue = useMemo(() => {
    if (!inputAmount) return '0.00';
    const btcAmount = parseFloat(inputAmount);
    const usd = btcAmount * 50000; // Replace with actual price from context
    return usd.toFixed(2);
  }, [inputAmount]);

  // Initialize
  useEffect(() => {
    tools.showLoading(true);
    fetchUtxos().finally(() => {
      tools.showLoading(false);
    });
  }, []);

  // Validation and transaction preparation
  useEffect(() => {
    setError('');
    setDisabled(true);

    if (!isValidAddress(toInfo.address)) {
      return;
    }
    if (!toSatoshis) {
      return;
    }
    if (toSatoshis < COIN_DUST) {
      setError(`${t('amount_must_be_at_least')} ${dustAmount} ${btcUnit}`);
      return;
    }

    if (toSatoshis > accountBalance.availableBalance) {
      setError(t('amount_exceeds_your_available_balance'));
      return;
    }

    if (feeRate <= 0) {
      return;
    }

    prepareSendBTC({ toAddressInfo: toInfo, toAmount: toSatoshis, feeRate, enableRBF })
      .then((data) => {
        setRawTxInfo(data);
        setDisabled(false);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, [toInfo, inputAmount, feeRate, enableRBF]);

  // Handlers
  const handleBack = () => {
    navigate('#back');
  };

  const handleNext = () => {
    navigate('TxConfirmScreen', { rawTxInfo, toAmount: toSatoshis, enableRBF, feeRate });
  };

  const handleMaxAmount = () => {
    setUiState({ inputAmount: availableAmount.toString() });
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
      const feeRates = { slow: 1, medium: 5, high: 10 };
      setUiState({ feeRate: feeRates[option] });
    }
  };

  const handleCustomFeeChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setCustomFeeRate(sanitized);

    if (sanitized && parseInt(sanitized) > 0) {
      setUiState({ feeRate: parseInt(sanitized) });
    }
  };

  const handleRBFToggle = () => {
    setUiState({ enableRBF: !enableRBF });
  };

  // Helper function to get asset icon
  const getAssetIcon = () => {
    if (!selectedAsset) {
      // Default BTC icon
      return (
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f7931a 0%, #ffb347 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            fontWeight: 'bold',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(247, 147, 26, 0.3)'
          }}>
          ₿
        </div>
      );
    }

    if (selectedAsset.type === 'btc') {
      return (
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #f7931a 0%, #ffb347 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '40px',
            fontWeight: 'bold',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(247, 147, 26, 0.3)'
          }}>
          ₿
        </div>
      );
    }

    if (selectedAsset.icon) {
      return (
        <img
          src={selectedAsset.icon}
          alt={selectedAsset.name}
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            objectFit: 'cover',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)'
          }}
        />
      );
    }

    // Default icon based on type
    const iconColor =
      {
        rune: '#8b5cf6',
        alkane: '#06b6d4',
        cat20: '#10b981',
        cat721: '#f59e0b',
        brc20: '#ef4444',
        ordinal: '#6b7280',
        simplicity: '#3b82f6'
      }[selectedAsset.type] || '#6b7280';

    return (
      <div
        style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: iconColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontSize: '32px',
          fontWeight: '700',
          boxShadow: `0 8px 24px ${iconColor}50`
        }}>
        {selectedAsset.symbol?.charAt(0) || selectedAsset.name.charAt(0)}
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
        backgroundColor: '#121212',
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
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
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
          Envoyer {getAssetDisplayName()}
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
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px'
        }}>
        {/* Asset Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
          {getAssetIcon()}
        </motion.div>

        {/* Address Input */}
        <ModernAddressInput
          value={toInfo.address}
          onChange={handleAddressChange}
          placeholder="Adresse Base du destinataire"
          label="Adresse destinataire"
          autoFocus={true}
        />

        {/* Amount Input with Fees - Combined Box */}
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
                Montant
              </label>
              <span style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                Disponible {getAvailableAmount()} {getAssetDisplayName()}
              </span>
            </div>
          </div>

          {/* Combined Input Container with Rounded Corners */}
          <div
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '16px',
              overflow: 'hidden'
            }}>
            {/* Amount Input Section */}
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                    fontSize: '20px',
                    fontWeight: '600'
                  }}
                />
                <span style={{ fontSize: '16px', color: 'rgba(255, 255, 255, 0.6)', fontWeight: '600' }}>
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
                    fontSize: '12px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    borderRadius: '8px'
                  }}>
                  Max
                </motion.button>
              </div>

              {/* USD Value */}
              <div style={{ marginTop: '8px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.5)' }}>~${usdValue}</div>
            </div>

            {/* Vertical Separator */}
            <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.1)', margin: '0' }} />

            {/* Fee Buttons Section */}
            <div style={{ padding: '16px' }}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)', fontWeight: '600' }}>
                  Frais réseau
                </label>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                {(['slow', 'medium', 'high', 'custom'] as const).map((option) => {
                  const isSelected = selectedFeeOption === option;
                  const labels = { slow: 'Lent', medium: 'Moyen', high: 'Rapide', custom: 'Custom' };

                  if (option === 'custom') {
                    return (
                      <div
                        key={option}
                        style={{
                          flex: 1,
                          padding: '10px 8px',
                          borderRadius: '12px',
                          border: '1.5px solid',
                          borderColor: isSelected ? '#34c759' : 'rgba(255, 255, 255, 0.2)',
                          backgroundColor: isSelected ? 'rgba(52, 199, 89, 0.15)' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                        <input
                          type="text"
                          value={customFeeRate}
                          onChange={(e) => handleCustomFeeChange(e.target.value)}
                          onFocus={() => handleFeeOptionChange('custom')}
                          placeholder="Custom"
                          style={{
                            width: '100%',
                            background: 'none',
                            border: 'none',
                            outline: 'none',
                            color: '#ffffff',
                            fontSize: '13px',
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
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleFeeOptionChange(option)}
                      style={{
                        flex: 1,
                        padding: '10px 8px',
                        borderRadius: '12px',
                        border: '1.5px solid',
                        borderColor: isSelected ? '#34c759' : 'rgba(255, 255, 255, 0.2)',
                        backgroundColor: isSelected ? 'rgba(52, 199, 89, 0.15)' : 'transparent',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}>
                      {labels[option]}
                    </motion.button>
                  );
                })}
              </div>

              {/* Fee Rate Display */}
              <div
                style={{ marginTop: '12px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center' }}>
                {feeRate} sat/vB • ~{Math.round(feeRate * 0.25 * 100) / 100} sats
              </div>
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
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#ffffff', marginBottom: '2px' }}>RBF</div>
            <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Replace-by-fee</div>
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleRBFToggle}
            style={{
              width: '44px',
              height: '24px',
              borderRadius: '12px',
              border: 'none',
              backgroundColor: enableRBF ? '#007aff' : 'rgba(255, 255, 255, 0.2)',
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
          Annuler
        </ModernButton>
        <ModernButton
          variant="primary"
          size="large"
          fullWidth
          disabled={disabled}
          onClick={handleNext}
          style={{ flex: 1 }}>
          Suivant
        </ModernButton>
      </div>
    </div>
  );
};
