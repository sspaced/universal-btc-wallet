// Content Script for Universal Wallet Extension

// Bitcoin address detection regex
const bitcoinAddressRegex = /\b(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}\b/g;

// Security: Prevent content script injection attacks
if (window.top === window.self) {
  console.log('Universal Wallet content script loaded');

  // Detect Bitcoin addresses on the page
  function detectBitcoinAddresses() {
    const textNodes = getTextNodes(document.body);
    const addresses: string[] = [];

    textNodes.forEach(node => {
      const matches = node.textContent?.match(bitcoinAddressRegex);
      if (matches) {
        addresses.push(...matches);
      }
    });

    return [...new Set(addresses)]; // Remove duplicates
  }

  // Get all text nodes in an element
  function getTextNodes(element: Element): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // Skip script and style elements
          const parent = node.parentElement;
          if (parent && ['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push(node as Text);
    }

    return textNodes;
  }

  // Add visual indicators for Bitcoin addresses
  function highlightBitcoinAddresses() {
    const addresses = detectBitcoinAddresses();

    if (addresses.length > 0) {
      console.log(`Found ${addresses.length} Bitcoin addresses on page`);

      // Notify background script
      chrome.runtime.sendMessage({
        type: 'BITCOIN_ADDRESSES_DETECTED',
        data: { count: addresses.length, addresses }
      });
    }
  }

  // Security: Monitor for clipboard access
  function monitorClipboardAccess() {
    let clipboardAccessCount = 0;

    const originalReadText = navigator.clipboard.readText;
    navigator.clipboard.readText = async function() {
      clipboardAccessCount++;

      if (clipboardAccessCount > 5) {
        // Suspicious clipboard access
        chrome.runtime.sendMessage({
          type: 'SECURITY_ALERT',
          data: {
            message: 'Excessive clipboard access detected',
            domain: window.location.hostname,
            count: clipboardAccessCount
          }
        });
      }

      return originalReadText.call(this);
    };
  }

  // Security: Monitor for keylogger attempts
  function monitorKeyboardEvents() {
    let keyEventCount = 0;
    let lastKeyTime = Date.now();

    document.addEventListener('keydown', () => {
      const now = Date.now();

      if (now - lastKeyTime < 50) { // Very fast typing
        keyEventCount++;
      } else {
        keyEventCount = 0;
      }

      if (keyEventCount > 20) {
        chrome.runtime.sendMessage({
          type: 'SECURITY_ALERT',
          data: {
            message: 'Possible keylogger detected',
            domain: window.location.hostname
          }
        });
      }

      lastKeyTime = now;
    });
  }

  // Security: Detect potential phishing
  function detectPhishing() {
    const suspiciousTexts = [
      'enter your private key',
      'input your seed phrase',
      'wallet recovery',
      'urgent: verify your wallet',
      'suspended account',
      'click here to claim'
    ];

    const pageText = document.body.textContent?.toLowerCase() || '';

    for (const suspiciousText of suspiciousTexts) {
      if (pageText.includes(suspiciousText)) {
        chrome.runtime.sendMessage({
          type: 'SECURITY_ALERT',
          data: {
            message: `Potential phishing detected: "${suspiciousText}"`,
            domain: window.location.hostname
          }
        });
        break;
      }
    }
  }

  // Inject wallet interaction interface for compatible dApps
  function injectWalletInterface() {
    // Only inject on HTTPS sites
    if (window.location.protocol !== 'https:') {
      return;
    }

    // Simple wallet interface for web3 compatibility
    const walletInterface = {
      isUniversalWallet: true,
      isConnected: false,

      async connect() {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: 'CONNECT_REQUEST', origin: window.location.origin },
            (response) => {
              if (response?.success) {
                this.isConnected = true;
                resolve(response.accounts);
              } else {
                reject(new Error('Connection rejected'));
              }
            }
          );
        });
      },

      async getAccounts() {
        if (!this.isConnected) {
          return [];
        }

        return new Promise((resolve) => {
          chrome.runtime.sendMessage(
            { type: 'GET_ACCOUNTS' },
            (response) => {
              resolve(response?.accounts || []);
            }
          );
        });
      },

      async signMessage(message: string) {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: 'SIGN_MESSAGE', message },
            (response) => {
              if (response?.success) {
                resolve(response.signature);
              } else {
                reject(new Error('Signing rejected'));
              }
            }
          );
        });
      },

      async sendBitcoin(to: string, amount: number) {
        return new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(
            { type: 'SEND_BITCOIN', to, amount },
            (response) => {
              if (response?.success) {
                resolve(response.txHash);
              } else {
                reject(new Error('Transaction failed'));
              }
            }
          );
        });
      }
    };

    // Make interface available to the page
    Object.defineProperty(window, 'universalWallet', {
      value: walletInterface,
      writable: false,
      configurable: false
    });

    // Dispatch custom event to notify dApps
    window.dispatchEvent(new CustomEvent('universalWalletReady', {
      detail: { wallet: walletInterface }
    }));
  }

  // Initialize content script
  function initialize() {
    try {
      // Security monitoring
      monitorClipboardAccess();
      monitorKeyboardEvents();

      // Detection
      detectPhishing();
      highlightBitcoinAddresses();

      // dApp integration
      injectWalletInterface();

      // Re-scan for addresses when page content changes
      const observer = new MutationObserver(() => {
        highlightBitcoinAddresses();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      console.log('Universal Wallet content script initialized');

    } catch (error) {
      console.error('Content script initialization failed:', error);
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialize);
  } else {
    initialize();
  }

  // Handle page visibility changes for security
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      // Page is hidden, update activity
      chrome.runtime.sendMessage({ type: 'UPDATE_ACTIVITY' });
    }
  });
}