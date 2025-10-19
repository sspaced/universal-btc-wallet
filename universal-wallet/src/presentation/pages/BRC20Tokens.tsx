import React, { useState, useEffect } from 'react';
import { container, TYPES } from '../../shared/container/Container';
import { SimplicityService, BRC20Token, BRC20Balance } from '../../infrastructure/blockchain/SimplicityService';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { useWallet } from '../providers/WalletProvider';
import toast from 'react-hot-toast';

export const BRC20Tokens: React.FC = () => {
  const [tokens, setTokens] = useState<BRC20Token[]>([]);
  const [balances, setBalances] = useState<BRC20Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceAvailable, setServiceAvailable] = useState(false);
  const [selectedToken, setSelectedToken] = useState<BRC20Token | null>(null);

  const { currentWallet, accounts } = useWallet();
  const simplicityService = container.get<SimplicityService>(TYPES.SimplicityService);

  useEffect(() => {
    checkServiceAndLoadData();
  }, []);

  const checkServiceAndLoadData = async () => {
    setLoading(true);

    // Check if Simplicity service is available
    const available = await simplicityService.isServiceAvailable();
    setServiceAvailable(available);

    if (available) {
      await loadTokens();
      if (currentWallet && accounts.length > 0) {
        await loadBalances();
      }
    } else {
      toast.error('Simplicity indexer is not available. Please start the service.');
    }

    setLoading(false);
  };

  const loadTokens = async () => {
    const result = await simplicityService.getBRC20Tokens(20, 0);
    if (result.success) {
      setTokens(result.value);
    } else {
      toast.error('Failed to load BRC-20 tokens');
    }
  };

  const loadBalances = async () => {
    if (!accounts[0]) return;

    const address = accounts[0].getAddress().toString();
    const result = await simplicityService.getBRC20Balances(address);
    if (result.success) {
      setBalances(result.value);
    }
  };

  const refreshData = async () => {
    await checkServiceAndLoadData();
    toast.success('Data refreshed');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--apple-system-background)' }}>
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p style={{ color: 'var(--apple-secondary-label)' }}>Loading BRC-20 tokens...</p>
        </div>
      </div>
    );
  }

  if (!serviceAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: 'var(--apple-system-background)' }}>
        <Card padding="xl" className="max-w-md mx-auto text-center">
          <div className="mb-6">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--apple-orange)' }}>
              <WarningIcon className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--apple-label)' }}>
              Simplicity Service Unavailable
            </h2>
            <p style={{ color: 'var(--apple-secondary-label)' }}>
              The Simplicity BRC-20 indexer is not running. Please start the service to view BRC-20 tokens.
            </p>
          </div>

          <div className="space-y-4">
            <Button variant="primary" size="large" fullWidth onClick={checkServiceAndLoadData}>
              Retry Connection
            </Button>

            <div className="text-sm" style={{ color: 'var(--apple-tertiary-label)' }}>
              <p>To start Simplicity service:</p>
              <code className="block mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded">
                cd simplicity-backend && docker-compose up -d
              </code>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4" style={{ backgroundColor: 'var(--apple-system-background)' }}>
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl font-bold" style={{ color: 'var(--apple-label)' }}>
              BRC-20 Tokens
            </h1>
            <Button variant="secondary" size="medium" onClick={refreshData}>
              Refresh
            </Button>
          </div>
          <p style={{ color: 'var(--apple-secondary-label)' }}>
            Universal Protocol BRC-20 tokens powered by Simplicity
          </p>
        </div>

        {/* User Balances */}
        {currentWallet && balances.length > 0 && (
          <Card padding="lg" className="mb-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
              Your BRC-20 Balances
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {balances.map((balance) => (
                <div
                  key={balance.tick}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--apple-gray-6)' }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold" style={{ color: 'var(--apple-label)' }}>
                      {balance.tick}
                    </span>
                    <span className="text-sm" style={{ color: 'var(--apple-secondary-label)' }}>
                      Total: {balance.total}
                    </span>
                  </div>
                  <div className="text-sm space-y-1">
                    <div style={{ color: 'var(--apple-secondary-label)' }}>
                      Available: {balance.available}
                    </div>
                    <div style={{ color: 'var(--apple-secondary-label)' }}>
                      Transferable: {balance.transferable}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* All Tokens */}
        <Card padding="lg">
          <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--apple-label)' }}>
            All BRC-20 Tokens
          </h3>

          {tokens.length === 0 ? (
            <div className="text-center py-8">
              <p style={{ color: 'var(--apple-secondary-label)' }}>
                No BRC-20 tokens found
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {tokens.map((token) => (
                <div
                  key={token.tick}
                  className="p-4 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: selectedToken?.tick === token.tick
                      ? 'var(--apple-blue)'
                      : 'var(--apple-gray-6)'
                  }}
                  onClick={() => setSelectedToken(selectedToken?.tick === token.tick ? null : token)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold" style={{
                        color: selectedToken?.tick === token.tick ? 'white' : 'var(--apple-label)'
                      }}>
                        {token.tick}
                      </h4>
                      <p className="text-sm" style={{
                        color: selectedToken?.tick === token.tick
                          ? 'rgba(255, 255, 255, 0.8)'
                          : 'var(--apple-secondary-label)'
                      }}>
                        Supply: {token.totalSupply} | Deployer: {token.deployer.slice(0, 10)}...
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm" style={{
                        color: selectedToken?.tick === token.tick
                          ? 'rgba(255, 255, 255, 0.8)'
                          : 'var(--apple-secondary-label)'
                      }}>
                        Block #{token.deployHeight}
                      </div>
                      <div className={`inline-block px-2 py-1 rounded text-xs ${
                        token.mintable
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {token.mintable ? 'Mintable' : 'Complete'}
                      </div>
                    </div>
                  </div>

                  {selectedToken?.tick === token.tick && (
                    <div className="mt-4 pt-4 border-t border-white/20">
                      <div className="grid md:grid-cols-2 gap-4 text-sm text-white/90">
                        <div>
                          <strong>Deploy Time:</strong> {new Date(token.deployTime).toLocaleDateString()}
                        </div>
                        <div>
                          <strong>Decimals:</strong> {token.decimals}
                        </div>
                        <div className="md:col-span-2">
                          <strong>Deployer:</strong> {token.deployer}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Warning Icon Component
const WarningIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);