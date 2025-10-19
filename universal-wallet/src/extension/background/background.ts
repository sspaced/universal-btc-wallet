// Chrome Extension Background Script (Service Worker)

// Install event
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Universal Wallet Extension installed', details);

  // Set up default settings
  chrome.storage.local.set({
    version: chrome.runtime.getManifest().version,
    installedAt: Date.now(),
    settings: {
      autoLock: true,
      lockTimeout: 15, // minutes
      network: 'mainnet',
      notifications: true
    }
  });

  // Create context menu for Bitcoin addresses
  chrome.contextMenus.create({
    id: 'send-bitcoin',
    title: 'Send Bitcoin to %s',
    contexts: ['selection'],
    documentUrlPatterns: ['<all_urls>']
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'send-bitcoin' && info.selectionText) {
    // Validate if selection is a Bitcoin address
    const bitcoinAddressRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;

    if (bitcoinAddressRegex.test(info.selectionText.trim())) {
      // Open popup with pre-filled address
      chrome.action.openPopup();

      // Store the address for the popup to use
      chrome.storage.local.set({
        pendingSendAddress: info.selectionText.trim()
      });
    }
  }
});

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Background received message:', message);

  switch (message.type) {
    case 'GET_WALLET_STATUS':
      // Check if wallet is unlocked
      chrome.storage.local.get(['isUnlocked', 'lastActivity'], (result) => {
        const now = Date.now();
        const lockTimeout = 15 * 60 * 1000; // 15 minutes

        const isUnlocked = result.isUnlocked &&
          result.lastActivity &&
          (now - result.lastActivity) < lockTimeout;

        sendResponse({ isUnlocked });
      });
      return true; // Keep message channel open for async response

    case 'LOCK_WALLET':
      chrome.storage.local.set({
        isUnlocked: false,
        lastActivity: null
      });
      sendResponse({ success: true });
      break;

    case 'UNLOCK_WALLET':
      chrome.storage.local.set({
        isUnlocked: true,
        lastActivity: Date.now()
      });
      sendResponse({ success: true });
      break;

    case 'UPDATE_ACTIVITY':
      chrome.storage.local.set({
        lastActivity: Date.now()
      });
      sendResponse({ success: true });
      break;

    case 'SECURITY_ALERT':
      // Handle security alerts
      console.warn('Security alert:', message.data);

      // Show notification
      chrome.notifications.create({
        type: 'basic',
        iconUrl: '/icons/icon-128.png',
        title: 'Universal Wallet Security Alert',
        message: message.data.message || 'Suspicious activity detected'
      });
      break;

    default:
      console.warn('Unknown message type:', message.type);
  }
});

// Periodic cleanup and security checks
chrome.alarms.create('security-check', { delayInMinutes: 1, periodInMinutes: 5 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'security-check') {
    performSecurityCheck();
  }
});

async function performSecurityCheck() {
  try {
    // Check for auto-lock timeout
    const result = await chrome.storage.local.get(['isUnlocked', 'lastActivity', 'settings']);

    if (result.isUnlocked && result.lastActivity) {
      const now = Date.now();
      const lockTimeout = (result.settings?.lockTimeout || 15) * 60 * 1000;

      if (now - result.lastActivity > lockTimeout) {
        // Auto-lock wallet
        await chrome.storage.local.set({
          isUnlocked: false,
          lastActivity: null
        });

        console.log('Wallet auto-locked due to inactivity');
      }
    }

    // Clear any temporary data
    await chrome.storage.local.remove(['pendingSendAddress', 'tempData']);

  } catch (error) {
    console.error('Security check failed:', error);
  }
}

// Handle browser action (extension icon) clicks
chrome.action.onClicked.addListener((tab) => {
  // This will open the popup automatically
  console.log('Extension icon clicked on tab:', tab.id);
});

// Monitor for suspicious tab changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // Check for known phishing domains
    const suspiciousDomains = [
      'bit.ly',
      'tinyurl.com',
      'goo.gl'
    ];

    const hostname = new URL(tab.url).hostname;

    if (suspiciousDomains.some(domain => hostname.includes(domain))) {
      console.warn('Suspicious domain detected:', hostname);

      // Could implement phishing protection here
    }
  }
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('Universal Wallet Extension started');
  performSecurityCheck();
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { performSecurityCheck };
}