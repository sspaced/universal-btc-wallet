import { motion } from 'framer-motion';
import React, { useState } from 'react';

import { RawTxInfo } from '@/shared/types';
import { useI18n } from '@/ui/hooks/useI18n';
import { useNavigate } from '@/ui/pages/MainRoute';
import { usePushBitcoinTxCallback } from '@/ui/state/transactions/hooks';
import { useLocationState } from '@/ui/utils';

import { ModernHeader } from '../components/layout/ModernHeader';
import { ModernMainContent } from '../components/layout/ModernMainContent';
import type { Asset } from '../components/wallet/ModernAssetsList';
import { ModernTxConfirmContent } from '../components/wallet/ModernTxConfirmContent';

interface LocationState {
  rawTxInfo: RawTxInfo;
  toAmount: number;
  enableRBF: boolean;
  feeRate: number;
  selectedAsset?: Asset;
}

export const ModernTxConfirmScreen: React.FC = () => {
  const { t } = useI18n();
  const { rawTxInfo, toAmount, enableRBF, feeRate, selectedAsset } = useLocationState<LocationState>();
  const navigate = useNavigate();
  const pushBitcoinTx = usePushBitcoinTxCallback();
  const [loading, setLoading] = useState(false);

  const handleBack = () => {
    navigate('#back');
  };

  const handleCancel = () => {
    navigate('#back');
  };

  const handleConfirm = async () => {
    try {
      setLoading(true);
      let txData = '';

      if (rawTxInfo && rawTxInfo.rawtx) {
        txData = rawTxInfo.rawtx;
      } else {
        throw new Error(t('invalid_transaction_data'));
      }

      const { success, txid, error } = await pushBitcoinTx(txData);
      if (success) {
        navigate('TxSuccessScreen', { txid });
      } else {
        throw new Error(error);
      }
    } catch (e) {
      navigate('TxFailScreen', { error: (e as any).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: 'var(--modern-bg-primary)',
        color: '#ffffff'
      }}>
      <ModernHeader title={t('confirm_transaction')} onBack={handleBack} showBackButton={true} />

      <ModernMainContent noPadding>
        <ModernTxConfirmContent
          rawTxInfo={rawTxInfo}
          toAmount={toAmount}
          enableRBF={enableRBF}
          feeRate={feeRate}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
          loading={loading}
          selectedAsset={selectedAsset}
        />
      </ModernMainContent>
    </motion.div>
  );
};
