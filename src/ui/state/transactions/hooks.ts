import { useCallback, useMemo } from 'react';

import { MIN_TRANSACTION_FEE_SATS } from '@/shared/constant';
import { RawTxInfo, ToAddressInfo } from '@/shared/types';
import { useTools } from '@/ui/components/ActionComponent';
import { useI18n } from '@/ui/hooks/useI18n';
import { useBTCUnit } from '@/ui/state/settings/hooks';
import { satoshisToBTC, sleep, useWallet } from '@/ui/utils';
import { UnspentOutput } from '@unisat/tx-helpers/types';

import { AppState } from '..';
import { useAccountAddress, useCurrentAccount } from '../accounts/hooks';
import { accountActions } from '../accounts/reducer';
import { useAppDispatch, useAppSelector } from '../hooks';
import { transactionsActions } from './reducer';

// Helper function to ensure minimum fee rate
function ensureMinimumFeeRate(feeRate: number, assetType = 'Transaction'): number {
  // Estimate transaction size: 1 input (148 bytes) + 2 outputs (68 bytes) + base (10 bytes) + witness (108 bytes / 4) = ~226 vbytes
  const estimatedTxSize = 226; // Conservative estimate for P2WPKH transaction
  const minFeeRate = Math.ceil(MIN_TRANSACTION_FEE_SATS / estimatedTxSize);

  if (feeRate < minFeeRate) {
    console.log(
      `${assetType} fee rate ${feeRate} sat/vB is too low for minimum fee of ${MIN_TRANSACTION_FEE_SATS} sats. Adjusting to ${minFeeRate} sat/vB`
    );
    return minFeeRate;
  }

  return feeRate;
}

export function useTransactionsState(): AppState['transactions'] {
  return useAppSelector((state) => state.transactions);
}

export function useBitcoinTx() {
  const transactionsState = useTransactionsState();
  return transactionsState.bitcoinTx;
}

export function usePrepareSendBTCCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const utxos = useUtxos();
  const fetchUtxos = useFetchUtxosCallback();
  const account = useCurrentAccount();
  const btcUnit = useBTCUnit();
  const { t } = useI18n();
  return useCallback(
    async ({
      toAddressInfo,
      toAmount,
      feeRate,
      enableRBF,
      memo,
      memos,
      disableAutoAdjust
    }: {
      toAddressInfo: ToAddressInfo;
      toAmount: number;
      feeRate?: number;
      enableRBF: boolean;
      memo?: string;
      memos?: string[];
      disableAutoAdjust?: boolean;
    }) => {
      let _utxos: UnspentOutput[] = utxos;
      if (_utxos.length === 0) {
        _utxos = await fetchUtxos();
      }
      const safeBalance = _utxos.filter((v) => v.inscriptions.length == 0).reduce((pre, cur) => pre + cur.satoshis, 0);
      if (safeBalance < toAmount) {
        throw new Error(t('insufficient_balance'));
      }

      if (!feeRate) {
        const summary = await wallet.getFeeSummary();
        feeRate = summary.list[1].feeRate;
      }

      // Ensure minimum fee rate
      feeRate = ensureMinimumFeeRate(feeRate, 'BTC');

      let res: {
        psbtHex: string;
        rawtx: string;
        fee: number;
      };

      if (safeBalance === toAmount && !disableAutoAdjust) {
        res = await wallet.sendAllBTC({
          to: toAddressInfo.address,
          btcUtxos: _utxos,
          enableRBF,
          feeRate
        });
      } else {
        res = await wallet.sendBTC({
          to: toAddressInfo.address,
          amount: toAmount,
          btcUtxos: _utxos,
          enableRBF,
          feeRate,
          memo,
          memos
        });
      }

      // Validate minimum fee
      if (res.fee < MIN_TRANSACTION_FEE_SATS) {
        console.log(`Transaction fee ${res.fee} sats is below minimum ${MIN_TRANSACTION_FEE_SATS} sats`);
        res.fee = MIN_TRANSACTION_FEE_SATS;
      }

      dispatch(
        transactionsActions.updateBitcoinTx({
          rawtx: res.rawtx,
          psbtHex: res.psbtHex,
          fromAddress,
          feeRate,
          enableRBF
        })
      );
      const rawTxInfo: RawTxInfo = {
        psbtHex: res.psbtHex,
        rawtx: res.rawtx,
        toAddressInfo,
        fee: res.fee
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress, utxos, fetchUtxos]
  );
}

export function usePrepareSendBypassHeadOffsetsCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const account = useCurrentAccount();
  const btcUnit = useBTCUnit();
  return useCallback(
    async ({
      toAddressInfo,
      toAmount,
      feeRate
    }: {
      toAddressInfo: ToAddressInfo;
      toAmount: number;
      feeRate: number;
    }) => {
      const res = await wallet.sendCoinBypassHeadOffsets(
        [
          {
            address: toAddressInfo.address,
            satoshis: toAmount
          }
        ],
        feeRate
      );

      dispatch(
        transactionsActions.updateBitcoinTx({
          rawtx: res.rawtx,
          psbtHex: res.psbtHex,
          fromAddress,
          feeRate
        })
      );
      const rawTxInfo: RawTxInfo = {
        psbtHex: res.psbtHex,
        rawtx: res.rawtx,
        toAddressInfo,
        fee: res.fee
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress]
  );
}

export function usePushBitcoinTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const tools = useTools();
  return useCallback(
    async (rawtx: string) => {
      const ret = {
        success: false,
        txid: '',
        error: ''
      };
      try {
        tools.showLoading(true);
        const txid = await wallet.pushTx(rawtx);
        await sleep(3); // Wait for transaction synchronization
        tools.showLoading(false);
        dispatch(transactionsActions.updateBitcoinTx({ txid }));
        dispatch(accountActions.expireBalance());
        setTimeout(() => {
          dispatch(accountActions.expireBalance());
        }, 2000);
        setTimeout(() => {
          dispatch(accountActions.expireBalance());
        }, 5000);

        ret.success = true;
        ret.txid = txid;
      } catch (e) {
        ret.error = (e as Error).message;
        tools.showLoading(false);
      }

      return ret;
    },
    [dispatch, wallet]
  );
}

export function useOrdinalsTx() {
  const transactionsState = useTransactionsState();
  return transactionsState.ordinalsTx;
}

export function usePrepareSendOrdinalsInscriptionCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const utxos = useUtxos();
  const fetchUtxos = useFetchUtxosCallback();
  const account = useCurrentAccount();
  return useCallback(
    async ({
      toAddressInfo,
      inscriptionId,
      feeRate,
      outputValue,
      enableRBF
    }: {
      toAddressInfo: ToAddressInfo;
      inscriptionId: string;
      feeRate?: number;
      outputValue?: number;
      enableRBF: boolean;
    }) => {
      if (!feeRate) {
        const summary = await wallet.getFeeSummary();
        feeRate = summary.list[1].feeRate;
      }

      // Ensure minimum fee rate
      feeRate = ensureMinimumFeeRate(feeRate, 'Ordinals');

      let btcUtxos = utxos;
      if (btcUtxos.length === 0) {
        btcUtxos = await fetchUtxos();
      }

      const res = await wallet.sendOrdinalsInscription({
        to: toAddressInfo.address,
        inscriptionId,
        feeRate,
        outputValue,
        enableRBF,
        btcUtxos
      });
      dispatch(
        transactionsActions.updateOrdinalsTx({
          rawtx: res.rawtx,
          psbtHex: res.psbtHex,
          fromAddress,
          // inscription,
          feeRate,
          outputValue,
          enableRBF
        })
      );
      const rawTxInfo: RawTxInfo = {
        psbtHex: res.psbtHex,
        rawtx: res.rawtx,
        toAddressInfo
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress, utxos]
  );
}

export function usePrepareSendOrdinalsInscriptionsCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const fetchUtxos = useFetchUtxosCallback();
  const utxos = useUtxos();
  const account = useCurrentAccount();
  return useCallback(
    async ({
      toAddressInfo,
      inscriptionIds,
      feeRate,
      enableRBF
    }: {
      toAddressInfo: ToAddressInfo;
      inscriptionIds: string[];
      feeRate?: number;
      enableRBF: boolean;
    }) => {
      if (!feeRate) {
        const summary = await wallet.getFeeSummary();
        feeRate = summary.list[1].feeRate;
      }

      let btcUtxos = utxos;
      if (btcUtxos.length === 0) {
        btcUtxos = await fetchUtxos();
      }
      const res = await wallet.sendOrdinalsInscriptions({
        to: toAddressInfo.address,
        inscriptionIds,
        feeRate,
        enableRBF,
        btcUtxos
      });
      dispatch(
        transactionsActions.updateOrdinalsTx({
          rawtx: res.rawtx,
          psbtHex: res.psbtHex,
          fromAddress,
          feeRate,
          enableRBF
        })
      );
      const rawTxInfo: RawTxInfo = {
        psbtHex: res.psbtHex,
        rawtx: res.rawtx,
        toAddressInfo
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress, utxos]
  );
}

