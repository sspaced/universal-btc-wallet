import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TransactionFilters, FilterOptions } from '../components/history/TransactionFilters';
import { addToAddressBook } from '../components/wallet/AddressBook';
import { useWallet } from '../providers/WalletProvider';
import toast from 'react-hot-toast';

// Mock transaction types
interface Transaction {
  id: string;
  type: 'sent' | 'received' | 'pending';
  amount: string;
  address: string;
  timestamp: Date;
  confirmations: number;
  fee?: string;
  memo?: string;
  status: 'confirmed' | 'pending' | 'failed';
  txHash?: string;
}

export const History: React.FC = () => {
  const navigate = useNavigate();
  const { currentWallet, accounts } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [filters, setFilters] = useState<FilterOptions>({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
    address: '',
    searchTerm: ''
  });

  // Get current address
  const currentAddress = accounts[selectedAddressIndex]?.getAddress().toString() || '';

  // Load transaction history
  useEffect(() => {
    const loadTransactions = async () => {
      setIsLoading(true);

      try {
        // In a real implementation, this would fetch from the blockchain
        // For now, we'll show mock data to demonstrate the UI

        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate loading

        // Mock transaction data
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            type: 'received',
            amount: '0.00125000',
            address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
            confirmations: 6,
            status: 'confirmed',
            txHash: '1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890'
          },
          {
            id: '2',
            type: 'sent',
            amount: '0.00050000',
            address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
            timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
            confirmations: 144,
            fee: '0.00001500',
            memo: 'Coffee payment',
            status: 'confirmed',
            txHash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
          },
          {
            id: '3',
            type: 'pending',
            amount: '0.00075000',
            address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq',
            timestamp: new Date(Date.now() - 10 * 60 * 1000), // 10 minutes ago
            confirmations: 0,
            status: 'pending',
            txHash: 'fedcba0987654321fedcba0987654321fedcba0987654321fedcba0987654321'
          }
        ];

        // Filter by address if needed (in real implementation)
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Failed to load transactions:', error);
        toast.error('Failed to load transaction history');
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentAddress) {
      loadTransactions();
    }
  }, [currentAddress]);

  // Filter transactions based on all filter criteria
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      // Type filter
      if (filters.type !== 'all' && tx.type !== filters.type) {
        return false;
      }

      // Status filter
      if (filters.status !== 'all' && tx.status !== filters.status) {
        return false;
      }

      // Date range filter
      if (filters.dateRange !== 'all') {
        const now = new Date();
        const txDate = new Date(tx.timestamp);
        let cutoffDate = new Date();

        switch (filters.dateRange) {
          case '7d':
            cutoffDate.setDate(now.getDate() - 7);
            break;
          case '30d':
            cutoffDate.setDate(now.getDate() - 30);
            break;
          case '90d':
            cutoffDate.setDate(now.getDate() - 90);
            break;
        }

        if (txDate < cutoffDate) {
          return false;
        }
      }

      // Amount range filter
      if (filters.minAmount && parseFloat(tx.amount) < parseFloat(filters.minAmount)) {
        return false;
      }
      if (filters.maxAmount && parseFloat(tx.amount) > parseFloat(filters.maxAmount)) {
        return false;
      }

      // Address filter
      if (filters.address && !tx.address.toLowerCase().includes(filters.address.toLowerCase())) {
        return false;
      }

      // Search term filter (search across address, memo, txHash)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const searchable = [
          tx.address,
          tx.memo || '',
          tx.txHash || '',
          tx.amount,
          tx.type
        ].join(' ').toLowerCase();

        if (!searchable.includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, filters]);

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatAmount = (amount: string, type: string) => {
    const prefix = type === 'sent' ? '-' : '+';
    return `${prefix}${amount} BTC`;
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - timestamp.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const minutes = Math.floor(diffInHours * 60);
      return `${minutes}m ago`;
    } else if (diffInHours < 24) {
      const hours = Math.floor(diffInHours);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInHours / 24);
      return `${days}d ago`;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'var(--apple-green)';
      case 'pending': return 'var(--apple-orange)';
      case 'failed': return 'var(--apple-red)';
      default: return 'var(--apple-secondary-label)';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sent': return <SendIcon className="w-5 h-5" />;
      case 'received': return <ReceiveIcon className="w-5 h-5" />;
      case 'pending': return <ClockIcon className="w-5 h-5" />;
      default: return <TransactionIcon className="w-5 h-5" />;
    }
  };

  const handleTransactionClick = (tx: Transaction) => {
    if (tx.txHash) {
      // In a real implementation, this would open a block explorer
      toast.info('Block explorer integration coming soon');
    }
  };

  const copyTransactionHash = async (txHash: string) => {
    try {
      await navigator.clipboard.writeText(txHash);
      toast.success('Transaction hash copied!');
    } catch (error) {
      toast.error('Failed to copy transaction hash');
    }
  };

  const handleAddToAddressBook = (address: string, type: string) => {
    const contactName = window.prompt(`Enter a name for this ${type === 'sent' ? 'recipient' : 'sender'}:`);
    if (contactName && contactName.trim()) {
      if (addToAddressBook(contactName.trim(), address)) {
        toast.success(`Added ${contactName.trim()} to address book`);
      } else {
        toast.error('This address is already in your address book');
      }
    }
  };

  const handleExportTransactions = () => {
    try {
      // Create CSV content
      const headers = ['Date', 'Type', 'Amount (BTC)', 'Address', 'Status', 'Confirmations', 'Fee (BTC)', 'Memo', 'Transaction Hash'];
      const csvContent = [
        headers.join(','),
        ...filteredTransactions.map(tx => [
          tx.timestamp.toISOString(),
          tx.type,
          tx.amount,
          tx.address,
          tx.status,
          tx.confirmations,
          tx.fee || '',
          tx.memo || '',
          tx.txHash || ''
        ].map(field => `"${field}"`).join(','))
      ].join('\n');

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `bitcoin-transactions-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success(`Exported ${filteredTransactions.length} transactions`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export transactions');
    }
  };

  if (!currentWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--apple-system-background)' }}>
        <Card padding="xl" className="text-center">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
            No Wallet Found
          </h2>
          <p className="mb-6" style={{ color: 'var(--apple-secondary-label)' }}>
            Create or import a wallet to view transaction history.
          </p>
          <Button variant="primary" onClick={() => navigate('/onboarding')}>
            Create Wallet
          </Button>
        </Card>
      </div>
    );
  }

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
            <button
              onClick={() => navigate('/')}
              className="p-2 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow mr-3"
            >
              <BackIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Transaction History
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                View your Bitcoin transaction history
              </p>
            </div>
          </div>
        </motion.div>

        {/* Address Selector */}
        {accounts.length > 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <Card padding="lg">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
                Address ({selectedAddressIndex + 1} of {accounts.length})
              </label>
              <select
                value={selectedAddressIndex}
                onChange={(e) => setSelectedAddressIndex(Number(e.target.value))}
                className="w-full p-3 rounded-xl border-0 text-sm font-mono"
                style={{
                  backgroundColor: 'var(--apple-gray-6)',
                  color: 'var(--apple-label)'
                }}
              >
                {accounts.map((account, index) => (
                  <option key={index} value={index}>
                    {formatAddress(account.getAddress().toString())}
                  </option>
                ))}
              </select>
            </Card>
          </motion.div>
        )}

        {/* Transaction Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <TransactionFilters
            filters={filters}
            onFiltersChange={setFilters}
            onExport={handleExportTransactions}
          />
        </motion.div>

        {/* Transaction List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {isLoading ? (
            <Card padding="xl" className="text-center">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <span style={{ color: 'var(--apple-secondary-label)' }}>Loading transactions...</span>
              </div>
            </Card>
          ) : filteredTransactions.length === 0 ? (
            <Card padding="xl" className="text-center">
              <div className="mb-4">
                <TransactionIcon className="w-12 h-12 mx-auto" style={{ color: 'var(--apple-secondary-label)' }} />
              </div>
              <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--apple-label)' }}>
                No Transactions
              </h3>
              <p className="mb-6" style={{ color: 'var(--apple-secondary-label)' }}>
                {filters.type === 'all' && !filters.searchTerm && !filters.address && !filters.minAmount && !filters.maxAmount && filters.status === 'all' && filters.dateRange === 'all'
                  ? 'You haven\'t made any transactions yet.'
                  : 'No transactions match your current filters.'
                }
              </p>
              <div className="flex space-x-3">
                <Button variant="secondary" size="medium" onClick={() => navigate('/receive')} className="flex-1">
                  Receive
                </Button>
                <Button variant="primary" size="medium" onClick={() => navigate('/send')} className="flex-1">
                  Send
                </Button>
              </div>
            </Card>
          ) : (
            filteredTransactions.map((tx, index) => (
              <motion.div
                key={tx.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Card padding="lg" className="cursor-pointer hover:shadow-md transition-shadow">
                  <div
                    className="flex items-center space-x-4"
                    onClick={() => handleTransactionClick(tx)}
                  >
                    {/* Transaction Icon */}
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        backgroundColor: tx.type === 'sent' ? 'var(--apple-red-light)' :
                                        tx.type === 'received' ? 'var(--apple-green-light)' :
                                        'var(--apple-orange-light)',
                        color: tx.type === 'sent' ? 'var(--apple-red)' :
                               tx.type === 'received' ? 'var(--apple-green)' :
                               'var(--apple-orange)'
                      }}
                    >
                      {getTypeIcon(tx.type)}
                    </div>

                    {/* Transaction Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-semibold" style={{ color: 'var(--apple-label)' }}>
                          {tx.type === 'sent' ? 'Sent' : tx.type === 'received' ? 'Received' : 'Pending'}
                        </p>
                        <p
                          className={`font-semibold ${tx.type === 'sent' ? 'text-red-600' : 'text-green-600'}`}
                          style={{
                            color: tx.type === 'sent' ? 'var(--apple-red)' : 'var(--apple-green)'
                          }}
                        >
                          {formatAmount(tx.amount, tx.type)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-mono truncate" style={{ color: 'var(--apple-secondary-label)' }}>
                          {tx.type === 'sent' ? 'To: ' : 'From: '}{formatAddress(tx.address)}
                        </p>
                        <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                          {formatTimestamp(tx.timestamp)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: getStatusColor(tx.status) }}
                          ></div>
                          <p className="text-sm capitalize" style={{ color: getStatusColor(tx.status) }}>
                            {tx.status}
                          </p>
                          {tx.confirmations > 0 && (
                            <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                              ({tx.confirmations} conf.)
                            </p>
                          )}
                        </div>

                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToAddressBook(tx.address, tx.type);
                            }}
                            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                            title="Add to Address Book"
                          >
                            <ContactIcon className="w-4 h-4" style={{ color: 'var(--apple-green)' }} />
                          </button>
                          {tx.txHash && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                copyTransactionHash(tx.txHash!);
                              }}
                              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                              title="Copy Transaction Hash"
                            >
                              <CopyIcon className="w-4 h-4" style={{ color: 'var(--apple-blue)' }} />
                            </button>
                          )}
                        </div>
                      </div>

                      {tx.memo && (
                        <p className="text-sm mt-2 italic" style={{ color: 'var(--apple-secondary-label)' }}>
                          "{tx.memo}"
                        </p>
                      )}

                      {tx.fee && (
                        <p className="text-sm mt-1" style={{ color: 'var(--apple-secondary-label)' }}>
                          Fee: {tx.fee} BTC
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </motion.div>

        {/* Bitcoin Node Notice */}
        {!isLoading && filteredTransactions.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6"
          >
            <Card padding="lg">
              <div className="text-center">
                <InfoIcon className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--apple-blue)' }} />
                <h3 className="font-semibold mb-2" style={{ color: 'var(--apple-label)' }}>
                  Bitcoin Node Required
                </h3>
                <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                  Connect to a Bitcoin node to view real transaction history and broadcast transactions.
                </p>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

// Icon Components
const BackIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

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

const ClockIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const TransactionIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

const CopyIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const InfoIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ContactIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);