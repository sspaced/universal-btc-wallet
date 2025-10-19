import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useWallet } from '../../providers/WalletProvider';
import toast from 'react-hot-toast';

interface ExportData {
  transactions: any[];
  addresses: string[];
  balance: string;
  settings: any;
  addressBook: any[];
}

interface ExportOptions {
  includeTransactions: boolean;
  includeAddresses: boolean;
  includeBalance: boolean;
  includeSettings: boolean;
  includeAddressBook: boolean;
  dateRange: 'all' | '30d' | '90d' | '1y';
  format: 'csv' | 'json' | 'pdf';
}

interface DataExportProps {
  onClose?: () => void;
  className?: string;
}

export const DataExport: React.FC<DataExportProps> = ({
  onClose,
  className = ''
}) => {
  const { currentWallet, accounts, getBalance } = useWallet();
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'options' | 'progress' | 'complete'>('options');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeTransactions: true,
    includeAddresses: true,
    includeBalance: true,
    includeSettings: false,
    includeAddressBook: true,
    dateRange: 'all',
    format: 'csv'
  });
  const [exportedData, setExportedData] = useState<ExportData | null>(null);
  const [estimatedSize, setEstimatedSize] = useState<string>('');

  // Calculate estimated export size
  useEffect(() => {
    const calculateSize = () => {
      let estimatedRows = 0;
      let estimatedCols = 0;

      if (exportOptions.includeTransactions) {
        // Mock transaction count based on date range
        const mockTxCounts = {
          'all': 150,
          '1y': 120,
          '90d': 45,
          '30d': 15
        };
        estimatedRows += mockTxCounts[exportOptions.dateRange];
        estimatedCols += 8; // tx columns
      }

      if (exportOptions.includeAddresses) {
        estimatedRows += accounts.length;
        estimatedCols += 3; // address columns
      }

      if (exportOptions.includeAddressBook) {
        const savedContacts = localStorage.getItem('wallet-address-book');
        const contactCount = savedContacts ? JSON.parse(savedContacts).length : 0;
        estimatedRows += contactCount;
        estimatedCols += 4; // contact columns
      }

      // Rough size estimation
      const avgCellSize = 50; // bytes
      const estimatedBytes = estimatedRows * estimatedCols * avgCellSize;

      if (estimatedBytes < 1024) {
        setEstimatedSize(`${estimatedBytes} bytes`);
      } else if (estimatedBytes < 1024 * 1024) {
        setEstimatedSize(`${(estimatedBytes / 1024).toFixed(1)} KB`);
      } else {
        setEstimatedSize(`${(estimatedBytes / (1024 * 1024)).toFixed(1)} MB`);
      }
    };

    calculateSize();
  }, [exportOptions, accounts]);

  const collectExportData = async (): Promise<ExportData> => {
    const data: ExportData = {
      transactions: [],
      addresses: [],
      balance: '0',
      settings: {},
      addressBook: []
    };

    // Collect transactions
    if (exportOptions.includeTransactions) {
      setExportProgress(20);
      // Mock transaction data - in real implementation, fetch from blockchain
      const mockTransactions = [
        {
          id: '1',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          type: 'received',
          amount: '0.00125000',
          address: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          confirmations: 6,
          status: 'confirmed',
          txHash: '1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890',
          fee: '0.00001500'
        },
        {
          id: '2',
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          type: 'sent',
          amount: '0.00050000',
          address: 'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4',
          confirmations: 144,
          status: 'confirmed',
          txHash: 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
          fee: '0.00001500',
          memo: 'Coffee payment'
        }
      ];

      // Filter by date range
      const now = new Date();
      const cutoffDates = {
        'all': new Date(0),
        '1y': new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000),
        '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };

      data.transactions = mockTransactions.filter(tx =>
        new Date(tx.date) >= cutoffDates[exportOptions.dateRange]
      );
    }

    // Collect addresses
    if (exportOptions.includeAddresses) {
      setExportProgress(40);
      data.addresses = accounts.map((account, index) => ({
        index: index + 1,
        address: account.getAddress().toString(),
        type: 'P2WPKH',
        balance: '0.00000000' // In real implementation, get actual balance
      }));
    }

    // Collect balance
    if (exportOptions.includeBalance) {
      setExportProgress(60);
      try {
        const totalBalance = accounts.length > 0 ? await getBalance(accounts[0].getAddress().toString()) : '0';
        data.balance = totalBalance.toString();
      } catch (error) {
        data.balance = '0';
      }
    }

    // Collect settings
    if (exportOptions.includeSettings) {
      setExportProgress(80);
      const securitySettings = localStorage.getItem('wallet-security-preferences');
      const themeSettings = localStorage.getItem('wallet-theme');

      data.settings = {
        security: securitySettings ? JSON.parse(securitySettings) : {},
        theme: themeSettings || 'light',
        exportDate: new Date().toISOString()
      };
    }

    // Collect address book
    if (exportOptions.includeAddressBook) {
      setExportProgress(90);
      const savedContacts = localStorage.getItem('wallet-address-book');
      data.addressBook = savedContacts ? JSON.parse(savedContacts) : [];
    }

    setExportProgress(100);
    return data;
  };

  const generateCSV = (data: ExportData): string => {
    let csv = '';

    // Export transactions
    if (exportOptions.includeTransactions && data.transactions.length > 0) {
      csv += 'TRANSACTIONS\\n';
      csv += 'Date,Type,Amount (BTC),Address,Status,Confirmations,Fee (BTC),Memo,Transaction Hash\\n';

      data.transactions.forEach(tx => {
        csv += `"${tx.date}","${tx.type}","${tx.amount}","${tx.address}","${tx.status}","${tx.confirmations}","${tx.fee || ''}","${tx.memo || ''}","${tx.txHash}"\\n`;
      });
      csv += '\\n';
    }

    // Export addresses
    if (exportOptions.includeAddresses && data.addresses.length > 0) {
      csv += 'ADDRESSES\\n';
      csv += 'Index,Address,Type,Balance (BTC)\\n';

      data.addresses.forEach(addr => {
        csv += `"${addr.index}","${addr.address}","${addr.type}","${addr.balance}"\\n`;
      });
      csv += '\\n';
    }

    // Export address book
    if (exportOptions.includeAddressBook && data.addressBook.length > 0) {
      csv += 'ADDRESS BOOK\\n';
      csv += 'Name,Address,Memo,Created Date,Last Used\\n';

      data.addressBook.forEach(contact => {
        csv += `"${contact.name}","${contact.address}","${contact.memo || ''}","${contact.createdAt}","${contact.lastUsed || ''}"\\n`;
      });
      csv += '\\n';
    }

    // Export summary
    csv += 'WALLET SUMMARY\\n';
    csv += 'Total Balance (BTC),Total Addresses,Total Transactions,Export Date\\n';
    csv += `"${data.balance}","${data.addresses.length}","${data.transactions.length}","${new Date().toISOString()}"\\n`;

    return csv;
  };

  const generateJSON = (data: ExportData): string => {
    const exportData = {
      walletInfo: {
        exportDate: new Date().toISOString(),
        exportOptions: exportOptions,
        totalBalance: data.balance,
        totalAddresses: data.addresses.length,
        totalTransactions: data.transactions.length
      },
      ...(exportOptions.includeTransactions && { transactions: data.transactions }),
      ...(exportOptions.includeAddresses && { addresses: data.addresses }),
      ...(exportOptions.includeAddressBook && { addressBook: data.addressBook }),
      ...(exportOptions.includeSettings && { settings: data.settings })
    };

    return JSON.stringify(exportData, null, 2);
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExport = async () => {
    if (!currentWallet) {
      toast.error('No wallet found');
      return;
    }

    setIsExporting(true);
    setCurrentStep('progress');
    setExportProgress(0);

    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 500));

      const data = await collectExportData();
      setExportedData(data);

      const timestamp = new Date().toISOString().split('T')[0];
      const baseFilename = `bitcoin-wallet-export-${timestamp}`;

      if (exportOptions.format === 'csv') {
        const csvContent = generateCSV(data);
        downloadFile(csvContent, `${baseFilename}.csv`, 'text/csv');
      } else if (exportOptions.format === 'json') {
        const jsonContent = generateJSON(data);
        downloadFile(jsonContent, `${baseFilename}.json`, 'application/json');
      }

      setCurrentStep('complete');
      toast.success('Export completed successfully!');

    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed: ' + (error as Error).message);
      setCurrentStep('options');
    } finally {
      setIsExporting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep('options');
    setExportProgress(0);
    setExportedData(null);
    if (onClose) {
      onClose();
    }
  };

  const renderOptionsStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--apple-blue-light)' }}>
          <DownloadIcon className="w-8 h-8" style={{ color: 'var(--apple-blue)' }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>
          Export Wallet Data
        </h3>
        <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
          Download your wallet data for backup or analysis
        </p>
      </div>

      {/* Data Selection */}
      <div>
        <h4 className="font-semibold mb-3" style={{ color: 'var(--apple-label)' }}>
          What to Export
        </h4>
        <div className="space-y-3">
          {[
            { key: 'includeTransactions', label: 'Transaction History', desc: 'All your Bitcoin transactions' },
            { key: 'includeAddresses', label: 'Wallet Addresses', desc: 'Generated addresses and balances' },
            { key: 'includeAddressBook', label: 'Address Book', desc: 'Saved contacts and labels' },
            { key: 'includeBalance', label: 'Current Balance', desc: 'Total wallet balance' },
            { key: 'includeSettings', label: 'Wallet Settings', desc: 'Security and preference settings' }
          ].map((option) => (
            <label key={option.key} className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <input
                type="checkbox"
                checked={exportOptions[option.key as keyof ExportOptions] as boolean}
                onChange={(e) => setExportOptions({
                  ...exportOptions,
                  [option.key]: e.target.checked
                })}
                className="mt-1"
              />
              <div>
                <p className="font-medium" style={{ color: 'var(--apple-label)' }}>
                  {option.label}
                </p>
                <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                  {option.desc}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range */}
      {exportOptions.includeTransactions && (
        <div>
          <h4 className="font-semibold mb-3" style={{ color: 'var(--apple-label)' }}>
            Transaction Date Range
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: 'all', label: 'All Time' },
              { key: '1y', label: 'Last Year' },
              { key: '90d', label: 'Last 90 Days' },
              { key: '30d', label: 'Last 30 Days' }
            ].map((option) => (
              <button
                key={option.key}
                onClick={() => setExportOptions({ ...exportOptions, dateRange: option.key as any })}
                className="p-3 rounded-xl text-center transition-colors"
                style={{
                  backgroundColor: exportOptions.dateRange === option.key ? 'var(--apple-blue)' : 'var(--apple-gray-6)',
                  color: exportOptions.dateRange === option.key ? 'white' : 'var(--apple-label)'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Export Format */}
      <div>
        <h4 className="font-semibold mb-3" style={{ color: 'var(--apple-label)' }}>
          Export Format
        </h4>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'csv', label: 'CSV', desc: 'Excel compatible' },
            { key: 'json', label: 'JSON', desc: 'Structured data' }
          ].map((option) => (
            <button
              key={option.key}
              onClick={() => setExportOptions({ ...exportOptions, format: option.key as any })}
              className="p-4 rounded-xl text-left transition-colors"
              style={{
                backgroundColor: exportOptions.format === option.key ? 'var(--apple-blue)' : 'var(--apple-gray-6)',
                color: exportOptions.format === option.key ? 'white' : 'var(--apple-label)'
              }}
            >
              <p className="font-medium">{option.label}</p>
              <p className="text-sm opacity-80">{option.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Export Info */}
      <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--apple-gray-6)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium" style={{ color: 'var(--apple-label)' }}>
            Estimated Size
          </span>
          <span className="text-sm" style={{ color: 'var(--apple-label)' }}>
            {estimatedSize}
          </span>
        </div>
        <p className="text-xs" style={{ color: 'var(--apple-secondary-label)' }}>
          Actual file size may vary depending on data complexity
        </p>
      </div>

      {/* Actions */}
      <div className="flex space-x-3">
        {onClose && (
          <Button variant="tertiary" size="medium" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          size="medium"
          onClick={handleExport}
          disabled={!Object.values(exportOptions).slice(0, 5).some(Boolean)}
          className={onClose ? "flex-1" : "w-full"}
        >
          Export Data
        </Button>
      </div>
    </div>
  );

  const renderProgressStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--apple-blue-light)' }}>
        <DownloadIcon className="w-8 h-8" style={{ color: 'var(--apple-blue)' }} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>
        Exporting Data...
      </h3>

      <div className="space-y-4">
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-500"
            style={{
              backgroundColor: 'var(--apple-blue)',
              width: `${exportProgress}%`
            }}
          ></div>
        </div>
        <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
          {exportProgress}% complete
        </p>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--apple-green-light)' }}>
        <CheckIcon className="w-8 h-8" style={{ color: 'var(--apple-green)' }} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>
        Export Complete!
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--apple-secondary-label)' }}>
        Your wallet data has been successfully exported and downloaded.
      </p>

      {exportedData && (
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--apple-green-light)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--apple-green)' }}>
            Export Summary
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p style={{ color: 'var(--apple-green)' }}>Transactions</p>
              <p className="font-medium" style={{ color: 'var(--apple-green)' }}>
                {exportedData.transactions.length}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--apple-green)' }}>Addresses</p>
              <p className="font-medium" style={{ color: 'var(--apple-green)' }}>
                {exportedData.addresses.length}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--apple-green)' }}>Contacts</p>
              <p className="font-medium" style={{ color: 'var(--apple-green)' }}>
                {exportedData.addressBook.length}
              </p>
            </div>
            <div>
              <p style={{ color: 'var(--apple-green)' }}>Format</p>
              <p className="font-medium" style={{ color: 'var(--apple-green)' }}>
                {exportOptions.format.toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      <Button variant="primary" size="large" onClick={handleClose} fullWidth>
        Done
      </Button>
    </div>
  );

  if (!currentWallet) {
    return (
      <Card padding="lg" className={className}>
        <div className="text-center">
          <p style={{ color: 'var(--apple-secondary-label)' }}>
            No wallet found. Please create or import a wallet first.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card padding="lg" className={className}>
      {currentStep === 'options' && renderOptionsStep()}
      {currentStep === 'progress' && renderProgressStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </Card>
  );
};

// Icon Components
const DownloadIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const CheckIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);