export function useCreateSplitTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const utxos = useUtxos();
  const fetchUtxos = useFetchUtxosCallback();
  const account = useCurrentAccount();
  return useCallback(
    async ({
      inscriptionId,
      feeRate,
      outputValue,
      enableRBF
    }: {
      inscriptionId: string;
      feeRate: number;
      outputValue: number;
      enableRBF: boolean;
    }) => {
      let btcUtxos = utxos;
      if (btcUtxos.length === 0) {
        btcUtxos = await fetchUtxos();
      }

      const res = await wallet.splitOrdinalsInscription({
        inscriptionId,
        feeRate,
        outputValue,
        enableRBF,
        btcUtxos
      });
      dispatch(
        transactionsActions.updateOrdinalsTx({
          rawtx: res.rawtx,
          psbtHex: res.psbtHex,
          fromAddress,
          // inscription,
          enableRBF,
          feeRate,
          outputValue
        })
      );
      const rawTxInfo: RawTxInfo = {
        psbtHex: res.psbtHex,
        rawtx: res.rawtx,
        toAddressInfo: {
          address: fromAddress
        }
      };
      return { rawTxInfo, splitedCount: res.splitedCount };
    },
    [dispatch, wallet, fromAddress, utxos]
  );
}

export function usePushOrdinalsTxCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const tools = useTools();
  return useCallback(
    async (rawtx: string) => {
      const ret = {
        success: false,
        txid: '',
        error: ''
      };
      try {
        tools.showLoading(true);
        const txid = await wallet.pushTx(rawtx);
        await sleep(3); // Wait for transaction synchronization
        tools.showLoading(false);
        dispatch(transactionsActions.updateOrdinalsTx({ txid }));

        dispatch(accountActions.expireBalance());
        setTimeout(() => {
          dispatch(accountActions.expireBalance());
        }, 2000);
        setTimeout(() => {
          dispatch(accountActions.expireBalance());
        }, 5000);

        ret.success = true;
        ret.txid = txid;
      } catch (e) {
        console.log(e);
        ret.error = (e as Error).message;
        tools.showLoading(false);
      }

      return ret;
    },
    [dispatch, wallet]
  );
}

export function useUtxos() {
  const transactionsState = useTransactionsState();
  return transactionsState.utxos;
}

export function useFetchUtxosCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const account = useCurrentAccount();
  return useCallback(async () => {
    const data = await wallet.getBTCUtxos();
    dispatch(transactionsActions.setUtxos(data));
    return data;
  }, [wallet, account]);
}

export function useSpendUnavailableUtxos() {
  const transactionsState = useTransactionsState();
  return transactionsState.spendUnavailableUtxos;
}

export function useSetSpendUnavailableUtxosCallback() {
  const dispatch = useAppDispatch();
  return useCallback(
    (utxos: UnspentOutput[]) => {
      dispatch(transactionsActions.setSpendUnavailableUtxos(utxos));
    },
    [dispatch]
  );
}

export function useSafeBalance() {
  const utxos = useUtxos();
  return useMemo(() => {
    const satoshis = utxos.filter((v) => v.inscriptions.length === 0).reduce((pre, cur) => pre + cur.satoshis, 0);
    return satoshisToBTC(satoshis);
  }, [utxos]);
}

export function useAssetUtxosRunes() {
  const transactionsState = useTransactionsState();
  return transactionsState.assetUtxos_runes;
}

export function useFetchAssetUtxosRunesCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const account = useCurrentAccount();
  return useCallback(
    async (rune: string) => {
      const data = await wallet.getAssetUtxosRunes(rune);
      dispatch(transactionsActions.setAssetUtxosRunes(data));
      return data;
    },
    [wallet, account]
  );
}

