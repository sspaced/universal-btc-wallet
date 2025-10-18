import { lazy, useCallback, useEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useNavigate as useNavigateOrigin } from 'react-router-dom';

import { AssetProvider } from '@/ui-modern/providers/AssetProvider';
import CAT20TokenScreen from '@/ui/pages/CAT20/CAT20TokenScreen';
import MergeCAT20HistoryScreen from '@/ui/pages/CAT20/MergeCAT20HistoryScreen';
import MergeCAT20Screen from '@/ui/pages/CAT20/MergeCAT20Screen';
import SendCAT20Screen from '@/ui/pages/CAT20/SendCAT20Screen';
import { LoadingOutlined } from '@ant-design/icons';

import { ModernErrorBoundaryWrapper } from '../../ui-modern/components/ModernErrorBoundaryWrapper';
import { shouldUseModernUI } from '../../ui-modern/config/ui-config';
import { ModernAboutUsScreen } from '../../ui-modern/pages/ModernAboutUsScreen';
import { ModernAddAddressScreen } from '../../ui-modern/pages/ModernAddAddressScreen';
import { ModernAssetSelectionScreen } from '../../ui-modern/pages/ModernAssetSelectionScreen';
import { ModernBTCDetail } from '../../ui-modern/pages/ModernBTCDetail';
import { ModernChangePasswordScreen } from '../../ui-modern/pages/ModernChangePasswordScreen';
import { ModernContactsScreen } from '../../ui-modern/pages/ModernContactsScreen';
import { ModernCreateAccountScreen } from '../../ui-modern/pages/ModernCreateAccountScreen';
import { ModernCreateHDWalletScreen } from '../../ui-modern/pages/ModernCreateHDWalletScreen';
import { ModernCreateSimpleWalletScreen } from '../../ui-modern/pages/ModernCreateSimpleWalletScreen';
import { ModernDeleteWalletScreen } from '../../ui-modern/pages/ModernDeleteWalletScreen';
import { ModernExportMnemonicsScreen } from '../../ui-modern/pages/ModernExportMnemonicsScreen';
import { ModernExportPrivateKeyScreen } from '../../ui-modern/pages/ModernExportPrivateKeyScreen';
import { ModernForgotPasswordScreen } from '../../ui-modern/pages/ModernForgotPasswordScreen';
import { ModernHistoryDetail } from '../../ui-modern/pages/ModernHistoryDetail';
import { ModernHistoryScreen } from '../../ui-modern/pages/ModernHistoryScreen';
import { ModernLanguageScreen } from '../../ui-modern/pages/ModernLanguageScreen';
import { ModernLockTimeScreen } from '../../ui-modern/pages/ModernLockTimeScreen';
import { ModernNetworkTypeScreen } from '../../ui-modern/pages/ModernNetworkTypeScreen';
import { ModernReceiveScreen } from '../../ui-modern/pages/ModernReceiveScreen';
import { ModernResetWalletScreen } from '../../ui-modern/pages/ModernResetWalletScreen';
import { ModernSendScreen } from '../../ui-modern/pages/ModernSendScreen';
import { ModernSwapConfirmationScreen } from '../../ui-modern/pages/ModernSwapConfirmationScreen';
import { ModernSwapScreen } from '../../ui-modern/pages/ModernSwapScreen';
import { ModernTokenDetail } from '../../ui-modern/pages/ModernTokenDetail';
import { ModernTxConfirmScreen } from '../../ui-modern/pages/ModernTxConfirmScreen';
import { ModernTxFailScreen } from '../../ui-modern/pages/ModernTxFailScreen';
import { ModernTxSuccessScreen } from '../../ui-modern/pages/ModernTxSuccessScreen';
import { ModernUnlockScreen } from '../../ui-modern/pages/ModernUnlockScreen';
import { ModernWalletSelectionScreen } from '../../ui-modern/pages/ModernWalletSelectionScreen';
import { Content, Icon } from '../components';
import { accountActions } from '../state/accounts/reducer';
import { useIsReady, useIsUnlocked } from '../state/global/hooks';
import { globalActions } from '../state/global/reducer';
import { useAppDispatch } from '../state/hooks';
import { settingsActions } from '../state/settings/reducer';
import { useWallet } from '../utils';
import AddKeyringScreen from './Account/AddKeyringScreen';
import CreateColdWalletScreen from './Account/CreateColdWalletScreen';
import CreateKeystoneWalletScreen from './Account/CreateKeystoneWalletScreen';
import CreateSimpleWalletScreen from './Account/CreateSimpleWalletScreen';
import SwitchAccountScreen from './Account/SwitchAccountScreen';
import SwitchKeyringScreen from './Account/SwitchKeyringScreen';
import AlkanesCollectionScreen from './Alkanes/AlkanesCollectionScreen';
import AlkanesNFTScreen from './Alkanes/AlkanesNFTScreen';
import AlkanesTokenScreen from './Alkanes/AlkanesTokenScreen';
import SendAlkanesNFTScreen from './Alkanes/SendAlkanesNFTScreen';
import SendAlkanesScreen from './Alkanes/SendAlkanesScreen';
import ApprovalScreen from './Approval/ApprovalScreen';
import ConnectedSitesScreen from './Approval/ConnectedSitesScreen';
import { InscribeTransferScreen } from './Approval/components/InscribeTransfer';
import BRC20SendScreen from './BRC20/BRC20SendScreen';
import BRC20SingleStepScreen from './BRC20/BRC20SingleStepScreen';
import BRC20TokenScreen from './BRC20/BRC20TokenScreen';
import BabylonStakingScreen from './Babylon/BabylonStakingScreen';
import BabylonTxConfirmScreen from './Babylon/BabylonTxConfirmScreen';
import SendBabyScreen from './Babylon/SendBabyScreen';
import CAT721CollectionScreen from './CAT721/CAT721CollectionScreen';
import CAT721NFTScreen from './CAT721/CAT721NFTScreen';
import SendCAT721Screen from './CAT721/SendCAT721Screen';
import AppTabScrren from './Main/AppTabScreen';
import BoostScreen from './Main/BoostScreen';
import DiscoverTabScreen from './Main/DiscoverTabScreen';
import SettingsTabScreen from './Main/SettingsTabScreen';
import OrdinalsInscriptionScreen from './Ordinals/OrdinalsInscriptionScreen';
import SendOrdinalsInscriptionScreen from './Ordinals/SendOrdinalsInscriptionScreen';
import SignOrdinalsTransactionScreen from './Ordinals/SignOrdinalsTransactionScreen';
import SplitOrdinalsInscriptionScreen from './Ordinals/SplitOrdinalsInscriptionScreen';
import PhishingScreen from './Phishing/PhishingScreen';
import RunesTokenScreen from './Runes/RunesTokenScreen';
import SendRunesScreen from './Runes/SendRunesScreen';
import AdvancedScreen from './Settings/AdvancedScreen';
import EditAccountNameScreen from './Settings/EditAccountNameScreen';
import EditContactScreen from './Settings/EditContactScreen';
import EditWalletNameScreen from './Settings/EditWalletNameScreen';
import ExportMnemonicsScreen from './Settings/ExportMnemonicsScreen';
import ExportPrivateKeyScreen from './Settings/ExportPrivateKeyScreen';
import UpgradeNoticeScreen from './Settings/UpgradeNoticeScreen';
import CosmosSignDemo from './Test/CosmosSignDemo';
import TestScreen from './Test/TestScreen';
import TxCreateScreen from './Wallet/TxCreateScreen';
import './index.module.less';

