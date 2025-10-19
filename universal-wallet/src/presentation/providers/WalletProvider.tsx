import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { container, TYPES } from '../../shared/container/Container';
import { WalletService } from '../../application/services/WalletService';
import { ICryptoService } from '../../domain/services/ICryptoService';
import { ISecurityService } from '../../domain/services/ISecurityService';
import { Wallet, WalletId } from '../../domain/entities/Wallet';
import { Account } from '../../domain/entities/Account';
import { Transaction } from '../../domain/entities/Transaction';
import { CreateWalletRequest, CreateWalletResponse } from '../../domain/usecases/CreateWallet';
import { Amount, BitcoinAddress } from '../../shared/types/ValueObject';
import toast from 'react-hot-toast';

export interface WalletContextType {
  // State
  currentWallet: Wallet | null;
  accounts: Account[];
  transactions: Transaction[];
  isLoading: boolean;
  isInitialized: boolean;

  // Wallet operations
  createWallet: (request: CreateWalletRequest) => Promise<CreateWalletResponse | null>;
  loadWallet: (walletId: WalletId) => Promise<void>;
  lockWallet: () => Promise<void>;
  unlockWallet: (password: string) => Promise<boolean>;

  // Account operations
  getBalance: () => Amount;
  generateReceiveAddress: () => Promise<BitcoinAddress | null>;

  // Transaction operations
  sendBitcoin: (toAddress: string, amount: string, password: string) => Promise<Transaction | null>;
  getTransactionHistory: () => Promise<Transaction[]>;

  // Utility
  refreshData: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [currentWallet, setCurrentWallet] = useState<Wallet | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Get services from container
  const walletService = container.get<WalletService>(TYPES.WalletService);
  const cryptoService = container.get<ICryptoService>(TYPES.ICryptoService);
  const securityService = container.get<ISecurityService>(TYPES.ISecurityService);

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      setIsLoading(true);

