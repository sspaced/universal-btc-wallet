import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { SecuritySettings } from '../components/settings/SecuritySettings';
import { BackupRecovery } from '../components/settings/BackupRecovery';
import { DataExport } from '../components/settings/DataExport';
import { useWallet } from '../providers/WalletProvider';
import { useTheme } from '../providers/ThemeProvider';
import toast from 'react-hot-toast';

interface WalletInfo {
  name: string;
  addressCount: number;
  created: Date;
  lastUsed: Date;
}

export const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { currentWallet, accounts, deleteWallet, exportWallet } = useWallet();
  const { theme, setTheme } = useTheme();
  const [walletInfo, setWalletInfo] = useState<WalletInfo | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showBackupModal, setShowBackupModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showPrivateKeys, setShowPrivateKeys] = useState(false);

  // Load wallet info
  useEffect(() => {
    if (currentWallet) {
      setWalletInfo({
        name: 'My Bitcoin Wallet',
        addressCount: accounts.length,
        created: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        lastUsed: new Date()
      });
    }
  }, [currentWallet, accounts]);

  const handleDeleteWallet = async () => {
    try {
      await deleteWallet();
      toast.success('Wallet deleted successfully');
      navigate('/onboarding');
    } catch (error) {
      console.error('Failed to delete wallet:', error);
      toast.error('Failed to delete wallet');
    }
  };

  const handleExportWallet = async () => {
    setIsExporting(true);

    try {
      const exported = await exportWallet();

      if (exportFormat === 'mnemonic') {
        // Copy mnemonic to clipboard
        await navigator.clipboard.writeText(exported.mnemonic);
        toast.success('Recovery phrase copied to clipboard');
      } else {
        // Download JSON file
        const blob = new Blob([JSON.stringify(exported, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wallet-backup-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Wallet backup downloaded');
      }

      setShowExportModal(false);
    } catch (error) {
      console.error('Failed to export wallet:', error);
      toast.error('Failed to export wallet');
    } finally {
      setIsExporting(false);
    }
  };

  const copyAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success('Address copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy address');
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--apple-system-background)' }}>
        <Card padding="xl" className="text-center">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
            No Wallet Found
          </h2>
          <p className="mb-6" style={{ color: 'var(--apple-secondary-label)' }}>
            Create or import a wallet to access settings.
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
                Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage your wallet and preferences
              </p>
            </div>
          </div>
        </motion.div>

        {/* Wallet Info */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card padding="lg">
            <div className="flex items-center space-x-4 mb-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--apple-blue)' }}
              >
                <WalletIcon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold" style={{ color: 'var(--apple-label)' }}>
                  {walletInfo?.name}
                </h3>
                <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                  {walletInfo?.addressCount} address{walletInfo?.addressCount !== 1 ? 'es' : ''}
                </p>
              </div>
            </div>

            {walletInfo && (
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span style={{ color: 'var(--apple-secondary-label)' }}>Created</span>
                  <span style={{ color: 'var(--apple-label)' }}>{formatDate(walletInfo.created)}</span>
                </div>
                <div className="flex justify-between">
                  <span style={{ color: 'var(--apple-secondary-label)' }}>Last Used</span>
                  <span style={{ color: 'var(--apple-label)' }}>{formatDate(walletInfo.lastUsed)}</span>
                </div>
              </div>
            )}
          </Card>
        </motion.div>

        {/* Theme Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
              Appearance
            </h3>

            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'light', label: 'Light', icon: SunIcon },
                { key: 'dark', label: 'Dark', icon: MoonIcon },
                { key: 'system', label: 'System', icon: DeviceIcon }
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => setTheme(option.key as any)}
                  className={`p-4 rounded-xl text-center transition-colors ${
                    theme === option.key
                      ? 'bg-blue-500 text-white'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  style={{
                    backgroundColor: theme === option.key ? 'var(--apple-blue)' : 'var(--apple-gray-6)',
                    color: theme === option.key ? 'white' : 'var(--apple-label)'
                  }}
                >
                  <option.icon className="w-6 h-6 mx-auto mb-2" />
                  <p className="text-sm font-medium">{option.label}</p>
                </button>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Addresses */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--apple-label)' }}>
                Addresses
              </h3>
              <button
                onClick={() => setShowPrivateKeys(!showPrivateKeys)}
                className="text-sm font-medium"
                style={{ color: 'var(--apple-blue)' }}
              >
                {showPrivateKeys ? 'Hide Keys' : 'Show Keys'}
              </button>
            </div>

            <div className="space-y-3">
              {accounts.map((account, index) => (
                <div
                  key={index}
                  className="p-4 rounded-xl"
                  style={{ backgroundColor: 'var(--apple-gray-6)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: 'var(--apple-label)' }}>
                      Address {index + 1}
                    </span>
                    <button
                      onClick={() => copyAddress(account.getAddress().toString())}
                      className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <CopyIcon className="w-4 h-4" style={{ color: 'var(--apple-blue)' }} />
                    </button>
                  </div>
                  <p className="text-sm font-mono break-all" style={{ color: 'var(--apple-secondary-label)' }}>
                    {account.getAddress().toString()}
                  </p>

                  {showPrivateKeys && (
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--apple-separator)' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--apple-label)' }}>
                        Private Key (WIF)
                      </p>
                      <p className="text-xs font-mono break-all" style={{ color: 'var(--apple-red)' }}>
                        {account.toWIF()}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </motion.div>

        {/* Security Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-6"
        >
          <SecuritySettings />
        </motion.div>

        {/* Security & Backup */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
              Security & Backup
            </h3>

            <div className="space-y-3">
              <button
                onClick={() => setShowExportModal(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                style={{ backgroundColor: 'var(--apple-gray-6)' }}
              >
                <div className="flex items-center space-x-3">
                  <ExportIcon className="w-5 h-5" style={{ color: 'var(--apple-blue)' }} />
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--apple-label)' }}>
                      Export Wallet
                    </p>
                    <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                      Backup your recovery phrase
                    </p>
                  </div>
                </div>
                <ChevronIcon className="w-5 h-5" style={{ color: 'var(--apple-secondary-label)' }} />
              </button>

              <button
                onClick={() => navigate('/onboarding')}
                className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                style={{ backgroundColor: 'var(--apple-gray-6)' }}
              >
                <div className="flex items-center space-x-3">
                  <PlusIcon className="w-5 h-5" style={{ color: 'var(--apple-blue)' }} />
                  <div className="text-left">
                    <p className="font-medium" style={{ color: 'var(--apple-label)' }}>
                      Import Wallet
                    </p>
                    <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                      Add another wallet
                    </p>
                  </div>
                </div>
                <ChevronIcon className="w-5 h-5" style={{ color: 'var(--apple-secondary-label)' }} />
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-6"
        >
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-red)' }}>
              Danger Zone
            </h3>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-4 rounded-xl transition-colors"
              style={{
                backgroundColor: 'var(--apple-red-light)',
                color: 'var(--apple-red)'
              }}
            >
              <div className="flex items-center space-x-3">
                <TrashIcon className="w-5 h-5" />
                <div className="text-left">
                  <p className="font-medium">Delete Wallet</p>
                  <p className="text-sm opacity-80">Permanently remove this wallet</p>
                </div>
              </div>
              <ChevronIcon className="w-5 h-5" />
            </button>
          </Card>
        </motion.div>

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
              About
            </h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: 'var(--apple-secondary-label)' }}>Version</span>
                <span style={{ color: 'var(--apple-label)' }}>1.0.0</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--apple-secondary-label)' }}>Network</span>
                <span style={{ color: 'var(--apple-label)' }}>Bitcoin Mainnet</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: 'var(--apple-secondary-label)' }}>Build</span>
                <span style={{ color: 'var(--apple-label)' }}>2024.1.0</span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <Card padding="xl">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--apple-label)' }}>
                Export Wallet
              </h3>

              <div className="mb-6">
                <p className="text-sm mb-4" style={{ color: 'var(--apple-secondary-label)' }}>
                  Choose how you want to backup your wallet:
                </p>

                <div className="space-y-3">
                  {[
                    { key: 'mnemonic', label: 'Recovery Phrase', desc: 'Copy 12-word backup phrase' },
                    { key: 'json', label: 'JSON File', desc: 'Download encrypted backup file' }
                  ].map((option) => (
                    <label key={option.key} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="exportFormat"
                        value={option.key}
                        checked={exportFormat === option.key}
                        onChange={(e) => setExportFormat(e.target.value as any)}
                        className="text-blue-500"
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

              <div className="flex space-x-3">
                <Button
                  variant="tertiary"
                  size="medium"
                  onClick={() => setShowExportModal(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleExportWallet}
                  disabled={isExporting}
                  className="flex-1"
                >
                  {isExporting ? 'Exporting...' : 'Export'}
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-sm"
          >
            <Card padding="xl">
              <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--apple-red)' }}>
                Delete Wallet?
              </h3>

              <p className="mb-6" style={{ color: 'var(--apple-secondary-label)' }}>
                This action cannot be undone. Make sure you have backed up your recovery phrase
                before proceeding.
              </p>

              <div className="flex space-x-3">
                <Button
                  variant="tertiary"
                  size="medium"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="medium"
                  onClick={handleDeleteWallet}
                  className="flex-1"
                  style={{ backgroundColor: 'var(--apple-red)', borderColor: 'var(--apple-red)' }}
                >
                  Delete
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  );
};

// Icon Components
const BackIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const WalletIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const SunIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const MoonIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
  </svg>
);

const DeviceIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const CopyIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ExportIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
  </svg>
);

const PlusIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const TrashIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);