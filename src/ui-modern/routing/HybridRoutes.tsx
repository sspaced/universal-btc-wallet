import { useCallback, useEffect, useRef } from 'react';
import { HashRouter, Route, Routes, useNavigate as useNavigateOrigin } from 'react-router-dom';

import { Content, Icon } from '@/ui/components';
import { ErrorBoundary } from '@/ui/components/ErrorBoundary';
import AddKeyringScreen from '@/ui/pages/Account/AddKeyringScreen';
import CreateAccountScreen from '@/ui/pages/Account/CreateAccountScreen';
import CreateColdWalletScreen from '@/ui/pages/Account/CreateColdWalletScreen';
import CreateHDWalletScreen from '@/ui/pages/Account/CreateHDWalletScreen';
import CreateKeystoneWalletScreen from '@/ui/pages/Account/CreateKeystoneWalletScreen';
import CreatePasswordScreen from '@/ui/pages/Account/CreatePasswordScreen';
import CreateSimpleWalletScreen from '@/ui/pages/Account/CreateSimpleWalletScreen';
import SwitchAccountScreen from '@/ui/pages/Account/SwitchAccountScreen';
import SwitchKeyringScreen from '@/ui/pages/Account/SwitchKeyringScreen';
import UnlockScreen from '@/ui/pages/Account/UnlockScreen';
import AlkanesCollectionScreen from '@/ui/pages/Alkanes/AlkanesCollectionScreen';
import AlkanesNFTScreen from '@/ui/pages/Alkanes/AlkanesNFTScreen';
import AlkanesTokenScreen from '@/ui/pages/Alkanes/AlkanesTokenScreen';
import SendAlkanesNFTScreen from '@/ui/pages/Alkanes/SendAlkanesNFTScreen';
import SendAlkanesScreen from '@/ui/pages/Alkanes/SendAlkanesScreen';
import ApprovalScreen from '@/ui/pages/Approval/ApprovalScreen';
import ConnectedSitesScreen from '@/ui/pages/Approval/ConnectedSitesScreen';
import { InscribeTransferScreen } from '@/ui/pages/Approval/components/InscribeTransfer';
import BRC20SendScreen from '@/ui/pages/BRC20/BRC20SendScreen';
import BRC20SingleStepScreen from '@/ui/pages/BRC20/BRC20SingleStepScreen';
import BRC20TokenScreen from '@/ui/pages/BRC20/BRC20TokenScreen';
import BabylonStakingScreen from '@/ui/pages/Babylon/BabylonStakingScreen';
import BabylonTxConfirmScreen from '@/ui/pages/Babylon/BabylonTxConfirmScreen';
import SendBabyScreen from '@/ui/pages/Babylon/SendBabyScreen';
// Import des composants existants
import CAT20TokenScreen from '@/ui/pages/CAT20/CAT20TokenScreen';
import MergeCAT20HistoryScreen from '@/ui/pages/CAT20/MergeCAT20HistoryScreen';
import MergeCAT20Screen from '@/ui/pages/CAT20/MergeCAT20Screen';
import SendCAT20Screen from '@/ui/pages/CAT20/SendCAT20Screen';
import CAT721CollectionScreen from '@/ui/pages/CAT721/CAT721CollectionScreen';
import CAT721NFTScreen from '@/ui/pages/CAT721/CAT721NFTScreen';
import SendCAT721Screen from '@/ui/pages/CAT721/SendCAT721Screen';
import AppTabScrren from '@/ui/pages/Main/AppTabScreen';
import BoostScreen from '@/ui/pages/Main/BoostScreen';
import DiscoverTabScreen from '@/ui/pages/Main/DiscoverTabScreen';
import SettingsTabScreen from '@/ui/pages/Main/SettingsTabScreen';
import WalletTabScreen from '@/ui/pages/Main/WalletTabScreen';
import WelcomeScreen from '@/ui/pages/Main/WelcomeScreen';
import OrdinalsInscriptionScreen from '@/ui/pages/Ordinals/OrdinalsInscriptionScreen';
import SendOrdinalsInscriptionScreen from '@/ui/pages/Ordinals/SendOrdinalsInscriptionScreen';
import SignOrdinalsTransactionScreen from '@/ui/pages/Ordinals/SignOrdinalsTransactionScreen';
import SplitOrdinalsInscriptionScreen from '@/ui/pages/Ordinals/SplitOrdinalsInscriptionScreen';
import PhishingScreen from '@/ui/pages/Phishing/PhishingScreen';
import RunesTokenScreen from '@/ui/pages/Runes/RunesTokenScreen';
import SendRunesScreen from '@/ui/pages/Runes/SendRunesScreen';
import AboutUsScreen from '@/ui/pages/Settings/AboutUsScreen';
import AddressTypeScreen from '@/ui/pages/Settings/AddressTypeScreen';
import AdvancedScreen from '@/ui/pages/Settings/AdvancedScreen';
import { LockTimePage } from '@/ui/pages/Settings/AdvancedScreen/LockTimePage';
import ChangePasswordScreen from '@/ui/pages/Settings/ChangePasswordScreen';
import ContactsScreen from '@/ui/pages/Settings/ContactsScreen';
import EditAccountNameScreen from '@/ui/pages/Settings/EditAccountNameScreen';
import EditContactScreen from '@/ui/pages/Settings/EditContactScreen';
import EditWalletNameScreen from '@/ui/pages/Settings/EditWalletNameScreen';
import ExportMnemonicsScreen from '@/ui/pages/Settings/ExportMnemonicsScreen';
import ExportPrivateKeyScreen from '@/ui/pages/Settings/ExportPrivateKeyScreen';
import LanguageScreen from '@/ui/pages/Settings/LanguageScreen';
import NetworkTypeScreen from '@/ui/pages/Settings/NetworkTypeScreen';
import UpgradeNoticeScreen from '@/ui/pages/Settings/UpgradeNoticeScreen';
import CosmosSignDemo from '@/ui/pages/Test/CosmosSignDemo';
import TestScreen from '@/ui/pages/Test/TestScreen';
import HistoryScreen from '@/ui/pages/Wallet/HistoryScreen';
import TxConfirmScreen from '@/ui/pages/Wallet/TxConfirmScreen';
import TxCreateScreen from '@/ui/pages/Wallet/TxCreateScreen';
import TxFailScreen from '@/ui/pages/Wallet/TxFailScreen';
import TxSuccessScreen from '@/ui/pages/Wallet/TxSuccessScreen';
import { accountActions } from '@/ui/state/accounts/reducer';
import { useIsReady, useIsUnlocked } from '@/ui/state/global/hooks';
import { globalActions } from '@/ui/state/global/reducer';
import { useAppDispatch } from '@/ui/state/hooks';
import { settingsActions } from '@/ui/state/settings/reducer';
import { useWallet } from '@/ui/utils';
import { LoadingOutlined } from '@ant-design/icons';