      // Check if there's an existing wallet in localStorage
      const savedWalletId = localStorage.getItem('universal-wallet-current-wallet');
      if (savedWalletId) {
        await loadWallet({ value: savedWalletId });
      }

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      toast.error('Failed to initialize wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const createWallet = async (request: CreateWalletRequest): Promise<CreateWalletResponse | null> => {
    try {
      setIsLoading(true);
      console.log('🚀 Starting wallet creation...', request);

      // Create simplified mock wallet for demo
      const walletId = { value: crypto.randomUUID() };
      console.log('✅ Generated wallet ID:', walletId);

      // Generate mock mnemonic
      const mockMnemonic = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
      const seedPhrase = mockMnemonic.split(' ');
      console.log('✅ Generated mnemonic');

      // Test BitcoinAddress creation first
      console.log('🔍 Creating Bitcoin address...');
      const testAddress = new BitcoinAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4');
      console.log('✅ Bitcoin address created:', testAddress.toString());

      // Test Amount creation
      console.log('🔍 Creating amount...');
      const testAmount = new Amount(25000000n, 'sats');
      console.log('✅ Amount created:', testAmount.getValue().toString());

      // Create mock wallet
      console.log('🔍 Creating wallet entity...');
      const mockWallet = new Wallet({
        id: walletId,
        name: request.name,
        addresses: [testAddress],
        balance: testAmount,
        isLocked: false,
        createdAt: new Date(),
        lastAccessedAt: new Date()
      });
      console.log('✅ Wallet entity created');

      // Create mock main account
      console.log('🔍 Creating account entity...');
      const mockMainAccount = new Account({
        id: { value: crypto.randomUUID() },
        walletId: walletId,
        name: 'Main Account',
        type: 'main',
        derivationPath: "m/44'/0'/0'/0/0",
        publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', // Valid compressed public key
        address: testAddress,
        balance: testAmount,
        isActive: true,
        createdAt: new Date()
      });
      console.log('✅ Account entity created');

      const response: CreateWalletResponse = {
        wallet: mockWallet,
        mainAccount: mockMainAccount,
        mnemonic: mockMnemonic,
        seedPhrase: seedPhrase
      };

      // Set as current wallet
      setCurrentWallet(response.wallet);
      setAccounts([response.mainAccount]);

      // Save wallet ID to localStorage
      localStorage.setItem('universal-wallet-current-wallet', response.wallet.getId().value);

      // Load mock transactions
      await loadMockTransactions();

      toast.success('Wallet created successfully!');
      console.log('🎉 Wallet creation completed successfully!');
      return response;

    } catch (error) {
      console.error('❌ Failed to create wallet:', error);
      console.error('Error details:', error instanceof Error ? error.message : 'Unknown error');
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast.error('Failed to create wallet: ' + (error instanceof Error ? error.message : 'Unknown error'));
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const loadWallet = async (walletId: WalletId): Promise<void> => {
    try {
      setIsLoading(true);

      const result = await walletService.getWallet(walletId);

      if (!result.success) {
        toast.error('Wallet not found');
        return;
      }

      if (!result.value) {
        toast.error('Wallet not found');
        return;
      }

      setCurrentWallet(result.value);

      // Load accounts (simplified - in real implementation, load from account repository)
      // For now, create a mock main account
      const mockMainAccount = new Account({
        id: { value: crypto.randomUUID() },
        walletId: walletId,
        name: 'Main Account',
        type: 'main',
        derivationPath: "m/44'/0'/0'/0/0",
        publicKey: '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798', // Valid compressed public key
        address: new BitcoinAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
        balance: new Amount(25000000n, 'sats'), // 0.25 BTC
        isActive: true,
        createdAt: new Date()
      });

      setAccounts([mockMainAccount]);

      // Load mock transactions
      await loadMockTransactions();

    } catch (error) {
      console.error('Failed to load wallet:', error);
      toast.error('Failed to load wallet');
    } finally {
      setIsLoading(false);
    }
  };

  const loadMockTransactions = async (): Promise<void> => {
    // Create mock transactions for demo
    const mockTransactions = [
      new Transaction({
        id: { value: crypto.randomUUID() },
        type: 'receive',
        status: 'confirmed',
        inputs: [],
        outputs: [{
          address: new BitcoinAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
          amount: new Amount(5000000n, 'sats') // 0.05 BTC
        }],
        fee: new Amount(1000n, 'sats'),
        confirmations: 6,
        createdAt: new Date(Date.now() - 86400000), // 1 day ago
        confirmedAt: new Date(Date.now() - 86000000)
      }),
      new Transaction({
        id: { value: crypto.randomUUID() },
        type: 'send',
        status: 'confirmed',
        inputs: [{
          txHash: new (class extends Object {
            constructor(public value: string) { super(); }
            toString() { return this.value; }
            equals(other: any) { return other?.value === this.value; }
          })('b'.repeat(64)),
          outputIndex: 0,
          address: new BitcoinAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
          amount: new Amount(1100000n, 'sats')
        }],
        outputs: [{
          address: new BitcoinAddress('bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4'),
          amount: new Amount(1000000n, 'sats') // 0.01 BTC
        }],
        fee: new Amount(100000n, 'sats'),
        confirmations: 12,
        createdAt: new Date(Date.now() - 172800000), // 2 days ago
        confirmedAt: new Date(Date.now() - 172400000)
      })
    ];

    setTransactions(mockTransactions);
  };

  const lockWallet = async (): Promise<void> => {
    if (!currentWallet) return;

    try {
      const result = await walletService.lockWallet(currentWallet.getId());

      if (result.success) {
        setCurrentWallet(prev => prev ? prev.lock() : null);
        toast.success('Wallet locked');
      }
    } catch (error) {
      console.error('Failed to lock wallet:', error);
      toast.error('Failed to lock wallet');
    }
  };

  const unlockWallet = async (password: string): Promise<boolean> => {
    if (!currentWallet) return false;

    try {
      const result = await walletService.unlockWallet(currentWallet.getId(), password);

      if (result.success) {
        setCurrentWallet(prev => prev ? prev.unlock() : null);
        toast.success('Wallet unlocked');
        return true;
      } else {
        toast.error('Invalid password');
        return false;
      }
    } catch (error) {
      console.error('Failed to unlock wallet:', error);
      toast.error('Failed to unlock wallet');
      return false;
    }
  };

  const getBalance = (): Amount => {
    if (!currentWallet) {
      return new Amount(0n, 'sats');
    }
    return currentWallet.getBalance();
  };

  const generateReceiveAddress = async (): Promise<BitcoinAddress | null> => {
    if (!currentWallet) return null;

    try {
      // In a real implementation, generate a new address from the HD wallet
      // For demo, return the current address
      return accounts[0]?.getAddress() || null;
    } catch (error) {
      console.error('Failed to generate address:', error);
      toast.error('Failed to generate address');
      return null;
    }
  };

  const sendBitcoin = async (toAddress: string, amount: string, password: string): Promise<Transaction | null> => {
    if (!currentWallet || !accounts[0]) return null;

    try {
      setIsLoading(true);

      // Validate inputs
      const amountSats = BigInt(Math.floor(parseFloat(amount) * 100000000));
      const fromAddress = accounts[0].getAddress();
      const toAddr = new BitcoinAddress(toAddress);
      const amountObj = new Amount(amountSats, 'sats');

      // Create mock transaction
      const newTransaction = new Transaction({
        id: { value: crypto.randomUUID() },
        type: 'send',
        status: 'pending',
        inputs: [{
          txHash: new (class extends Object {
            constructor(public value: string) { super(); }
            toString() { return this.value; }
            equals(other: any) { return other?.value === this.value; }
          })('c'.repeat(64)),
          outputIndex: 0,
          address: fromAddress,
          amount: amountObj.add(new Amount(1000n, 'sats')) // Include fee
        }],
        outputs: [{
          address: toAddr,
          amount: amountObj
        }],
        fee: new Amount(1000n, 'sats'),
        confirmations: 0,
        createdAt: new Date()
      });

      // Add to transactions list
      setTransactions(prev => [newTransaction, ...prev]);

      // Update wallet balance (optimistically)
      const newBalance = currentWallet.getBalance().subtract(amountObj.add(new Amount(1000n, 'sats')));
      setCurrentWallet(prev => prev ? prev.updateBalance(newBalance) : null);

      toast.success('Transaction sent successfully!');
      return newTransaction;

    } catch (error) {
      console.error('Failed to send Bitcoin:', error);
      toast.error('Failed to send Bitcoin');
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionHistory = async (): Promise<Transaction[]> => {
    return transactions;
  };

  const refreshData = async (): Promise<void> => {
    if (!currentWallet) return;

    try {
      setIsLoading(true);

      // In a real implementation, refresh data from blockchain APIs
      await loadMockTransactions();

      toast.success('Data refreshed');
    } catch (error) {
      console.error('Failed to refresh data:', error);
      toast.error('Failed to refresh data');
    } finally {
      setIsLoading(false);
    }
  };

  const value: WalletContextType = {
    // State
    currentWallet,
    accounts,
    transactions,
    isLoading,
    isInitialized,

    // Operations
    createWallet,
    loadWallet,
    lockWallet,
    unlockWallet,
    getBalance,
    generateReceiveAddress,
    sendBitcoin,
    getTransactionHistory,
    refreshData
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};