import React, { useState, useEffect } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { useWallet } from '../../providers/WalletProvider';
import toast from 'react-hot-toast';

interface BackupRecoveryProps {
  onClose?: () => void;
  className?: string;
}

export const BackupRecovery: React.FC<BackupRecoveryProps> = ({
  onClose,
  className = ''
}) => {
  const { exportWallet, currentWallet } = useWallet();
  const [currentStep, setCurrentStep] = useState<'warning' | 'backup' | 'verify' | 'complete'>('warning');
  const [backupMethod, setBackupMethod] = useState<'phrase' | 'file' | 'both'>('phrase');
  const [seedPhrase, setSeedPhrase] = useState<string[]>([]);
  const [verificationWords, setVerificationWords] = useState<Array<{ index: number; word: string }>>([]);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [isExporting, setIsExporting] = useState(false);
  const [hasWrittenDown, setHasWrittenDown] = useState(false);
  const [understoodWarnings, setUnderstoodWarnings] = useState(false);

  // Generate random verification indices when backing up
  const generateVerificationWords = (phrase: string[]) => {
    const indices = [];
    while (indices.length < 3) {
      const randomIndex = Math.floor(Math.random() * phrase.length);
      if (!indices.includes(randomIndex)) {
        indices.push(randomIndex);
      }
    }
    return indices.sort().map(index => ({ index, word: phrase[index] }));
  };

  const handleStartBackup = async () => {
    if (!understoodWarnings) {
      toast.error('Please confirm you understand the security warnings');
      return;
    }

    setCurrentStep('backup');
    setIsExporting(true);

    try {
      const exported = await exportWallet();
      const words = exported.mnemonic.split(' ');
      setSeedPhrase(words);
      setVerificationWords(generateVerificationWords(words));

      if (backupMethod === 'file' || backupMethod === 'both') {
        // Download JSON backup
        const blob = new Blob([JSON.stringify(exported, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `wallet-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        toast.success('Backup file downloaded');
      }
    } catch (error) {
      console.error('Backup failed:', error);
      toast.error('Failed to create backup');
      setCurrentStep('warning');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCopyPhrase = async () => {
    try {
      await navigator.clipboard.writeText(seedPhrase.join(' '));
      toast.success('Recovery phrase copied to clipboard');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleVerifyPhrase = () => {
    if (!hasWrittenDown) {
      toast.error('Please confirm you have written down your recovery phrase');
      return;
    }
    setCurrentStep('verify');
    setUserInput(new Array(verificationWords.length).fill(''));
  };

  const handleVerificationSubmit = () => {
    const isCorrect = verificationWords.every((item, index) =>
      userInput[index]?.toLowerCase().trim() === item.word.toLowerCase()
    );

    if (isCorrect) {
      setCurrentStep('complete');
      toast.success('Backup verification successful!');
    } else {
      toast.error('Verification failed. Please check your words and try again.');
      setUserInput(new Array(verificationWords.length).fill(''));
    }
  };

  const handleComplete = () => {
    // Clear sensitive data
    setSeedPhrase([]);
    setVerificationWords([]);
    setUserInput([]);

    if (onClose) {
      onClose();
    } else {
      setCurrentStep('warning');
      setHasWrittenDown(false);
      setUnderstoodWarnings(false);
    }
  };

  const renderWarningStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--apple-orange-light)' }}>
          <WarningIcon className="w-8 h-8" style={{ color: 'var(--apple-orange)' }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>
          Backup Your Wallet
        </h3>
        <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
          Secure your Bitcoin with a proper backup
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--apple-red-light)' }}>
          <h4 className="font-semibold mb-2" style={{ color: 'var(--apple-red)' }}>
            ⚠️ Critical Security Information
          </h4>
          <ul className="text-sm space-y-2" style={{ color: 'var(--apple-red)' }}>
            <li>• Your recovery phrase is the ONLY way to restore your wallet</li>
            <li>• Anyone with your recovery phrase can steal your Bitcoin</li>
            <li>• Store it offline in a secure location</li>
            <li>• Never share it with anyone or store it digitally</li>
            <li>• Write it down on paper and verify it's correct</li>
          </ul>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3" style={{ color: 'var(--apple-label)' }}>
            Backup Method
          </label>
          <div className="space-y-3">
            {[
              { key: 'phrase', label: 'Recovery Phrase Only', desc: 'Safest method - write down 12 words' },
              { key: 'file', label: 'Encrypted File Only', desc: 'Download encrypted backup file' },
              { key: 'both', label: 'Both Methods', desc: 'Maximum redundancy (recommended)' }
            ].map((option) => (
              <label key={option.key} className="flex items-start space-x-3 cursor-pointer p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <input
                  type="radio"
                  name="backupMethod"
                  value={option.key}
                  checked={backupMethod === option.key}
                  onChange={(e) => setBackupMethod(e.target.value as any)}
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

        <label className="flex items-start space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={understoodWarnings}
            onChange={(e) => setUnderstoodWarnings(e.target.checked)}
            className="mt-1"
          />
          <span className="text-sm" style={{ color: 'var(--apple-label)' }}>
            I understand that losing my recovery phrase means permanently losing access to my Bitcoin
          </span>
        </label>
      </div>

      <div className="flex space-x-3">
        {onClose && (
          <Button variant="tertiary" size="medium" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        )}
        <Button
          variant="primary"
          size="medium"
          onClick={handleStartBackup}
          disabled={!understoodWarnings || isExporting}
          loading={isExporting}
          className={onClose ? "flex-1" : "w-full"}
        >
          {isExporting ? 'Creating Backup...' : 'Start Backup Process'}
        </Button>
      </div>
    </div>
  );

  const renderBackupStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--apple-blue-light)' }}>
          <KeyIcon className="w-8 h-8" style={{ color: 'var(--apple-blue)' }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>
          Your Recovery Phrase
        </h3>
        <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
          Write down these 12 words in the exact order shown
        </p>
      </div>

      {(backupMethod === 'phrase' || backupMethod === 'both') && (
        <div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {seedPhrase.map((word, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 rounded-lg"
                style={{ backgroundColor: 'var(--apple-gray-6)' }}
              >
                <span className="w-6 text-center text-sm font-semibold" style={{ color: 'var(--apple-secondary-label)' }}>
                  {index + 1}
                </span>
                <span className="font-mono font-medium" style={{ color: 'var(--apple-label)' }}>
                  {word}
                </span>
              </div>
            ))}
          </div>

          <div className="flex space-x-3 mb-4">
            <Button variant="secondary" size="small" onClick={handleCopyPhrase} className="flex-1">
              Copy to Clipboard
            </Button>
            <Button
              variant="tertiary"
              size="small"
              onClick={() => window.print()}
              className="flex-1"
            >
              Print
            </Button>
          </div>

          <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--apple-orange-light)' }}>
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--apple-orange)' }}>
              📝 Write Down Instructions:
            </p>
            <ul className="text-sm space-y-1" style={{ color: 'var(--apple-orange)' }}>
              <li>• Use pen and paper (never digital storage)</li>
              <li>• Double-check spelling and order</li>
              <li>• Store in a fireproof safe or deposit box</li>
              <li>• Consider making multiple copies</li>
              <li>• Keep in separate secure locations</li>
            </ul>
          </div>

          <label className="flex items-start space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={hasWrittenDown}
              onChange={(e) => setHasWrittenDown(e.target.checked)}
              className="mt-1"
            />
            <span className="text-sm" style={{ color: 'var(--apple-label)' }}>
              I have written down my recovery phrase on paper and stored it securely
            </span>
          </label>
        </div>
      )}

      <div className="flex space-x-3">
        <Button variant="tertiary" size="medium" onClick={() => setCurrentStep('warning')} className="flex-1">
          Back
        </Button>
        <Button
          variant="primary"
          size="medium"
          onClick={backupMethod === 'file' ? () => setCurrentStep('complete') : handleVerifyPhrase}
          disabled={!hasWrittenDown && (backupMethod === 'phrase' || backupMethod === 'both')}
          className="flex-1"
        >
          {backupMethod === 'file' ? 'Complete' : 'Verify Backup'}
        </Button>
      </div>
    </div>
  );

  const renderVerifyStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--apple-green-light)' }}>
          <CheckIcon className="w-8 h-8" style={{ color: 'var(--apple-green)' }} />
        </div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>
          Verify Your Backup
        </h3>
        <p className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
          Enter the requested words to confirm your backup is correct
        </p>
      </div>

      <div className="space-y-4">
        {verificationWords.map((item, index) => (
          <div key={index}>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
              Word #{item.index + 1}
            </label>
            <input
              type="text"
              value={userInput[index] || ''}
              onChange={(e) => {
                const newInput = [...userInput];
                newInput[index] = e.target.value;
                setUserInput(newInput);
              }}
              placeholder="Enter the word"
              className="w-full p-3 rounded-xl border-0 text-lg font-mono"
              style={{
                backgroundColor: 'var(--apple-gray-6)',
                color: 'var(--apple-label)'
              }}
              autoComplete="off"
              spellCheck="false"
            />
          </div>
        ))}
      </div>

      <div className="flex space-x-3">
        <Button variant="tertiary" size="medium" onClick={() => setCurrentStep('backup')} className="flex-1">
          Back
        </Button>
        <Button
          variant="primary"
          size="medium"
          onClick={handleVerificationSubmit}
          disabled={userInput.some(word => !word?.trim())}
          className="flex-1"
        >
          Verify
        </Button>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--apple-green-light)' }}>
        <ShieldCheckIcon className="w-8 h-8" style={{ color: 'var(--apple-green)' }} />
      </div>
      <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>
        Backup Complete!
      </h3>
      <p className="text-sm mb-6" style={{ color: 'var(--apple-secondary-label)' }}>
        Your wallet is now securely backed up. Your Bitcoin is safe as long as you keep your recovery phrase secure.
      </p>

      <div className="p-4 rounded-xl" style={{ backgroundColor: 'var(--apple-green-light)' }}>
        <h4 className="font-semibold mb-2" style={{ color: 'var(--apple-green)' }}>
          ✅ Next Steps:
        </h4>
        <ul className="text-sm space-y-1" style={{ color: 'var(--apple-green)' }}>
          <li>• Store your recovery phrase in a safe place</li>
          <li>• Test wallet recovery before sending large amounts</li>
          <li>• Consider creating additional backup copies</li>
          <li>• Never share your recovery phrase with anyone</li>
        </ul>
      </div>

      <Button variant="primary" size="large" onClick={handleComplete} fullWidth>
        Complete
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
      {currentStep === 'warning' && renderWarningStep()}
      {currentStep === 'backup' && renderBackupStep()}
      {currentStep === 'verify' && renderVerifyStep()}
      {currentStep === 'complete' && renderCompleteStep()}
    </Card>
  );
};

// Icon Components
const WarningIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const KeyIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const CheckIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const ShieldCheckIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);