import { shouldUseModernUI } from '../config/ui-config';
// Import des composants modernes
import { ModernCreateHDWalletScreen } from '../pages/ModernCreateHDWalletScreen';
import { ModernReceiveScreen } from '../pages/ModernReceiveScreen';
import { ModernWalletTabScreen } from '../pages/ModernWalletTabScreen';
import { ModernWelcomeScreen } from '../pages/ModernWelcomeScreen';

export const routes = {
  BoostScreen: {
    path: '/',
    element: <BoostScreen />
  },
  WelcomeScreen: {
    path: '/welcome',
    element: shouldUseModernUI('WelcomeScreen') ? <ModernWelcomeScreen /> : <WelcomeScreen />
  },
  MainScreen: {
    path: '/main',
    element: shouldUseModernUI('MainScreen') ? <ModernWalletTabScreen /> : <WalletTabScreen />
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
    element: shouldUseModernUI('CreateHDWalletScreen') ? <ModernCreateHDWalletScreen /> : <CreateHDWalletScreen />
  },
  CreateAccountScreen: {
    path: '/account/create',
    element: <CreateAccountScreen />
  },
  CreatePasswordScreen: {
    path: '/account/create-password',
    element: <CreatePasswordScreen />
  },
  UnlockScreen: {
    path: '/account/unlock',
    element: <UnlockScreen />
  },
  SwitchAccountScreen: {
    path: '/account/switch-account',
    element: <SwitchAccountScreen />
  },
  ReceiveScreen: {
    path: '/wallet/receive',
    element: <ModernReceiveScreen />
  },

  TxCreateScreen: {
    path: '/wallet/tx/create',
    element: <TxCreateScreen />
  },
  TxConfirmScreen: {
    path: '/wallet/tx/confirm',
    element: <TxConfirmScreen />
  },
  TxSuccessScreen: {
    path: '/wallet/tx/success',
    element: <TxSuccessScreen />
  },
  TxFailScreen: {
    path: '/wallet/tx/fail',
    element: <TxFailScreen />
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
    element: <NetworkTypeScreen />
  },
  ChangePasswordScreen: {
    path: '/settings/password',
    element: <ChangePasswordScreen />
  },
  ExportMnemonicsScreen: {
    path: '/settings/export-mnemonics',
    element: <ExportMnemonicsScreen />
  },
  ExportPrivateKeyScreen: {
    path: '/settings/export-privatekey',
    element: <ExportPrivateKeyScreen />
  },
  AdvancedScreen: {
    path: '/settings/advanced',
    element: <AdvancedScreen />
  },
  LanguageScreen: {
    path: '/settings/language',
    element: <LanguageScreen />
  },
  LockTimePage: {
    path: '/settings/lock-time',
    element: <LockTimePage />
  },
  HistoryScreen: {
    path: '/wallet/history',
    element: <HistoryScreen />
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
    element: <CreateSimpleWalletScreen />
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
    element: <AddressTypeScreen />
  },
  ContactsScreen: {
    path: '/settings/contacts',
    element: <ContactsScreen />
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
    element: <AboutUsScreen />
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
        self.summaryLoaded = true;
      }

      if (!self.configLoaded) {
        self.configLoaded = true;

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
      <Routes>
        {Object.keys(routes)
          .map((v) => routes[v])
          .map((v) => (
            <Route key={v.path} path={v.path} element={<ErrorBoundary>{v.element}</ErrorBoundary>} />
          ))}
      </Routes>
    </HashRouter>
  );
};

export default Main;
