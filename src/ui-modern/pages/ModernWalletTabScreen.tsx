import React, { useEffect, useMemo, useState } from 'react';

import { useNavigate } from '@/ui/pages/MainRoute';
import {
  useAccountBalance,
  useAccounts,
  useCurrentAccount,
  useFetchBalanceCallback,
  useReloadAccounts,
  useSetCurrentAccountCallback
} from '@/ui/state/accounts/hooks';
import { useIsUnlocked } from '@/ui/state/global/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { useResetUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { getUiType, useWallet } from '@/ui/utils';

import { BottomNavTab, ModernBottomNav } from '../components/layout/ModernBottomNav';
import { ModernMainContent } from '../components/layout/ModernMainContent';
import { Account, ModernSidebar } from '../components/layout/ModernSidebar';
import { ModernAccount, ModernAccountSelector } from '../components/wallet/ModernAccountSelector';
import { Asset, ModernAssetsList } from '../components/wallet/ModernAssetsList';
import { ModernBalanceHeader } from '../components/wallet/ModernBalanceHeader';
import { ModernQuickActions } from '../components/wallet/ModernQuickActions';
import { ModernSettingsPanel } from '../components/wallet/ModernSettingsPanel';
import { useUnifiedAssets } from '../hooks/useUnifiedAssets';