export function usePrepareSendRunesCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const utxos = useUtxos();
  const fetchUtxos = useFetchUtxosCallback();
  const assetUtxosRunes = useAssetUtxosRunes();
  const fetchAssetUtxosRunes = useFetchAssetUtxosRunesCallback();
  const account = useCurrentAccount();
  return useCallback(
    async ({
      toAddressInfo,
      runeid,
      runeAmount,
      outputValue,
      feeRate,
      enableRBF
    }: {
      toAddressInfo: ToAddressInfo;
      runeid: string;
      runeAmount: string;
      outputValue?: number;
      feeRate: number;
      enableRBF: boolean;
    }) => {
      if (!feeRate) {
        const summary = await wallet.getFeeSummary();
        feeRate = summary.list[1].feeRate;
      }

      // Ensure minimum fee rate
      feeRate = ensureMinimumFeeRate(feeRate, 'Runes');

      let btcUtxos = utxos;
      if (btcUtxos.length === 0) {
        btcUtxos = await fetchUtxos();
      }

      let assetUtxos = assetUtxosRunes;
      if (assetUtxos.length == 0) {
        assetUtxos = await fetchAssetUtxosRunes(runeid);
      }

      const res = await wallet.sendRunes({
        to: toAddressInfo.address,
        runeid,
        runeAmount,
        outputValue,
        feeRate,
        enableRBF,
        btcUtxos,
        assetUtxos
      });

      dispatch(
        transactionsActions.updateRunesTx({
          rawtx: res.rawtx,
          psbtHex: res.psbtHex,
          fromAddress,
          feeRate,
          enableRBF,
          runeid,
          runeAmount,
          outputValue
        })
      );
      const rawTxInfo: RawTxInfo = {
        psbtHex: res.psbtHex,
        rawtx: res.rawtx,
        toAddressInfo
      };
      return rawTxInfo;
    },
    [dispatch, wallet, fromAddress, utxos, assetUtxosRunes, fetchAssetUtxosRunes, account]
  );
}

export function useRunesTx() {
  const transactionsState = useTransactionsState();
  return transactionsState.runesTx;
}

export function usePrepareSendAlkanesCallback() {
  const wallet = useWallet();
  const account = useCurrentAccount();
  const callback = useCallback(
    async (toAddressInfo: ToAddressInfo, alkaneid: string, amount: string, feeRate: number, enableRBF = false) => {
      return await wallet.sendAlkanes({
        to: toAddressInfo.address,
        alkaneid,
        amount,
        feeRate,
        enableRBF
      });
    },
    [wallet, account]
  );
  return callback;
}

export function usePrepareSendSimplicityCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const utxos = useUtxos();
  const fetchUtxos = useFetchUtxosCallback();
  const account = useCurrentAccount();

  return useCallback(
    async ({
      selectedAsset,
      toAddressInfo,
      toAmount,
      feeRate,
      enableRBF
    }: {
      selectedAsset: any; // Asset type from ModernAssetsList
      toAddressInfo: ToAddressInfo;
      toAmount: number;
      feeRate: number;
      enableRBF: boolean;
    }) => {
      try {
        console.log('usePrepareSendSimplicityCallback:', {
          asset: selectedAsset.symbol || selectedAsset.name,
          to: toAddressInfo.address,
          amount: toAmount
        });

        if (!feeRate) {
          const summary = await wallet.getFeeSummary();
          feeRate = summary.list[1].feeRate;
        }

        // Ensure minimum fee rate
        feeRate = ensureMinimumFeeRate(feeRate, 'Simplicity');

        let btcUtxos = utxos;
        if (btcUtxos.length === 0) {
          btcUtxos = await fetchUtxos();
        }

        // Vérifier que la méthode sendSimplicityToken existe
        if (!wallet.sendSimplicityToken) {
          console.error('sendSimplicityToken method not available');
          throw new Error('sendSimplicityToken method not available. Please restart the extension.');
        }

        // Appeler la méthode sendSimplicityToken
        console.log('usePrepareSendSimplicityCallback: Calling sendSimplicityToken with params:', {
          to: toAddressInfo.address,
          ticker: selectedAsset.symbol || selectedAsset.name,
          amount: toAmount,
          feeRate,
          enableRBF
        });

        const res = await wallet.sendSimplicityToken({
          to: toAddressInfo.address,
          ticker: selectedAsset.symbol || selectedAsset.name,
          amount: toAmount,
          feeRate,
          enableRBF,
          btcUtxos
        });

        console.log('usePrepareSendSimplicityCallback: sendSimplicityToken response:', res);
        console.log('usePrepareSendSimplicityCallback: Fee from response:', res.fee);

        // Validate minimum fee
        if (res.fee < MIN_TRANSACTION_FEE_SATS) {
          console.log(`Simplicity transaction fee ${res.fee} sats is below minimum ${MIN_TRANSACTION_FEE_SATS} sats`);
          res.fee = MIN_TRANSACTION_FEE_SATS;
        }

        // Mettre à jour l'état des transactions
        dispatch(
          transactionsActions.updateSimplicityTx({
            rawtx: res.rawtx,
            psbtHex: res.psbtHex,
            fromAddress,
            feeRate,
            enableRBF,
            ticker: selectedAsset.symbol || selectedAsset.name,
            amount: toAmount
          })
        );

        const rawTxInfo: RawTxInfo = {
          psbtHex: res.psbtHex,
          rawtx: res.rawtx,
          toAddressInfo,
          fee: res.fee // S'assurer que les fees sont incluses dans rawTxInfo
        };

        console.log('usePrepareSendSimplicityCallback: Created rawTxInfo:', rawTxInfo);
        console.log('usePrepareSendSimplicityCallback: Fee in rawTxInfo:', rawTxInfo.fee);

        return rawTxInfo;
      } catch (error) {
        console.error('Error in usePrepareSendSimplicityCallback:', error);
        throw error;
      }
    },
    [dispatch, wallet, fromAddress, utxos, fetchUtxos, account]
  );
}

