import React, { createContext, useContext, useEffect, useState } from 'react';

interface SecurityContextType {
  isSecure: boolean;
  isAuthenticated: boolean;
  sessionId: string | null;
  authenticate: (password: string) => Promise<boolean>;
  logout: () => void;
  checkSecurityStatus: () => void;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurity = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider: React.FC<SecurityProviderProps> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    initializeSecurity();
  }, []);

  const initializeSecurity = async () => {
    try {
      // Check if we're running in a secure context
      const isSecureContext = window.isSecureContext || location.protocol === 'https:' || location.hostname === 'localhost';
      setIsSecure(isSecureContext);

      // Check for existing session
      const storedSessionId = sessionStorage.getItem('universal-wallet-session');
      if (storedSessionId) {
        const isValidSession = await validateSession(storedSessionId);
        if (isValidSession) {
          setSessionId(storedSessionId);
          setIsAuthenticated(true);
        } else {
          sessionStorage.removeItem('universal-wallet-session');
        }
      }

      // Set up security monitoring
      setupSecurityMonitoring();
    } catch (error) {
      console.error('Security initialization failed:', error);
      setIsSecure(false);
    }
  };

  const validateSession = async (sessionId: string): Promise<boolean> => {
    try {
      // In a real implementation, this would validate the session with the backend
      // For now, we'll do a basic check
      const sessionData = JSON.parse(atob(sessionId.split('.')[1] || '{}'));
      const now = Date.now();
      return sessionData.exp > now;
    } catch {
      return false;
    }
  };

  const authenticate = async (password: string): Promise<boolean> => {
    try {
      // In a real implementation, this would authenticate with the security service
      // For demo purposes, we'll simulate authentication
      if (password.length >= 8) {
        const newSessionId = generateSessionId();
        setSessionId(newSessionId);
        setIsAuthenticated(true);
        sessionStorage.setItem('universal-wallet-session', newSessionId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication failed:', error);
      return false;
    }
  };

  const logout = () => {
    setSessionId(null);
    setIsAuthenticated(false);
    sessionStorage.removeItem('universal-wallet-session');

    // Clear other sensitive data
    localStorage.removeItem('universal-wallet-temp-data');
  };

  const checkSecurityStatus = () => {
    // Perform security checks
    const checks = [
      window.isSecureContext,
      !window.opener, // Check if opened by another window
      document.referrer === '' || new URL(document.referrer).origin === window.location.origin,
    ];

    const allChecksPassed = checks.every(check => check);
    setIsSecure(allChecksPassed);

    if (!allChecksPassed) {
      console.warn('Security checks failed');
      logout();
    }
  };

  const generateSessionId = (): string => {
    const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
    const payload = btoa(JSON.stringify({
      iat: Date.now(),
      exp: Date.now() + (15 * 60 * 1000), // 15 minutes
      sub: 'universal-wallet-user'
    }));
    const signature = btoa(crypto.getRandomValues(new Uint8Array(32)).toString());
    return `${header}.${payload}.${signature}`;
  };

  const setupSecurityMonitoring = () => {
    // Monitor for suspicious activity
    let clickCount = 0;
    let keyCount = 0;

    const resetCounters = () => {
      clickCount = 0;
      keyCount = 0;
    };

    // Reset counters every minute
    setInterval(resetCounters, 60000);

    document.addEventListener('click', () => {
      clickCount++;
      if (clickCount > 100) { // Suspicious rapid clicking
        console.warn('Suspicious activity detected');
        checkSecurityStatus();
      }
    });

    document.addEventListener('keydown', () => {
      keyCount++;
      if (keyCount > 200) { // Suspicious rapid typing
        console.warn('Suspicious activity detected');
        checkSecurityStatus();
      }
    });

    // Monitor for dev tools
    let devtools = false;
    const detectDevTools = () => {
      if (window.outerHeight - window.innerHeight > 200 || window.outerWidth - window.innerWidth > 200) {
        if (!devtools) {
          devtools = true;
          console.warn('Developer tools detected');
        }
      } else {
        devtools = false;
      }
    };

    setInterval(detectDevTools, 500);

    // Monitor for copy/paste of sensitive data
    document.addEventListener('copy', (e) => {
      const selection = window.getSelection()?.toString();
      if (selection && (selection.includes('bitcoin') || selection.length > 50)) {
        console.warn('Copying potentially sensitive data');
      }
    });
  };

  const value: SecurityContextType = {
    isSecure,
    isAuthenticated,
    sessionId,
    authenticate,
    logout,
    checkSecurityStatus,
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};