export const ModernWalletTabScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wallet = useWallet();

  // States
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [buyBtcModalVisible, setBuyBtcModalVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Hooks from original WalletTabScreen
  const accountBalance = useAccountBalance();
  const currentAccount = useCurrentAccount();
  const currentKeyring = useCurrentKeyring();
  const isUnlocked = useIsUnlocked();
  const fetchBalance = useFetchBalanceCallback();
  const resetUiTxCreateScreen = useResetUiTxCreateScreen();
  const allAccounts = useAccounts();
  const reloadAccounts = useReloadAccounts();
  const setCurrentAccount = useSetCurrentAccountCallback();

  const { isSidePanel } = getUiType();

  // Debug logs for balance
  useEffect(() => {
    console.log('=== BALANCE DEBUG ===');
    console.log('Current account:', currentAccount);
    console.log('Account balance:', accountBalance);
    console.log('Is unlocked:', isUnlocked);
    console.log('===================');
  }, [currentAccount, accountBalance, isUnlocked]);

  // Fetch unified assets
  const { assets: unifiedAssets, loading: assetsLoading } = useUnifiedAssets();

  // Redirect to unlock if not unlocked
  useEffect(() => {
    if (!isUnlocked) {
      navigate('UnlockScreen');
    }
  }, [isUnlocked, navigate]);

  // Accounts data
  const accounts: Account[] = useMemo(() => {
    console.log('All accounts:', allAccounts);
    console.log('Current keyring type:', currentKeyring.type);

    // Convert all accounts to the format expected by ModernSidebar
    return allAccounts.map((account, index) => ({
      address: account.address || '',
      alianName: account.alianName || `Account ${index + 1}`,
      index: account.index || index,
      type: account.type || currentKeyring.type
    }));
  }, [allAccounts, currentKeyring]);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  // Update selected account when current account or accounts list changes
  useEffect(() => {
    if (accounts.length > 0) {
      const currentAccountInList = accounts.find((acc) => acc.address === currentAccount.address);
      if (currentAccountInList) {
        console.log('Setting selected account to current account:', currentAccountInList);
        setSelectedAccount(currentAccountInList);
      } else {
        console.log('Current account not found in list, setting to first account:', accounts[0]);
        setSelectedAccount(accounts[0]);
      }
    }
  }, [accounts, currentAccount]);

  // Handlers
  const handleTabChange = (tab: BottomNavTab) => {
    setActiveTab(tab);

    // Navigate based on tab
    switch (tab) {
      case 'home':
        // Already on home
        break;
      case 'swap':
        // TODO: Navigate to swap screen
        console.log('Navigate to swap');
        break;
      case 'history':
        navigate('HistoryScreen');
        break;
      case 'settings':
        setShowSettings(true);
        break;
    }
  };

  const handleSend = () => {
    resetUiTxCreateScreen();
    navigate('TxCreateScreen');
  };

  const handleReceive = () => {
    navigate('ReceiveScreen');
  };

  const handleBuy = () => {
    // TODO: Show buy BTC modal
    console.log('Buy BTC');
  };

  const handleExchange = () => {
    // Neutre pour l'instant
    console.log('Exchange - Coming soon');
  };

  const handleRefreshBalance = () => {
    fetchBalance();
  };

  const handleSelectAccount = async (account: Account) => {
    setSelectedAccount(account);
    // Switch to selected account in wallet state
    try {
      const targetAccount = allAccounts.find((acc) => acc.address === account.address);
      if (targetAccount && currentAccount.address !== targetAccount.address) {
        // Use changeKeyring to switch to the selected account
        await wallet.changeKeyring(currentKeyring, targetAccount.index);
        // Update the current account in the state
        const newCurrentAccount = await wallet.getCurrentAccount();
        setCurrentAccount(newCurrentAccount);
        // Reload accounts to update current account
        await reloadAccounts();
      }
    } catch (error) {
      console.error('Failed to switch account:', error);
    }
    console.log('Selected account:', account);
  };

  const handleToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleAddAccount = () => {
    navigate('CreateAccountScreen');
    setSidebarVisible(false);
  };

  // Reload accounts when component mounts or when returning from account creation
  useEffect(() => {
    if (isUnlocked) {
      reloadAccounts();
    }
  }, [isUnlocked, reloadAccounts]);

  const handleEditWalletName = async (account: Account) => {
    // Update wallet name via API
    try {
      const newKeyring = await wallet.setKeyringAlianName(currentKeyring, account.alianName || '');
      dispatch(keyringsActions.updateKeyringName(newKeyring));
    } catch (error) {
      console.error('Failed to update wallet name:', error);
    }
  };

  const handleShowSecretPhrase = (account: Account) => {
    navigate('ExportMnemonicsScreen', { keyring: currentKeyring });
    setSidebarVisible(false);
  };

  const handleExportPrivateKey = (account: Account) => {
    navigate('ExportPrivateKeyScreen', { account: currentAccount });
    setSidebarVisible(false);
  };

  const handleRemoveWallet = (account: Account) => {
    // TODO: Show confirmation modal then remove wallet
    console.log('Remove wallet:', account);
    setSidebarVisible(false);
  };

  const handleAssetClick = (asset: Asset) => {
    // Navigate to asset detail screen based on type
    switch (asset.type) {
      case 'rune':
        navigate('RunesTokenScreen', { runeid: asset.id });
        break;
      case 'alkane':
        navigate('AlkanesTokenScreen', { alkaneid: asset.id });
        break;
      case 'cat20':
        navigate('CAT20TokenScreen', { tokenId: asset.id, version: 'CAT20' });
        break;
      case 'cat721':
        navigate('CAT721NFTScreen', { tokenId: asset.id });
        break;
      case 'brc20':
        navigate('BRC20TokenScreen', { tick: asset.symbol });
        break;
      case 'ordinal':
        navigate('OrdinalsInscriptionScreen', { inscriptionId: asset.id });
        break;
    }
  };

  // Convert currentAccount to ModernAccount format
  const modernCurrentAccount: ModernAccount = useMemo(() => {
    return {
      address: currentAccount.address || '',
      alianName: currentKeyring.alianName || 'Account 1',
      index: 0
    };
  }, [currentAccount, currentKeyring]);

  return (
    <div
      className="modern-ui-container"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#000000',
        overflow: 'hidden',
        position: 'relative'
      }}>
      {/* Sidebar */}
      <ModernSidebar
        visible={sidebarVisible}
        onToggle={handleToggleSidebar}
        accounts={accounts}
        selectedAccount={selectedAccount}
        onSelectAccount={handleSelectAccount}
        onAddAccount={handleAddAccount}
        onEditWalletName={handleEditWalletName}
        onShowSecretPhrase={handleShowSecretPhrase}
        onExportPrivateKey={handleExportPrivateKey}
        onRemoveWallet={handleRemoveWallet}
      />

      {/* Main Content Area */}
      <ModernMainContent>
        {/* Account Selector Header */}
        <ModernAccountSelector currentAccount={modernCurrentAccount} onToggleSidebar={handleToggleSidebar} />

        {/* Balance Header */}
        <ModernBalanceHeader
          accountBalance={accountBalance}
          enableRefresh={isSidePanel}
          onRefresh={handleRefreshBalance}
        />

        {/* Quick Actions */}
        <ModernQuickActions
          onSend={handleSend}
          onReceive={handleReceive}
          onBuy={handleBuy}
          onExchange={handleExchange}
        />

        {/* Assets List */}
        <ModernAssetsList assets={unifiedAssets} loading={assetsLoading} onAssetClick={handleAssetClick} />
      </ModernMainContent>

      {/* Bottom Navigation */}
      <ModernBottomNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Settings Panel */}
      <ModernSettingsPanel
        visible={showSettings}
        onClose={() => setShowSettings(false)}
        onNavigate={(route: any) => navigate(route)}
      />
    </div>
  );
};
