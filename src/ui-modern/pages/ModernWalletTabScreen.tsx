import React, { useEffect, useMemo, useState } from 'react';

import { ModernBottomNav, BottomNavTab } from '../components/layout/ModernBottomNav';
import { ModernMainContent } from '../components/layout/ModernMainContent';
import { ModernSidebar, Account } from '../components/layout/ModernSidebar';
import { ModernAccountSelector, ModernAccount } from '../components/wallet/ModernAccountSelector';
import { ModernAssetsList, Asset } from '../components/wallet/ModernAssetsList';
import { ModernBalanceHeader } from '../components/wallet/ModernBalanceHeader';
import { ModernQuickActions } from '../components/wallet/ModernQuickActions';
import { useNavigate } from '@/ui/pages/MainRoute';
import { useAccountBalance, useCurrentAccount } from '@/ui/state/accounts/hooks';
import { useIsUnlocked } from '@/ui/state/global/hooks';
import { useAppDispatch } from '@/ui/state/hooks';
import { useCurrentKeyring } from '@/ui/state/keyrings/hooks';
import { useFetchBalanceCallback } from '@/ui/state/accounts/hooks';
import { useResetUiTxCreateScreen } from '@/ui/state/ui/hooks';
import { useWallet, getUiType } from '@/ui/utils';

export const ModernWalletTabScreen: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const wallet = useWallet();

  // States
  const [activeTab, setActiveTab] = useState<BottomNavTab>('home');
  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [buyBtcModalVisible, setBuyBtcModalVisible] = useState(false);

  // Hooks from original WalletTabScreen
  const accountBalance = useAccountBalance();
  const currentAccount = useCurrentAccount();
  const currentKeyring = useCurrentKeyring();
  const isUnlocked = useIsUnlocked();
  const fetchBalance = useFetchBalanceCallback();
  const resetUiTxCreateScreen = useResetUiTxCreateScreen();

  const { isSidePanel } = getUiType();

  // Redirect to unlock if not unlocked
  useEffect(() => {
    if (!isUnlocked) {
      navigate('UnlockScreen');
    }
  }, [isUnlocked, navigate]);

  // Mock accounts data (TODO: fetch from wallet)
  const accounts: Account[] = useMemo(() => {
    // This should be fetched from the wallet state
    // For now, we'll use the current account as a single item
    console.log('Current keyring type:', currentKeyring.type);
    return [
      {
        address: currentAccount.address || '',
        alianName: currentKeyring.alianName || 'Account 1',
        index: 0,
        type: currentKeyring.type, // Add keyring type
      },
    ];
  }, [currentAccount, currentKeyring]);

  const [selectedAccount, setSelectedAccount] = useState<Account | null>(
    accounts.length > 0 ? accounts[0] : null
  );

  // Mock assets data (TODO: fetch real assets)
  const mockAssets: Asset[] = useMemo(() => {
    return [
      {
        id: '1',
        type: 'cat20',
        name: 'USD Coin',
        symbol: 'USDC',
        amount: '1,750',
        value: 1749.6,
        usdValue: '$1,749.60',
        change: '+$0.19',
      },
      {
        id: '2',
        type: 'rune',
        name: 'Ethereum',
        symbol: 'ETH',
        amount: '0.00473',
        value: 20.44,
        usdValue: '$20.44',
        change: '+$0.90',
      },
      {
        id: '3',
        type: 'ordinal',
        name: 'Bitcoin Ordinal',
        symbol: 'ORD',
        amount: '5',
        value: 15.2,
        usdValue: '$15.20',
        change: '-$0.30',
      },
      {
        id: '4',
        type: 'alkane',
        name: 'Alkane Token',
        symbol: 'ALK',
        amount: '100',
        value: 8.5,
        usdValue: '$8.50',
        change: '+$0.10',
      },
    ];
  }, []);

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
      case 'search':
        // TODO: Navigate to search screen
        console.log('Navigate to search');
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

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    // TODO: Switch to selected account in wallet state
    console.log('Selected account:', account);
  };

  const handleToggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  const handleAddAccount = () => {
    navigate('CreateAccountScreen');
    setSidebarVisible(false);
  };

  const handleEditWalletName = (account: Account) => {
    navigate('EditWalletNameScreen', { keyring: currentKeyring });
    setSidebarVisible(false);
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
    console.log('Asset clicked:', asset);
    // TODO: Navigate to asset detail screen based on type
    switch (asset.type) {
      case 'ordinal':
        // navigate to ordinal screen
        break;
      case 'rune':
        // navigate to rune screen
        break;
      case 'alkane':
        // navigate to alkane screen
        break;
      case 'cat20':
        // navigate to cat20 screen
        break;
      case 'cat721':
        // navigate to cat721 screen
        break;
      case 'brc20':
        // navigate to brc20 screen
        break;
    }
  };

  // Convert currentAccount to ModernAccount format
  const modernCurrentAccount: ModernAccount = useMemo(() => {
    return {
      address: currentAccount.address || '',
      alianName: currentKeyring.alianName || 'Account 1',
      index: 0,
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
        position: 'relative',
      }}
    >
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
        <ModernAccountSelector
          currentAccount={modernCurrentAccount}
          onToggleSidebar={handleToggleSidebar}
        />

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
        <ModernAssetsList
          assets={mockAssets}
          loading={false}
          onAssetClick={handleAssetClick}
        />
      </ModernMainContent>

      {/* Bottom Navigation */}
      <ModernBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};
