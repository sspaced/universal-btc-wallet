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
import { useCurrentKeyring, useKeyrings } from '@/ui/state/keyrings/hooks';
import { keyringsActions } from '@/ui/state/keyrings/reducer';
import { useResetUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { getUiType, useLocationState, useWallet } from '@/ui/utils';

import { ModernRemoveWalletModal } from '../components/common/ModernRemoveWalletModal';
import { BottomNavTab, ModernBottomNav } from '../components/layout/ModernBottomNav';
import { ModernMainContent } from '../components/layout/ModernMainContent';
import { Account, ModernSidebar } from '../components/layout/ModernSidebar';
import { ModernAccount, ModernAccountSelector } from '../components/wallet/ModernAccountSelector';
import { Asset, ModernAssetsList } from '../components/wallet/ModernAssetsList';
import { ModernBalanceHeader } from '../components/wallet/ModernBalanceHeader';
import { ModernQuickActions } from '../components/wallet/ModernQuickActions';
import { ModernSettingsPanel } from '../components/wallet/ModernSettingsPanel';
import { useAssets } from '../providers/AssetProvider';

export const ModernWalletTabScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wallet = useWallet();

  // States
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [buyBtcModalVisible, setBuyBtcModalVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [accountToRemove, setAccountToRemove] = useState<Account | null>(null);
  const [isSwitchingAccount, setIsSwitchingAccount] = useState(false);

  // Listen for navigation state to open settings panel
  const locationState = useLocationState<{ openSettings?: boolean }>();

  // Hooks from original WalletTabScreen
  const accountBalance = useAccountBalance();
  const currentAccount = useCurrentAccount();
  const currentKeyring = useCurrentKeyring();
  const allKeyrings = useKeyrings();
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

  // Fetch unified assets with caching (via Context Provider)
  const { assets: unifiedAssets, loading: assetsLoading, isRefreshing, refreshAssets } = useAssets();

  // Redirect to unlock if not unlocked
  useEffect(() => {
    if (!isUnlocked) {
      navigate('UnlockScreen');
    }
  }, [isUnlocked, navigate]);

  // Open settings panel when navigation state indicates it
  useEffect(() => {
    if (locationState?.openSettings) {
      setShowSettings(true);
    }
  }, [locationState?.openSettings]);

  // Accounts data
  const accounts: Account[] = useMemo(() => {
    console.log('All accounts:', allAccounts);
    console.log('Current keyring type:', currentKeyring.type);
    console.log('All keyrings:', allKeyrings);

    // Convert all accounts to the format expected by ModernSidebar
    return allAccounts.map((account, index) => {
      // Trouver le keyring qui contient ce compte
      const keyring = allKeyrings.find((k) => k.accounts.some((acc) => acc.address === account.address));
      const accountIndex = account.index + 1;

      // Utiliser le nom personnalisé ou générer "Account X"
      const displayName = account.alianName || `Account ${accountIndex}`;

      return {
        address: account.address || '',
        alianName: displayName,
        index: account.index || index,
        type: account.type || currentKeyring.type,
        keyringIndex: keyring ? keyring.index + 1 : 1
      };
    });
  }, [allAccounts, currentKeyring, allKeyrings]);

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
        navigate('ModernSwapScreen');
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
    navigate('ModernAssetSelectionScreen');
  };

  const handleReceive = () => {
    navigate('ReceiveScreen');
  };

  const handleHistory = () => {
    navigate('HistoryScreen');
  };

  const handleExchange = () => {
    navigate('ModernSwapScreen');
  };

  const handleRefreshBalance = () => {
    fetchBalance();
    refreshAssets(); // Refresh les assets aussi
  };

  const handleSelectAccount = async (account: Account) => {
    setSelectedAccount(account);

    try {
      const targetAccount = allAccounts.find((acc) => acc.address === account.address);
      if (targetAccount && currentAccount.address !== targetAccount.address) {
        console.log('[Account Switch] Starting account switch...');
        setIsSwitchingAccount(true);
        
        // Invalider immédiatement le cache des assets pour l'ancien compte
        console.log('[Account Switch] Invalidating asset cache for previous account');
        
        // Trouver le keyring qui contient ce compte
        const allKeyrings = await wallet.getKeyrings();
        const targetKeyring = allKeyrings.find((keyring) =>
          keyring.accounts.some((acc) => acc.address === account.address)
        );

        if (targetKeyring) {
          if (currentKeyring.key !== targetKeyring.key) {
            // Changer de keyring ET sélectionner le bon compte
            console.log('[Account Switch] Changing keyring and account');
            await wallet.changeKeyring(targetKeyring, targetAccount.index);
            dispatch(keyringsActions.setCurrent(targetKeyring));
          } else {
            // Changer de compte dans le même keyring
            console.log('[Account Switch] Changing account in same keyring');
            await wallet.changeKeyring(currentKeyring, targetAccount.index);
          }

          // Mettre à jour le compte actuel
          const newCurrentAccount = await wallet.getCurrentAccount();
          setCurrentAccount(newCurrentAccount);
          console.log('[Account Switch] New account set:', newCurrentAccount.address);

          // Recharger les comptes et le balance
          console.log('[Account Switch] Reloading accounts and fetching balance');
          await reloadAccounts();
          await fetchBalance();
          
          console.log('[Account Switch] Account switch complete');
          
          // Petite attente pour s'assurer que tout est bien chargé
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setIsSwitchingAccount(false);
        }
      } else {
        setIsSwitchingAccount(false);
      }
    } catch (error) {
      console.error('Failed to switch account:', error);
      setIsSwitchingAccount(false);
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
    // Update account name via API
    try {
      // Find the actual account object from allAccounts
      const accountToUpdate = allAccounts.find((acc) => acc.address === account.address);
      if (!accountToUpdate) {
        console.error('Account not found');
        return;
      }
      
      // Update the account name
      await wallet.setAccountAlianName(accountToUpdate, account.alianName || '');
      
      // Reload accounts to reflect the change
      await reloadAccounts();
    } catch (error) {
      console.error('Failed to update account name:', error);
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

  const handleRemoveWallet = async (account: Account) => {
    setAccountToRemove(account);
    setShowRemoveModal(true);
    setSidebarVisible(false);
  };

  const confirmRemoveWallet = async () => {
    if (!accountToRemove) return;

    try {
      // Supprimer le compte
      await wallet.removeAccount(accountToRemove);
      
      // Recharger les comptes
      await reloadAccounts();
      
      // Fermer le modal
      setShowRemoveModal(false);
      setAccountToRemove(null);
      
      // Afficher un message de succès
      console.log('Account removed successfully');
    } catch (error: any) {
      console.error('Failed to remove account:', error);
      alert(error.message || 'Failed to remove account. Please try again.');
      setShowRemoveModal(false);
      setAccountToRemove(null);
    }
  };

  const cancelRemoveWallet = () => {
    setShowRemoveModal(false);
    setAccountToRemove(null);
  };

  const handleAssetClick = (asset: Asset) => {
    // Navigate to asset detail screen based on type
    switch (asset.type) {
      case 'btc':
        navigate('ModernBTCDetail', {
          balance: asset.amount,
          usdValue: asset.usdValue,
          icon: asset.icon
        });
        break;
      case 'simplicity':
        navigate('ModernTokenDetail', {
          tokenId: asset.id,
          name: asset.name,
          symbol: asset.symbol || '',
          balance: asset.amount,
          usdValue: asset.usdValue,
          icon: asset.icon,
          contractAddress: asset.id,
          network: 'Simplicity'
        });
        break;
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
      alianName: currentAccount.alianName || 'Account 1',
      index: currentAccount.index || 0
    };
  }, [currentAccount]);

  return (
    <div
      className="modern-ui-container"
      style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        background: '#121212',
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
          isRefreshing={isRefreshing}
          isSwitching={isSwitchingAccount}
        />

        {/* Quick Actions */}
        <ModernQuickActions
          onSend={handleSend}
          onReceive={handleReceive}
          onHistory={handleHistory}
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
        onNavigate={(route: any, state?: any) => navigate(route, state)}
        currentKeyring={currentKeyring}
        currentAccount={currentAccount}
      />

      {/* Remove Wallet Confirmation Modal */}
      <ModernRemoveWalletModal
        visible={showRemoveModal}
        walletName={accountToRemove?.alianName || `Account ${(accountToRemove?.index || 0) + 1}`}
        walletAddress={accountToRemove?.address || ''}
        isLastKeyring={allKeyrings.length === 1}
        isLastAccountInKeyring={
          allKeyrings.find((k) => k.accounts.some((acc) => acc.address === accountToRemove?.address))?.accounts
            .length === 1 || false
        }
        totalAccountsInWallet={allAccounts.length}
        onConfirm={confirmRemoveWallet}
        onCancel={cancelRemoveWallet}
      />
    </div>
  );
};
