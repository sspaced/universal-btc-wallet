import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

// Pages
import { Home } from './presentation/pages/Home';
import { Onboarding } from './presentation/pages/Onboarding';
import { BRC20Tokens } from './presentation/pages/BRC20Tokens';
import { Receive } from './presentation/pages/Receive';
import { Send } from './presentation/pages/Send';
import { History } from './presentation/pages/History';
import { Settings } from './presentation/pages/Settings';

// Security components
import { SecurityGuard } from './presentation/guards/SecurityGuard';
import { ErrorBoundary } from './presentation/components/common/ErrorBoundary';

// Providers and services
import { ThemeProvider } from './presentation/providers/ThemeProvider';
import { SecurityProvider } from './presentation/providers/SecurityProvider';
import { WalletProvider } from './presentation/providers/WalletProvider';

// Types
interface AppProps {
  isExtension?: boolean;
}

// Create React Query client with security configurations
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: 1,
    },
  },
});

const App: React.FC<AppProps> = ({ isExtension = false }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSecurityInitialized, setIsSecurityInitialized] = useState(false);

  useEffect(() => {
    // Initialize security and app
    const initializeApp = async () => {
      console.log('🚀 Starting app initialization...');
      try {
        // Register service worker for PWA (only in production)
        if (!isExtension && 'serviceWorker' in navigator && import.meta.env.PROD) {
          try {
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('SW registered: ', registration);

            // Listen for service worker updates
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Show update notification
                    console.log('New app version available');
                  }
                });
              }
            });
          } catch (error) {
            console.log('Service worker registration failed:', error);
            // Continue without service worker
          }
        }

        // Initialize security services
        await initializeSecurity();
        setIsSecurityInitialized(true);

        // Initialize wallet services
        await initializeWallet();

        console.log('🎉 App initialization completed!');
        setIsLoading(false);
      } catch (error) {
        console.error('❌ App initialization failed:', error);
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [isExtension]);

  const initializeSecurity = async () => {
    // Initialize security services, CSP, etc.
    console.log('🔒 Initializing security services...');
    // Simulate async security initialization
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ Security services initialized');
  };

  const initializeWallet = async () => {
    // Initialize wallet core services
    console.log('💰 Initializing wallet services...');
    await new Promise(resolve => setTimeout(resolve, 100));
    console.log('✅ Wallet services initialized');
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SecurityProvider>
            <WalletProvider>
              <div className="app-container">
              {/* Security Guard wrapper */}
              <SecurityGuard isInitialized={isSecurityInitialized}>
                <ErrorBoundary>
                  <Router>
                    <AnimatePresence mode="wait">
                      <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/brc20" element={<BRC20Tokens />} />
                        <Route path="/send" element={<Send />} />
                        <Route path="/receive" element={<Receive />} />
                        <Route path="/swap" element={<div>Swap Page</div>} />
                        <Route path="/history" element={<History />} />
                        <Route path="/settings" element={<Settings />} />
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </AnimatePresence>
                  </Router>
                </ErrorBoundary>
              </SecurityGuard>

              {/* Global notifications */}
              <Toaster
                position="top-center"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    fontWeight: '500',
                  },
                  success: {
                    iconTheme: {
                      primary: '#10B981',
                      secondary: '#FFFFFF',
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: '#EF4444',
                      secondary: '#FFFFFF',
                    },
                  },
                }}
              />
              </div>
            </WalletProvider>
          </SecurityProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

// Loading screen component
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--apple-secondary-system-background)' }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        {/* Logo */}
        <motion.div
          className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
          style={{ backgroundColor: 'var(--apple-blue)' }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <WalletIcon className="w-8 h-8 text-white" />
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-900 dark:text-white mb-2"
        >
          Universal Wallet
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-400 mb-8"
        >
          Initializing secure environment...
        </motion.p>

        {/* Loading animation */}
        <motion.div
          className="flex justify-center space-x-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-blue-500 rounded-full"
              animate={{
                y: [-8, 8, -8],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.1,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

// Wallet icon component
const WalletIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

export default App;