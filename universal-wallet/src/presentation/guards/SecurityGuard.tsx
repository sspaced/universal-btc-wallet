import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useSecurity } from '../providers/SecurityProvider';

interface SecurityGuardProps {
  children: React.ReactNode;
  isInitialized: boolean;
}

export const SecurityGuard: React.FC<SecurityGuardProps> = ({ children, isInitialized }) => {
  const { isSecure, checkSecurityStatus } = useSecurity();
  const [securityError, setSecurityError] = useState<string | null>(null);

  useEffect(() => {
    if (isInitialized) {
      performSecurityChecks();
    }
  }, [isInitialized]);

  const performSecurityChecks = () => {
    const errors: string[] = [];

    // Check if running in secure context
    if (!window.isSecureContext && location.hostname !== 'localhost') {
      errors.push('Application must be served over HTTPS');
    }

    // Check for required browser features
    if (!window.crypto || !window.crypto.subtle) {
      errors.push('Web Crypto API not available');
    }

    if (!window.localStorage) {
      errors.push('Local Storage not available');
    }

    if (!window.sessionStorage) {
      errors.push('Session Storage not available');
    }

    // Check for suspicious environment
    if (window.opener && window.opener !== window) {
      errors.push('Application opened in suspicious context');
    }

    // Check User Agent for known security issues
    const userAgent = navigator.userAgent;
    if (userAgent.includes('PhantomJS') || userAgent.includes('SlimerJS')) {
      errors.push('Automated browser detected');
    }

    if (errors.length > 0) {
      setSecurityError(errors[0]);
      return;
    }

    // All checks passed
    setSecurityError(null);
    checkSecurityStatus();
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Initializing security...</p>
        </motion.div>
      </div>
    );
  }

  if (securityError) {
    return (
      <div className="min-h-screen bg-red-50 dark:bg-red-900/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center"
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <SecurityAlertIcon className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Security Error
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {securityError}
          </p>

          <div className="space-y-3">
            <button
              onClick={performSecurityChecks}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry Security Check
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              For your security, this application requires a secure environment
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!isSecure) {
    return (
      <div className="min-h-screen bg-yellow-50 dark:bg-yellow-900/20 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 text-center"
        >
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <SecurityWarningIcon className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>

          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            Insecure Environment
          </h1>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This application requires a secure HTTPS connection to protect your financial data.
          </p>

          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              Reload Application
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              Please access this application via HTTPS
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
};

// Icon components
const SecurityAlertIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
  </svg>
);

const SecurityWarningIcon: React.FC<{ className: string }> = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016zM12 9v2m0 4h.01" />
  </svg>
);