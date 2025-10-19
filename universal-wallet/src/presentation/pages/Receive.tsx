import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { useWallet } from '../providers/WalletProvider';
import toast from 'react-hot-toast';

export const Receive: React.FC = () => {
  const navigate = useNavigate();
  const { currentWallet, accounts } = useWallet();
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [amount, setAmount] = useState('');
  const [label, setLabel] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Get current address
  const currentAddress = accounts[selectedAddressIndex]?.getAddress().toString() ||
    'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4';

  // Generate QR code
  useEffect(() => {
    generateQRCode();
  }, [currentAddress, amount, label]);

  const generateQRCode = async () => {
    try {
      let bitcoinUri = `bitcoin:${currentAddress}`;

      const params = new URLSearchParams();
      if (amount) params.append('amount', amount);
      if (label) params.append('label', label);

      if (params.toString()) {
        bitcoinUri += `?${params.toString()}`;
      }

      const qrDataUrl = await QRCode.toDataURL(bitcoinUri, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'M'
      });

      setQrCodeUrl(qrDataUrl);

      // Also draw to canvas for potential download
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, bitcoinUri, {
          width: 512,
          margin: 4
        });
      }
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(currentAddress);
      toast.success('Address copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy address:', error);
      toast.error('Failed to copy address');
    }
  };

  const copyBitcoinUri = async () => {
    try {
      let bitcoinUri = `bitcoin:${currentAddress}`;

      const params = new URLSearchParams();
      if (amount) params.append('amount', amount);
      if (label) params.append('label', label);

      if (params.toString()) {
        bitcoinUri += `?${params.toString()}`;
      }

      await navigator.clipboard.writeText(bitcoinUri);
      toast.success('Bitcoin URI copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy URI:', error);
      toast.error('Failed to copy URI');
    }
  };

  const shareAddress = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bitcoin Address',
          text: `Send Bitcoin to: ${currentAddress}`,
          url: `bitcoin:${currentAddress}`
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      copyAddress();
    }
  };

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement('a');
      link.download = `bitcoin-qr-${currentAddress.slice(0, 8)}.png`;
      link.href = canvasRef.current.toDataURL();
      link.click();
    }
  };

  const formatAddress = (address: string) => {
    if (address.length <= 20) return address;
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  if (!currentWallet) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--apple-secondary-system-background)' }}>
        <Card padding="xl" className="text-center">
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
            No Wallet Found
          </h2>
          <p className="mb-6" style={{ color: 'var(--apple-secondary-label)' }}>
            Create or import a wallet to receive Bitcoin.
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
                Receive Bitcoin
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Share your address to receive payments
              </p>
            </div>
          </div>
        </motion.div>

        {/* QR Code Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card padding="xl" className="text-center">
            <div className="mb-6">
              {qrCodeUrl && (
                <div className="inline-block p-4 bg-white rounded-2xl shadow-sm">
                  <img
                    src={qrCodeUrl}
                    alt="Bitcoin Address QR Code"
                    className="w-64 h-64 mx-auto"
                  />
                </div>
              )}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                size="large"
                fullWidth
                leftIcon={<CopyIcon className="w-5 h-5" />}
                onClick={copyAddress}
              >
                Copy Address
              </Button>

              <div className="flex space-x-3">
                <Button
                  variant="secondary"
                  size="medium"
                  leftIcon={<ShareIcon className="w-4 h-4" />}
                  onClick={shareAddress}
                  className="flex-1"
                >
                  Share
                </Button>
                <Button
                  variant="secondary"
                  size="medium"
                  leftIcon={<DownloadIcon className="w-4 h-4" />}
                  onClick={downloadQR}
                  className="flex-1"
                >
                  Download
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Address Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <Card padding="lg">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
              Your Bitcoin Address
            </h3>

            <div
              className="p-4 rounded-xl cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
              style={{ backgroundColor: 'var(--apple-gray-6)' }}
              onClick={copyAddress}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-mono break-all" style={{ color: 'var(--apple-label)' }}>
                    {currentAddress}
                  </p>
                  <p className="text-xs mt-1" style={{ color: 'var(--apple-secondary-label)' }}>
                    Tap to copy
                  </p>
                </div>
                <CopyIcon className="w-5 h-5 ml-3 flex-shrink-0" style={{ color: 'var(--apple-blue)' }} />
              </div>
            </div>

            {accounts.length > 1 && (
              <div className="mt-4">
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
              </div>
            )}
          </Card>
        </motion.div>

        {/* Request Amount (Optional) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card padding="lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold" style={{ color: 'var(--apple-label)' }}>
                Request Amount
              </h3>
              <span className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                Optional
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
                  Amount (BTC)
                </label>
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

              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
                  Payment Label
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="What is this payment for?"
                  className="w-full p-4 rounded-xl border-0"
                  style={{
                    backgroundColor: 'var(--apple-gray-6)',
                    color: 'var(--apple-label)'
                  }}
                />
              </div>

              {(amount || label) && (
                <div className="flex space-x-3">
                  <Button
                    variant="tertiary"
                    size="medium"
                    onClick={() => { setAmount(''); setLabel(''); }}
                    className="flex-1"
                  >
                    Clear
                  </Button>
                  <Button variant="secondary" size="medium" onClick={copyBitcoinUri} className="flex-1">
                    Copy URI
                  </Button>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Advanced Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card padding="lg">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between p-2 -m-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-lg font-semibold" style={{ color: 'var(--apple-label)' }}>
                Advanced Options
              </h3>
              <ChevronIcon
                className={`w-5 h-5 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
                style={{ color: 'var(--apple-secondary-label)' }}
              />
            </button>

            {showAdvanced && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--apple-gray-6)' }}>
                    <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>Network</p>
                    <p className="font-semibold" style={{ color: 'var(--apple-label)' }}>Bitcoin</p>
                  </div>
                  <div className="text-center p-4 rounded-xl" style={{ backgroundColor: 'var(--apple-gray-6)' }}>
                    <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>Format</p>
                    <p className="font-semibold" style={{ color: 'var(--apple-label)' }}>Bech32</p>
                  </div>
                </div>

                <div className="pt-4 border-t" style={{ borderColor: 'var(--apple-separator)' }}>
                  <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                    This address can receive Bitcoin payments. Always verify the address before sending large amounts.
                  </p>
                </div>
              </motion.div>
            )}
          </Card>
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

const CopyIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ShareIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
  </svg>
);

const DownloadIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const ChevronIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);