// Composant wrapper pour l'évaluation dynamique
const ExportMnemonicsScreenWrapper = () => {
  return shouldUseModernUI('ExportMnemonicsScreen') ? <ModernExportMnemonicsScreen /> : <ExportMnemonicsScreen />;
};

const ExportPrivateKeyScreenWrapper = () => {
  return shouldUseModernUI('ExportPrivateKeyScreen') ? <ModernExportPrivateKeyScreen /> : <ExportPrivateKeyScreen />;
};

const ModernWelcomeScreen = lazy(() =>
  import('../../ui-modern/pages/ModernWelcomeScreen').then((module) => ({ default: module.ModernWelcomeScreen }))
);
const ModernCreatePasswordScreen = lazy(() =>
  import('../../ui-modern/pages/ModernCreatePasswordScreen').then((module) => ({
    default: module.ModernCreatePasswordScreen
  }))
);
const ModernWalletTabScreen = lazy(() =>
  import('../../ui-modern/pages/ModernWalletTabScreen').then((module) => ({
    default: module.ModernWalletTabScreen
  }))
);
const ModernAddressTypeScreen = lazy(() =>
  import('../../ui-modern/pages/ModernAddressTypeScreen').then((module) => ({
    default: module.ModernAddressTypeScreen
  }))
);