// Hook unifié pour le send de tous les types d'assets
export function usePrepareSendUnifiedCallback() {
  const dispatch = useAppDispatch();
  const wallet = useWallet();
  const fromAddress = useAccountAddress();
  const utxos = useUtxos();
  const fetchUtxos = useFetchUtxosCallback();
  const account = useCurrentAccount();
  const btcUnit = useBTCUnit();
  const { t } = useI18n();

  // Import existing callbacks
  const prepareSendBTC = usePrepareSendBTCCallback();
  const prepareSendRunes = usePrepareSendRunesCallback();
  const prepareSendOrdinals = usePrepareSendOrdinalsInscriptionCallback();
  const prepareSendAlkanes = usePrepareSendAlkanesCallback();
  const prepareSendSimplicity = usePrepareSendSimplicityCallback();

  return useCallback(
    async ({
      selectedAsset,
      toAddressInfo,
      toAmount,
      feeRate,
      enableRBF,
      memo,
      memos,
      disableAutoAdjust
    }: {
      selectedAsset: any; // Asset type from ModernAssetsList
      toAddressInfo: ToAddressInfo;
      toAmount: number;
      feeRate?: number;
      enableRBF: boolean;
      memo?: string;
      memos?: string[];
      disableAutoAdjust?: boolean;
    }) => {
      try {
        console.log('usePrepareSendUnifiedCallback called with:', {
          selectedAsset,
          toAddressInfo,
          toAmount,
          feeRate,
          enableRBF
        });

        console.log('Available callbacks:', {
          prepareSendBTC: !!prepareSendBTC,
          prepareSendRunes: !!prepareSendRunes,
          prepareSendOrdinals: !!prepareSendOrdinals,
          prepareSendAlkanes: !!prepareSendAlkanes,
          prepareSendSimplicity: !!prepareSendSimplicity
        });

        // Ensure minimum fee rate
        if (!feeRate) {
          const summary = await wallet.getFeeSummary();
          feeRate = summary.list[1].feeRate;
        }
        feeRate = ensureMinimumFeeRate(feeRate, 'Unified');

        // Route to appropriate send method based on asset type
        switch (selectedAsset.type) {
          case 'btc':
            return await prepareSendBTC({
              toAddressInfo,
              toAmount,
              feeRate,
              enableRBF,
              memo,
              memos,
              disableAutoAdjust
            });

          case 'simplicity': {
            console.log('usePrepareSendUnifiedCallback: Routing to Simplicity send...');
            if (!prepareSendSimplicity) {
              console.error('prepareSendSimplicity is undefined');
              throw new Error('Simplicity send not available. Please restart the extension.');
            }

            const simplicityResult = await prepareSendSimplicity({
              selectedAsset,
              toAddressInfo,
              toAmount,
              feeRate,
              enableRBF
            });

            console.log('usePrepareSendUnifiedCallback: Simplicity result:', simplicityResult);
            console.log('usePrepareSendUnifiedCallback: Fee in result:', simplicityResult.fee);

            return simplicityResult;
          }

          case 'rune':
            return await prepareSendRunes({
              toAddressInfo,
              runeid: selectedAsset.id,
              runeAmount: toAmount.toString(),
              feeRate,
              enableRBF
            });

          case 'ordinal':
            return await prepareSendOrdinals({
              toAddressInfo,
              inscriptionId: selectedAsset.id,
              feeRate,
              enableRBF
            });

          case 'alkane':
            return await prepareSendAlkanes(toAddressInfo, selectedAsset.id, toAmount.toString(), feeRate, enableRBF);

          default:
            throw new Error(`Unsupported asset type: ${selectedAsset.type}`);
        }
      } catch (error) {
        console.error('Error in usePrepareSendUnifiedCallback:', error);
        throw error;
      }
    },
    [
      prepareSendBTC,
      prepareSendRunes,
      prepareSendOrdinals,
      prepareSendAlkanes,
      prepareSendSimplicity,
      dispatch,
      wallet,
      fromAddress,
      utxos,
      fetchUtxos,
      account,
      btcUnit,
      t
    ]
  );
}
