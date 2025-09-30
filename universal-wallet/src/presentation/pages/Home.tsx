import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Balance } from '../components/wallet/Balance';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Logo } from '../components/common/Logo';
import { useWallet } from '../providers/WalletProvider';

export const Home: React.FC = () => {
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const navigate = useNavigate();
  const {
    currentWallet,
    transactions,
    isLoading,
    isInitialized,
    getBalance,
    refreshData
  } = useWallet();

  const balance = getBalance();
  const balanceInBTC = Number(balance.getValue()) / 100000000;
  const balanceInSats = balance.getValue().toString();
  const usdValue = (balanceInBTC * 50000).toFixed(2); // Mock USD price

  // Convert transactions to display format
  const displayTransactions = transactions.slice(0, 5).map(tx => ({
    id: tx.getId().value,
    type: tx.getType() === 'receive' ? 'received' : 'sent',
    amount: (Number(tx.getOutputs()[0]?.amount.getValue() || 0) / 100000000).toFixed(8),
    confirmations: tx.getConfirmations(),
    timestamp: tx.getCreatedAt().toISOString()
  }));

  useEffect(() => {
    if (isInitialized && !currentWallet) {
      // No wallet exists, redirect to onboarding
      navigate('/onboarding');
    }
  }, [isInitialized, currentWallet, navigate]);

  const quickActions = [
    {
      label: 'Send',
      action: () => navigate('/send'),
      variant: 'primary' as const
    },
    {
      label: 'Receive',
      action: () => navigate('/receive'),
      variant: 'secondary' as const
    },
    {
      label: 'BRC-20',
      action: () => navigate('/brc20'),
      variant: 'secondary' as const
    },
    {
      label: 'History',
      action: () => navigate('/history'),
      variant: 'tertiary' as const
    }
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--apple-system-background)' }}>
      <div className="container mx-auto px-4 py-6 max-w-md">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center">
            <Logo size="large" color="dark" className="mr-3 dark:hidden" />
            <Logo size="large" color="white" className="mr-3 hidden dark:block" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Universal Wallet
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Secure Bitcoin Wallet
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <SettingsIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <button className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
              <SecurityIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <Balance
            balance={balanceInSats}
            unit="sats"
            usdValue={usdValue}
            isLoading={isLoading}
            isHidden={isBalanceHidden}
            onToggleVisibility={() => setIsBalanceHidden(!isBalanceHidden)}
          />
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 * index }}
              >
                <Button
                  variant={action.variant}
                  size="medium"
                  onClick={action.action}
                  className="h-16 text-sm"
                  fullWidth
                >
                  {action.label}
                </Button>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card padding="none">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Recent Activity
              </h3>
            </div>

            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayTransactions.map((tx, index) => (
                <motion.div
                  key={tx.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-full ${
                        tx.type === 'received'
                          ? 'bg-green-100 dark:bg-green-900/30'
                          : 'bg-red-100 dark:bg-red-900/30'
                      }`}>
                        {tx.type === 'received' ? (
                          <ArrowDownIcon className="w-4 h-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <ArrowUpIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">
                          {tx.type === 'received' ? 'Received' : 'Sent'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {tx.confirmations} confirmations
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`font-semibold ${
                        tx.type === 'received'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {tx.type === 'received' ? '+' : '-'}{tx.amount} BTC
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="p-4 text-center">
              <Button variant="tertiary" size="medium">
                View All Transactions
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

// Icon components
const SendIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ReceiveIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
  </svg>
);

const TokenIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
  </svg>
);

const HistoryIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const SettingsIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const SecurityIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ArrowDownIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
  </svg>
);

const ArrowUpIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
  </svg>
);