import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { COIN_DUST } from '@/shared/constant';
import { RawTxInfo } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { getSpecialLocale, useI18n } from '@/ui/hooks/useI18n';
import { useUtxoTools } from '@/ui/hooks/useUtxoTools';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance } from '@/ui/state/accounts/hooks';
import { useBTCUnit, useChain, useWalletConfig } from '@/ui/state/settings/hooks';
import { useBitcoinTx, useFetchUtxosCallback, usePrepareSendBTCCallback } from '@/ui/state/transactions/hooks';
import { useUiTxCreateScreen, useUpdateUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { amountToSatoshis, isValidAddress, satoshisToAmount } from '@/ui/utils';

import { BackIcon } from '../components/common/Icons';
import { ModernButton } from '../components/common/ModernButton';
import { ModernErrorMessage } from '../components/common/ModernErrorMessage';
import {
    ModernAddressInput,
    ModernAmountInput,
    ModernBalanceCard,
    ModernFeeSelector,
    ModernRFBToggle
} from '../components/wallet';

export const ModernSendScreen: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const tools = useTools();
  const accountBalance = useAccountBalance();
  const bitcoinTx = useBitcoinTx();
  const btcUnit = useBTCUnit();
  const chain = useChain();
  const walletConfig = useWalletConfig();
  const { openUtxoTools } = useUtxoTools(chain);

  // UI State
  const setUiState = useUpdateUiTxCreateScreen();
  const uiState = useUiTxCreateScreen();
  const toInfo = uiState.toInfo;
  const inputAmount = uiState.inputAmount;
  const enableRBF = uiState.enableRBF;
  const feeRate = uiState.feeRate;

  // Local state
  const [isSpecialLocale, setIsSpecialLocale] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [error, setError] = useState('');
  const [autoAdjust, setAutoAdjust] = useState(false);
  const [rawTxInfo, setRawTxInfo] = useState<RawTxInfo>();

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
  const unavailableAmount = satoshisToAmount(accountBalance.unavailableBalance);
  const showUnavailable = accountBalance.unavailableBalance > 0;

  // Initialize
  useEffect(() => {
    getSpecialLocale().then(({ isSpecialLocale }) => {
      setIsSpecialLocale(isSpecialLocale);
    });
  }, []);

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

    if (
      toInfo.address == bitcoinTx.toAddress &&
      toSatoshis == bitcoinTx.toSatoshis &&
      feeRate == bitcoinTx.feeRate &&
      enableRBF == bitcoinTx.enableRBF
    ) {
      setDisabled(false);
      return;
    }

    prepareSendBTC({ toAddressInfo: toInfo, toAmount: toSatoshis, feeRate, enableRBF })
      .then((data) => {
        setRawTxInfo(data);
        setDisabled(false);
      })
      .catch((e) => {
        console.log(e);
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
    setAutoAdjust(true);
    setUiState({ inputAmount: availableAmount.toString() });
  };

  const handleAddressChange = (address: string) => {
    setUiState({ toInfo: { ...toInfo, address } });
  };

  const handleAmountChange = (amount: string) => {
    if (autoAdjust == true) {
      setAutoAdjust(false);
    }
    setUiState({ inputAmount: amount });
  };

  const handleFeeRateChange = (rate: number) => {
    setUiState({ feeRate: rate });
  };

  const handleRBFChange = (enabled: boolean) => {
    setUiState({ enableRBF: enabled });
  };

  const unavailableTipText = useMemo(() => {
    let tipText = '';
    tipText += t('unavailable_tooltip');

    if (walletConfig.disableUtxoTools) {
      tipText += t('future_versions_will_support_spending_these_assets');
    } else {
      tipText += t('you_can_unlock_these_assets_by_using_the_utxos_tools');
    }
    return tipText;
  }, [chain.enum]);

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
          {t('send')} {btcUnit}
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
          gap: '24px'
        }}>
        {/* Chain Icon */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '8px'
          }}>
          <img src={chain.icon} alt="Chain" style={{ width: '50px', height: '50px' }} />
        </motion.div>

        {/* Address Input */}
        <ModernAddressInput
          value={toInfo.address}
          onChange={handleAddressChange}
          placeholder={t('enter_bitcoin_address')}
          label={t('recipient_address')}
          autoFocus={true}
        />

        {/* Amount Input */}
        <ModernAmountInput
          value={inputAmount}
          onChange={handleAmountChange}
          placeholder={t('tx_amount')}
          label={t('transfer_amount')}
          maxAmount={accountBalance.availableBalance}
          btcUnit={btcUnit}
          onMaxClick={handleMaxAmount}
          showUsdValue={true}
          usdPrice={50000}
        />

        {/* Balance Card */}
        <ModernBalanceCard
          availableBalance={accountBalance.availableBalance}
          unavailableBalance={accountBalance.unavailableBalance}
          btcUnit={btcUnit}
          showUnavailable={showUnavailable}
          onUnlockClick={openUtxoTools}
          canUnlock={!walletConfig.disableUtxoTools}
          unavailableTooltip={unavailableTipText}
        />

        {/* Fee Selector */}
        <ModernFeeSelector selectedRate={feeRate} onRateChange={handleFeeRateChange} showEstimatedTime={true} />

        {/* RBF Toggle */}
        <ModernRFBToggle enabled={enableRBF} onToggle={handleRBFChange} />

        {/* Error Message */}
        {error && <ModernErrorMessage message={error} type="error" showIcon={true} />}

        {/* Next Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.0, duration: 0.5 }}
          style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <ModernButton variant="primary" size="large" fullWidth disabled={disabled} onClick={handleNext}>
            {t('next')}
          </ModernButton>
        </motion.div>
      </motion.div>
    </div>
  );
};