export const routes = {
  BoostScreen: {
    path: '/',
    element: <BoostScreen />
  },
  WelcomeScreen: {
    path: '/welcome',
    element: <ModernWelcomeScreen />
  },
  MainScreen: {
    path: '/main',
    element: <ModernWalletTabScreen />
  },
  DiscoverTabScreen: {
    path: '/discover',
    element: <DiscoverTabScreen />
  },
  AppTabScrren: {
    path: '/app',
    element: <AppTabScrren />
  },
  SettingsTabScreen: {
    path: '/settings',
    element: <SettingsTabScreen />
  },
  CreateHDWalletScreen: {
    path: '/account/create-hd-wallet',
    element: <ModernCreateHDWalletScreen />
  },
  CreateAccountScreen: {
    path: '/account/create',
    element: <ModernCreateAccountScreen />
  },
  WalletSelectionScreen: {
    path: '/account/wallet-selection',
    element: <ModernWalletSelectionScreen />
  },
  CreatePasswordScreen: {
    path: '/account/create-password',
    element: <ModernCreatePasswordScreen />
  },
  UnlockScreen: {
    path: '/account/unlock',
    element: <ModernUnlockScreen />
  },
  ForgotPasswordScreen: {
    path: '/account/forgot-password',
    element: <ModernForgotPasswordScreen />
  },
  ResetWalletScreen: {
    path: '/account/reset-wallet',
    element: <ModernResetWalletScreen />
  },
  DeleteWalletScreen: {
    path: '/settings/delete-wallet',
    element: <ModernDeleteWalletScreen />
  },
  SwitchAccountScreen: {
    path: '/account/switch-account',
    element: <SwitchAccountScreen />
  },
  ReceiveScreen: {
    path: '/wallet/receive',
    element: <ModernReceiveScreen />
  },
  ModernSwapScreen: {
    path: '/wallet/swap',
    element: <ModernSwapScreen />
  },
  ModernSwapConfirmationScreen: {
    path: '/wallet/swap/confirmation',
    element: <ModernSwapConfirmationScreen />
  },

  ModernAssetSelectionScreen: {
    path: '/wallet/asset-selection',
    element: <ModernAssetSelectionScreen />
  },

  TxCreateScreen: {
    path: '/wallet/tx/create',
    element: shouldUseModernUI('TxCreateScreen') ? <ModernSendScreen /> : <TxCreateScreen />
  },
  TxConfirmScreen: {
    path: '/wallet/tx/confirm',
    element: <ModernTxConfirmScreen />
  },
  TxSuccessScreen: {
    path: '/wallet/tx/success',
    element: <ModernTxSuccessScreen />
  },
  TxFailScreen: {
    path: '/wallet/tx/fail',
    element: <ModernTxFailScreen />
  },

  OrdinalsInscriptionScreen: {
    path: '/inscription/:inscriptionId',
    getDynamicPath: (props: { inscriptionId?: string }, state?: any) => {
      const inscriptionId = props?.inscriptionId || state?.inscription?.inscriptionId;
      return `/inscription/${inscriptionId}`;
    },
    element: <OrdinalsInscriptionScreen />
  },

  SendOrdinalsInscriptionScreen: {
    path: '/wallet/ordinals-tx/create',
    element: <SendOrdinalsInscriptionScreen />
  },

  SignOrdinalsTransactionScreen: {
    path: '/wallet/ordinals-tx/confirm',
    element: <SignOrdinalsTransactionScreen />
  },

  NetworkTypeScreen: {
    path: '/settings/network-type',
    element: <ModernNetworkTypeScreen />
  },
  ChangePasswordScreen: {
    path: '/settings/password',
    element: <ModernChangePasswordScreen />
  },
  ExportMnemonicsScreen: {
    path: '/settings/export-mnemonics',
    element: <ExportMnemonicsScreenWrapper />
  },
  ExportPrivateKeyScreen: {
    path: '/settings/export-privatekey',
    element: <ExportPrivateKeyScreenWrapper />
  },
  AdvancedScreen: {
    path: '/settings/advanced',
    element: <AdvancedScreen />
  },
  LanguageScreen: {
    path: '/settings/language',
    element: <ModernLanguageScreen />
  },
  LockTimePage: {
    path: '/settings/lock-time',
    element: <ModernLockTimeScreen />
  },
  HistoryScreen: {
    path: '/wallet/history',
    element: <ModernHistoryScreen />
  },
  ModernHistoryScreen: {
    path: '/wallet/modern-history',
    element: <ModernHistoryScreen />
  },
  ModernHistoryDetail: {
    path: '/wallet/history/detail',
    element: <ModernHistoryDetail />
  },
  ModernTokenDetail: {
    path: '/wallet/token/detail',
    element: <ModernTokenDetail />
  },
  ModernBTCDetail: {
    path: '/wallet/btc/detail',
    element: <ModernBTCDetail />
  },
  ApprovalScreen: {
    path: '/approval',
    element: <ApprovalScreen />
  },
  ConnectedSitesScreen: {
    path: '/connected-sites',
    element: <ConnectedSitesScreen />
  },
  SwitchKeyringScreen: {
    path: '/account/switch-keyring',
    element: <SwitchKeyringScreen />
  },
  AddKeyringScreen: {
    path: '/account/add-keyring',
    element: <AddKeyringScreen />
  },
  EditWalletNameScreen: {
    path: '/settings/edit-wallet-name',
    element: <EditWalletNameScreen />
  },
  CreateSimpleWalletScreen: {
    path: '/account/create-simple-wallet',
    element: shouldUseModernUI('CreateSimpleWalletScreen') ? (
      <ModernCreateSimpleWalletScreen />
    ) : (
      <CreateSimpleWalletScreen />
    )
  },
  CreateKeystoneWalletScreen: {
    path: '/account/create-keystone-wallet',
    element: <CreateKeystoneWalletScreen />
  },
  CreateColdWalletScreen: {
    path: '/account/create-cold-wallet',
    element: <CreateColdWalletScreen />
  },
  UpgradeNoticeScreen: {
    path: '/settings/upgrade-notice',
    element: <UpgradeNoticeScreen />
  },
  AddressTypeScreen: {
    path: '/settings/address-type',
    element: <ModernAddressTypeScreen />
  },
  ContactsScreen: {
    path: '/settings/contacts',
    element: <ModernContactsScreen />
  },
  AddAddressScreen: {
    path: '/settings/contacts/add',
    element: <ModernAddAddressScreen />
  },
  EditContactScreen: {
    path: '/settings/contacts/edit',
    element: <EditContactScreen />
  },
  EditContactWithChainScreen: {
    path: '/settings/contact/:address/:chain',
    element: <EditContactScreen />
  },
  EditAccountNameScreen: {
    path: '/settings/edit-account-name',
    element: <EditAccountNameScreen />
  },
  InscribeTransferScreen: {
    path: '/inscribe/transfer',
    element: <InscribeTransferScreen />
  },
  BRC20SendScreen: {
    path: '/brc20/send',
    element: <BRC20SendScreen />
  },
  BRC20TokenScreen: {
    path: '/brc20/token',
    element: <BRC20TokenScreen />
  },
  SplitOrdinalsInscriptionScreen: {
    path: '/wallet/split-tx/create',
    element: <SplitOrdinalsInscriptionScreen />
  },

  SendRunesScreen: {
    path: '/runes/send-runes',
    element: <SendRunesScreen />
  },
  RunesTokenScreen: {
    path: '/runes/token',
    element: <RunesTokenScreen />
  },

  CAT20TokenScreen: {
    path: '/cat20/token',
    element: <CAT20TokenScreen />
  },
  SendCAT20Screen: {
    path: '/cat20/send-cat20',
    element: <SendCAT20Screen />
  },
  MergeCAT20Screen: {
    path: '/cat20/merge-cat20',
    element: <MergeCAT20Screen />
  },
  MergeCAT20HistoryScreen: {
    path: '/cat20/merge-history',
    element: <MergeCAT20HistoryScreen />
  },

  CAT721CollectionScreen: {
    path: '/cat721/collection',
    element: <CAT721CollectionScreen />
  },

  CAT721NFTScreen: {
    path: '/cat721/nft',
    element: <CAT721NFTScreen />
  },

  SendCAT721Screen: {
    path: '/cat721/send-cat721',
    element: <SendCAT721Screen />
  },

  BabylonStakingScreen: {
    path: '/babylon/staking',
    element: <BabylonStakingScreen />
  },

  SendBABYScreen: {
    path: '/babylon/send-baby',
    element: <SendBabyScreen />
  },
  BabylonTxConfirmScreen: {
    path: '/babylon/tx/confirm',
    element: <BabylonTxConfirmScreen />
  },

  phishing: {
    path: '/phishing',
    element: <PhishingScreen />
  },

  AboutUsScreen: {
    path: '/settings/about-us',
    element: <ModernAboutUsScreen />
  },

  BRC20SingleStepScreen: {
    path: '/brc20/send-single-step',
    element: <BRC20SingleStepScreen />
  },

  SendAlkanesScreen: {
    path: '/alkanes/send-token',
    element: <SendAlkanesScreen />
  },
  AlkanesTokenScreen: {
    path: '/alkanes/token',
    element: <AlkanesTokenScreen />
  },
  AlkanesCollectionScreen: {
    path: '/alkanes/collection',
    element: <AlkanesCollectionScreen />
  },
  AlkanesNFTScreen: {
    path: '/alkanes/nft',
    element: <AlkanesNFTScreen />
  },
  SendAlkanesNFTScreen: {
    path: '/alkanes/send-nft',
    element: <SendAlkanesNFTScreen />
  }
};

