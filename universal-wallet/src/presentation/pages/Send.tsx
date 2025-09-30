import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { QRScanner } from '../components/common/QRScanner';
import { AddressBook, addToAddressBook } from '../components/wallet/AddressBook';
import { FeeEstimator } from '../components/wallet/FeeEstimator';
import { useWallet } from '../providers/WalletProvider';
import toast from 'react-hot-toast';

export const Send: React.FC = () => {
  const navigate = useNavigate();
  const { currentWallet, accounts, getBalance } = useWallet();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [balance, setBalance] = useState('0');
  const [isValidAddress, setIsValidAddress] = useState(false);
  const [feeEstimate, setFeeEstimate] = useState({
    totalFee: 0,
    totalFeeUSD: 0,
    effectiveFeeRate: 0,
    txSize: 0,
    inputCount: 0,
    outputCount: 0
  });
  const [isConfirmingTx, setIsConfirmingTx] = useState(false);
  const [showAddressBook, setShowAddressBook] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [selectedContactName, setSelectedContactName] = useState('');

  // Get current address and balance
  const currentAddress = accounts[selectedAddressIndex]?.getAddress().toString() || '';

  // Load balance
  useEffect(() => {
    const loadBalance = async () => {
      if (currentAddress) {
        try {
          const bal = await getBalance(currentAddress);
          setBalance(bal.toString());
        } catch (error) {
          console.error('Failed to load balance:', error);
          setBalance('0');
        }
      }
    };

    loadBalance();
  }, [currentAddress, getBalance]);

  // Validate Bitcoin address
  useEffect(() => {
    const validateAddress = () => {
      if (!recipientAddress) {
        setIsValidAddress(false);
        return;
      }

      // Basic Bitcoin address validation (simplified)
      const bech32Regex = /^bc1[a-z0-9]{39,59}$/;
      const p2shRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;

      setIsValidAddress(bech32Regex.test(recipientAddress) || p2shRegex.test(recipientAddress));
    };

    validateAddress();
  }, [recipientAddress]);


  const handleMaxAmount = () => {
    const availableBalance = parseFloat(balance) - feeEstimate.totalFee;
    if (availableBalance > 0) {
      setAmount(availableBalance.toFixed(8));
    }
  };

  const validateTransaction = (): string | null => {
    if (!recipientAddress) return 'Please enter a recipient address';
    if (!isValidAddress) return 'Invalid Bitcoin address';
    if (!amount || parseFloat(amount) <= 0) return 'Please enter a valid amount';

    const totalAmount = parseFloat(amount) + feeEstimate.totalFee;
    if (totalAmount > parseFloat(balance)) {
      return 'Insufficient balance (including fees)';
    }

    if (recipientAddress === currentAddress) {
      return 'Cannot send to the same address';
    }

    return null;
  };

  const handleSendTransaction = async () => {
    const validationError = validateTransaction();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsConfirmingTx(true);

    try {
      // In a real implementation, this would:
      // 1. Create and sign the transaction
      // 2. Broadcast to the network
      // 3. Update local state

      toast.error('Bitcoin node required for transaction broadcasting');

      // Simulate transaction creation
      await new Promise(resolve => setTimeout(resolve, 2000));

      // For now, just show success message
      toast.success('Transaction will be available when Bitcoin node is connected');

      // Optionally add successful transaction to address book
      if (selectedContactName && recipientAddress) {
        // Address already in book, just update last used (handled by AddressBook component)
      } else if (recipientAddress && !selectedContactName) {
        // Ask user if they want to save this address
        const shouldSave = window.confirm(`Would you like to save this address to your address book?`);
        if (shouldSave) {
          const contactName = window.prompt('Enter a name for this contact:');
          if (contactName && contactName.trim()) {
            if (addToAddressBook(contactName.trim(), recipientAddress, memo || undefined)) {
              toast.success(`Added ${contactName.trim()} to address book`);
            }
          }
        }
      }

      // Reset form
      setRecipientAddress('');
      setAmount('');
      setMemo('');
      setSelectedContactName('');

    } catch (error) {
      console.error('Transaction failed:', error);
      toast.error('Transaction failed: ' + (error as Error).message);
    } finally {
      setIsConfirmingTx(false);
    }
  };

  const formatBalance = (bal: string) => {
    const num = parseFloat(bal);
    if (num === 0) return '0.00000000';
    if (num < 0.00000001) return '< 0.00000001';
    return num.toFixed(8);
  };

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (!currentWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--apple-system-background)' }}>
        <Card padding="xl" className="text-center">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
            No Wallet Found
          </h2>
          <p className="mb-6" style={{ color: 'var(--apple-secondary-label)' }}>
            Create or import a wallet to send Bitcoin.
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
                Send Bitcoin
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Transfer Bitcoin to another address
              </p>
            </div>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card padding="lg">
            <div className="text-center">
              <p className="text-sm mb-2" style={{ color: 'var(--apple-secondary-label)' }}>
                Available Balance
              </p>
              <p className="text-3xl font-bold mb-4" style={{ color: 'var(--apple-label)' }}>
                {formatBalance(balance)} BTC
              </p>

              {accounts.length > 1 && (
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
                    From Address ({selectedAddressIndex + 1} of {accounts.length})
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
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* QR Scanner */}
        {showQRScanner && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <QRScanner
              onScan={(address) => {
                setRecipientAddress(address);
                setSelectedContactName('');
                setShowQRScanner(false);
              }}
              onClose={() => setShowQRScanner(false)}
              title="Scan Bitcoin Address"
            />
          </motion.div>
        )}

        {/* Address Book */}
        {showAddressBook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6"
          >
            <AddressBook
              onSelectAddress={(address, name) => {
                setRecipientAddress(address);
                setSelectedContactName(name);
                setShowAddressBook(false);
              }}
              onClose={() => setShowAddressBook(false)}
            />
          </motion.div>
        )}

        {/* Send Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-6" style={{ color: 'var(--apple-label)' }}>
              Transaction Details
            </h3>

            <div className="space-y-4">
              {/* Recipient Address */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--apple-label)' }}>
                    Recipient Address
                  </label>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => {
                        setShowQRScanner(!showQRScanner);
                        setShowAddressBook(false);
                      }}
                      className="text-sm font-medium flex items-center space-x-1"
                      style={{ color: 'var(--apple-blue)' }}
                    >
                      <QRIcon className="w-4 h-4" />
                      <span>Scan</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowAddressBook(!showAddressBook);
                        setShowQRScanner(false);
                      }}
                      className="text-sm font-medium flex items-center space-x-1"
                      style={{ color: 'var(--apple-blue)' }}
                    >
                      <ContactBookIcon className="w-4 h-4" />
                      <span>Contacts</span>
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={recipientAddress}
                    onChange={(e) => {
                      setRecipientAddress(e.target.value);
                      setSelectedContactName(''); // Clear contact name when manually typing
                    }}
                    placeholder="bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4"
                    className="w-full p-4 rounded-xl border-0 text-sm font-mono pr-20"
                    style={{
                      backgroundColor: 'var(--apple-gray-6)',
                      color: 'var(--apple-label)'
                    }}
                  />
                  <button
                    onClick={() => {
                      setShowQRScanner(true);
                      setShowAddressBook(false);
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Scan QR Code"
                  >
                    <QRIcon className="w-5 h-5" style={{ color: 'var(--apple-blue)' }} />
                  </button>
                  {recipientAddress && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isValidAddress ? (
                        <CheckIcon className="w-5 h-5 text-green-500" />
                      ) : (
                        <CrossIcon className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  )}
                </div>
                {selectedContactName && (
                  <p className="text-sm mt-1" style={{ color: 'var(--apple-blue)' }}>
                    📱 {selectedContactName}
                  </p>
                )}
                {recipientAddress && !isValidAddress && (
                  <p className="text-sm mt-1 text-red-500">
                    Invalid Bitcoin address format
                  </p>
                )}
              </div>

              {/* Amount */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium" style={{ color: 'var(--apple-label)' }}>
                    Amount (BTC)
                  </label>
                  <button
                    onClick={handleMaxAmount}
                    className="text-sm font-medium"
                    style={{ color: 'var(--apple-blue)' }}
                  >
                    Max
                  </button>
                </div>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00000000"
                  step="0.00000001"
                  min="0"
                  className="w-full p-4 rounded-xl border-0 text-lg font-mono"
                  style={{
                    backgroundColor: 'var(--apple-gray-6)',
                    color: 'var(--apple-label)'
                  }}
                />
              </div>

              {/* Memo (Optional) */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
                  Memo <span className="font-normal" style={{ color: 'var(--apple-secondary-label)' }}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Payment description"
                  className="w-full p-4 rounded-xl border-0"
                  style={{
                    backgroundColor: 'var(--apple-gray-6)',
                    color: 'var(--apple-label)'
                  }}
                />
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Fee Estimator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <FeeEstimator
            amount={amount}
            recipientAddress={recipientAddress}
            onFeeChange={setFeeEstimate}
          />
        </motion.div>

        {/* Transaction Summary */}
        {amount && recipientAddress && isValidAddress && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6"
          >
            <Card padding="lg">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
                Transaction Summary
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--apple-secondary-label)' }}>Amount</span>
                  <span style={{ color: 'var(--apple-label)' }}>{amount} BTC</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--apple-secondary-label)' }}>Network Fee</span>
                  <span style={{ color: 'var(--apple-label)' }}>{feeEstimate.totalFee.toFixed(8)} BTC</span>
                </div>
                <div className="h-px" style={{ backgroundColor: 'var(--apple-separator)' }}></div>
                <div className="flex justify-between font-semibold">
                  <span style={{ color: 'var(--apple-label)' }}>Total</span>
                  <span style={{ color: 'var(--apple-label)' }}>
                    {(parseFloat(amount) + feeEstimate.totalFee).toFixed(8)} BTC
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Send Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            variant="primary"
            size="large"
            fullWidth
            leftIcon={!isConfirmingTx ? <SendIcon className="w-5 h-5" /> : undefined}
            onClick={handleSendTransaction}
            disabled={!recipientAddress || !isValidAddress || !amount || isConfirmingTx || parseFloat(amount) <= 0}
            loading={isConfirmingTx}
          >
            {isConfirmingTx ? 'Preparing Transaction...' : 'Send Bitcoin'}
          </Button>

          <p className="text-xs text-center mt-3" style={{ color: 'var(--apple-secondary-label)' }}>
            Review all details carefully. Bitcoin transactions are irreversible.
          </p>
        </motion.div>
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

const CheckIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CrossIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SendIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

const ChevronIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const QRIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
  </svg>
);

const ContactBookIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
  </svg>
);