import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Logo } from '../components/common/Logo';
import { useWallet } from '../providers/WalletProvider';
import toast from 'react-hot-toast';

export const Onboarding: React.FC = () => {
  const [step, setStep] = useState(1);
  const [walletName, setWalletName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [generatedMnemonic, setGeneratedMnemonic] = useState<string[]>([]);
  const [isImportFlow, setIsImportFlow] = useState(false);
  const [importMnemonic, setImportMnemonic] = useState('');
  const [mnemonicVerification, setMnemonicVerification] = useState<string[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);

  const { createWallet, importWallet } = useWallet();
  const navigate = useNavigate();

  const handleCreateWallet = async () => {
    if (!walletName.trim()) {
      toast.error('Please enter a wallet name');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setIsCreating(true);

      const response = await createWallet({
        name: walletName.trim(),
        password
      });

      if (response) {
        setGeneratedMnemonic(response.seedPhrase);
        setStep(3);
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
      toast.error('Failed to create wallet');
    } finally {
      setIsCreating(false);
    }
  };

  const handleImportWallet = async () => {
    if (!walletName.trim()) {
      toast.error('Please enter a wallet name');
      return;
    }

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    const words = importMnemonic.trim().split(/\s+/);
    if (words.length !== 12 && words.length !== 24) {
      toast.error('Recovery phrase must be 12 or 24 words');
      return;
    }

    try {
      setIsCreating(true);

      await importWallet({
        name: walletName.trim(),
        password,
        mnemonic: importMnemonic.trim()
      });

      toast.success('Wallet imported successfully!');
      navigate('/');
    } catch (error) {
      console.error('Failed to import wallet:', error);
      toast.error('Failed to import wallet. Please check your recovery phrase.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleVerifyMnemonic = () => {
    setIsVerifying(true);

    // Generate random verification challenge
    const shuffledWords = [...generatedMnemonic].sort(() => Math.random() - 0.5);
    const verificationWords = shuffledWords.slice(0, 3);
    setMnemonicVerification(verificationWords);
    setStep(4);

    setIsVerifying(false);
  };

  const handleFinishOnboarding = () => {
    toast.success(isImportFlow ? 'Wallet imported successfully!' : 'Wallet created successfully!');
    navigate('/');
  };

  const renderStep1 = () => (
    <Card padding="xl" className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ backgroundColor: 'var(--apple-blue)' }}
        >
          <Logo size="large" color="white" className="w-10 h-10" />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--apple-label)' }}
        >
          Welcome to Universal Wallet
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          style={{ color: 'var(--apple-secondary-label)' }}
        >
          Your secure Bitcoin wallet with Apple-inspired design
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="space-y-4"
      >
        <Button
          variant="primary"
          size="large"
          fullWidth
          leftIcon={<PlusIcon className="w-5 h-5" />}
          onClick={() => {
            setIsImportFlow(false);
            setStep(2);
          }}
        >
          Create New Wallet
        </Button>

        <Button
          variant="secondary"
          size="large"
          fullWidth
          leftIcon={<ImportIcon className="w-5 h-5" />}
          onClick={() => {
            setIsImportFlow(true);
            setStep(2);
          }}
        >
          Import Existing Wallet
        </Button>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="mt-8"
      >
        <div className="flex items-center justify-center space-x-4 mb-4">
          <FeatureItem icon={ShieldIcon} text="Enterprise Security" />
          <FeatureItem icon={KeyIcon} text="Your Keys" />
          <FeatureItem icon={LockIcon} text="Private by Design" />
        </div>
        <p className="text-xs text-center" style={{ color: 'var(--apple-tertiary-label)' }}>
          🔒 Secured with AES-256-GCM encryption
        </p>
      </motion.div>
    </Card>
  );

  const renderStep2 = () => (
    <Card padding="xl" className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: isImportFlow ? 'var(--apple-green)' : 'var(--apple-blue)' }}
        >
          {isImportFlow ? (
            <ImportIcon className="w-8 h-8 text-white" />
          ) : (
            <PlusIcon className="w-8 h-8 text-white" />
          )}
        </motion.div>
        <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--apple-label)' }}>
          {isImportFlow ? 'Import Your Wallet' : 'Create Your Wallet'}
        </h1>
        <p style={{ color: 'var(--apple-secondary-label)' }}>
          {isImportFlow
            ? 'Enter your recovery phrase and wallet details'
            : 'Choose a name and secure password for your wallet'
          }
        </p>
      </div>

      <div className="space-y-6">
        {isImportFlow && (
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
              Recovery Phrase
            </label>
            <textarea
              value={importMnemonic}
              onChange={(e) => setImportMnemonic(e.target.value)}
              placeholder="Enter your 12 or 24-word recovery phrase separated by spaces"
              rows={4}
              className="w-full p-4 rounded-xl border-0 resize-none"
              style={{
                backgroundColor: 'var(--apple-gray-6)',
                color: 'var(--apple-label)'
              }}
            />
            <p className="text-xs mt-1" style={{ color: 'var(--apple-secondary-label)' }}>
              Separate each word with a space. Case sensitive.
            </p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
            Wallet Name
          </label>
          <input
            type="text"
            value={walletName}
            onChange={(e) => setWalletName(e.target.value)}
            placeholder="My Bitcoin Wallet"
            className="w-full p-4 rounded-xl border-0"
            style={{
              backgroundColor: 'var(--apple-gray-6)',
              color: 'var(--apple-label)'
            }}
            maxLength={50}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter a strong password"
            className="w-full p-4 rounded-xl border-0"
            style={{
              backgroundColor: 'var(--apple-gray-6)',
              color: 'var(--apple-label)'
            }}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--apple-secondary-label)' }}>
            Minimum 8 characters required
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2" style={{ color: 'var(--apple-label)' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            className="w-full p-4 rounded-xl border-0"
            style={{
              backgroundColor: 'var(--apple-gray-6)',
              color: 'var(--apple-label)'
            }}
          />
        </div>

        <div className="flex space-x-4">
          <Button
            variant="secondary"
            size="large"
            fullWidth
            leftIcon={<BackIcon className="w-4 h-4" />}
            onClick={() => setStep(1)}
          >
            Back
          </Button>
          <Button
            variant="primary"
            size="large"
            fullWidth
            onClick={isImportFlow ? handleImportWallet : handleCreateWallet}
            loading={isCreating}
            disabled={
              !walletName.trim() ||
              password.length < 8 ||
              password !== confirmPassword ||
              (isImportFlow && !importMnemonic.trim())
            }
          >
            {isImportFlow ? 'Import Wallet' : 'Create Wallet'}
          </Button>
        </div>
      </div>
    </Card>
  );

  const renderStep3 = () => (
    <Card padding="xl" className="max-w-lg mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{ backgroundColor: 'var(--apple-green)' }}
        >
          <CheckIcon className="w-8 h-8 text-white" />
        </motion.div>
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-2"
          style={{ color: 'var(--apple-label)' }}
        >
          Wallet Created Successfully!
        </motion.h1>
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ color: 'var(--apple-secondary-label)' }}
        >
          Your recovery phrase has been generated. Keep it safe!
        </motion.p>
      </div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="rounded-2xl p-6 mb-6"
        style={{ backgroundColor: 'var(--apple-gray-6)' }}
      >
        <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
          Recovery Phrase
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {generatedMnemonic.map((word, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 + index * 0.05 }}
              className="rounded-xl p-3 text-center"
              style={{
                backgroundColor: 'white',
                border: '1px solid var(--apple-separator)'
              }}
            >
              <span
                className="text-xs block"
                style={{ color: 'var(--apple-tertiary-label)' }}
              >
                {index + 1}
              </span>
              <span
                className="font-medium"
                style={{ color: 'var(--apple-label)' }}
              >
                {word}
              </span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="rounded-2xl p-4 mb-6"
        style={{
          backgroundColor: 'var(--apple-yellow-light)',
          border: '1px solid var(--apple-yellow)'
        }}
      >
        <div className="flex items-start">
          <WarningIcon
            className="w-5 h-5 mt-0.5 mr-3 flex-shrink-0"
            style={{ color: 'var(--apple-orange)' }}
          />
          <div>
            <h4
              className="text-sm font-medium mb-1"
              style={{ color: 'var(--apple-label)' }}
            >
              Important Security Information
            </h4>
            <p
              className="text-sm"
              style={{ color: 'var(--apple-secondary-label)' }}
            >
              Write down your recovery phrase and store it safely. Anyone with access to this phrase can access your wallet.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        <Button
          variant="secondary"
          size="large"
          fullWidth
          leftIcon={<EyeIcon className="w-5 h-5" />}
          onClick={handleVerifyMnemonic}
          loading={isVerifying}
        >
          Verify Recovery Phrase
        </Button>

        <Button
          variant="primary"
          size="large"
          fullWidth
          leftIcon={<CheckIcon className="w-5 h-5" />}
          onClick={handleFinishOnboarding}
        >
          I've Saved My Recovery Phrase
        </Button>
      </motion.div>
    </Card>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--apple-system-background)' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full"
      >
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </motion.div>
    </div>
  );
};

// Helper Components
const FeatureItem: React.FC<{ icon: React.ComponentType<{ className: string }>, text: string }> = ({ icon: Icon, text }) => (
  <div className="flex flex-col items-center space-y-1">
    <div
      className="w-8 h-8 rounded-lg flex items-center justify-center"
      style={{ backgroundColor: 'var(--apple-gray-5)' }}
    >
      <Icon className="w-4 h-4" style={{ color: 'var(--apple-blue)' }} />
    </div>
    <span className="text-xs font-medium" style={{ color: 'var(--apple-secondary-label)' }}>
      {text}
    </span>
  </div>
);

// Icon components
const WalletIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const CheckIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const WarningIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const PlusIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

const ImportIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M13 13l3-3m0 0l-3-3m3 3H8" />
  </svg>
);

const BackIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const EyeIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ShieldIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const KeyIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const LockIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);