if (process.env.NODE_ENV === 'development') {
  routes['TestScreen'] = {
    path: '/test',
    element: <TestScreen />
  };

  routes['CosmosSignDemo'] = {
    path: '/test-cosmos-sign',
    element: <CosmosSignDemo />
  };
}

type RouteTypes = keyof typeof routes;

export function useNavigate() {
  const navigate = useNavigateOrigin();
  const navigatingRef = useRef(false);

  return useCallback(
    (routKey: RouteTypes | '#back', state?: any, pathState?: any) => {
      /** Prevent duplicate route stack caused by parent-child inscription navigation */
      if (navigatingRef.current) {
        return;
      }

      navigatingRef.current = true;

      if (routKey === '#back') {
        window.history.back();
        navigatingRef.current = false;
        return;
      }

      if (!routes[routKey]) {
        navigatingRef.current = false;
        return;
      }

      const route: any = routes[routKey];
      if (route.getDynamicPath) {
        const path = route.getDynamicPath(pathState);
        navigate(path, { replace: false, state });
        navigatingRef.current = false;
        return;
      }

      navigate(
        {
          pathname: route.path
        },
        { replace: false, state }
      );

      navigatingRef.current = false;
    },
    [navigate]
  );
}

const Main = () => {
  const wallet = useWallet();
  const dispatch = useAppDispatch();

  const isReady = useIsReady();
  const isUnlocked = useIsUnlocked();

  const selfRef = useRef({
    settingsLoaded: false,
    summaryLoaded: false,
    accountLoaded: false,
    configLoaded: false
  });
  const self = selfRef.current;
  const init = useCallback(async () => {
    try {
      if (!self.accountLoaded) {
        const currentAccount = await wallet.getCurrentAccount();
        if (currentAccount) {
          dispatch(accountActions.setCurrent(currentAccount));

          const accounts = await wallet.getAccounts();
          dispatch(accountActions.setAccounts(accounts));

          if (accounts.length > 0) {
            self.accountLoaded = true;
          }
        }
      }

      if (!self.settingsLoaded) {
        const chainType = await wallet.getChainType();
        dispatch(
          settingsActions.updateSettings({
            chainType
          })
        );

        const _locale = await wallet.getLocale();
        dispatch(settingsActions.updateSettings({ locale: _locale }));
        self.settingsLoaded = true;
      }

      if (!self.summaryLoaded) {
        // wallet.getInscriptionSummary().then((data) => {
        //   dispatch(accountActions.setInscriptionSummary(data));
        // });

        // wallet.getAppSummary().then((data) => {
        //   dispatch(accountActions.setAppSummary(data));
        // });

        // wallet.getBannerList().then((data) => {
        //   dispatch(accountActions.setBannerList(data));
        // });

        // wallet.getAppList().then((data) => {
        //   dispatch(accountActions.setAppList(data));
        // });
        self.summaryLoaded = true;
      }

      if (!self.configLoaded) {
        self.configLoaded = true;

        // already load when reloadAccounts
        // wallet.getWalletConfig().then((data) => {
        //   dispatch(settingsActions.updateSettings({ walletConfig: data }));
        // });
        wallet.getSkippedVersion().then((data) => {
          dispatch(settingsActions.updateSettings({ skippedVersion: data }));
        });

        wallet.getAutoLockTimeId().then((data) => {
          dispatch(settingsActions.updateSettings({ autoLockTimeId: data }));
        });
        wallet.getDeveloperMode().then((data) => {
          dispatch(settingsActions.updateSettings({ developerMode: data }));
        });
      }

      dispatch(globalActions.update({ isReady: true }));
    } catch (e) {
      console.log('init error', e);
    }
  }, [wallet, dispatch, isReady, isUnlocked]);

  useEffect(() => {
    wallet.hasVault().then((val) => {
      if (val) {
        dispatch(globalActions.update({ isBooted: true }));
        wallet.isUnlocked().then((isUnlocked) => {
          dispatch(globalActions.update({ isUnlocked }));
        });
      }
    });
  }, []);

  useEffect(() => {
    init();
  }, [init]);

  if (!isReady) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100vw',
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden'
        }}>
        <Content justifyCenter itemsCenter>
          <Icon>
            <LoadingOutlined />
          </Icon>
        </Content>
      </div>
    );
  }

  return (
    <HashRouter>
      <AssetProvider>
        <Routes>
          {Object.keys(routes)
            .map((v) => routes[v])
            .map((v) => (
              <Route
                key={v.path}
                path={v.path}
                element={<ModernErrorBoundaryWrapper>{v.element}</ModernErrorBoundaryWrapper>}
              />
            ))}
        </Routes>
      </AssetProvider>
    </HashRouter>
  );
};

export default Main;
