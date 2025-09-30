// Popup script for Universal Wallet Extension

document.addEventListener('DOMContentLoaded', async () => {
  console.log('Universal Wallet popup loaded');

  const loading = document.getElementById('loading');
  const mainContent = document.getElementById('main-content');
  const balanceElement = document.getElementById('balance');
  const balanceUsdElement = document.getElementById('balance-usd');

  // Initialize popup
  try {
    await initializePopup();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
    showError('Failed to load wallet');
  }

  async function initializePopup() {
    // Check wallet status
    const status = await checkWalletStatus();

    if (!status.isUnlocked) {
      // Show unlock screen
      showUnlockScreen();
      return;
    }

    // Load wallet data
    await loadWalletData();

    // Show main interface
    loading.classList.add('hidden');
    mainContent.classList.remove('hidden');

    // Set up event listeners
    setupEventListeners();
  }

  function checkWalletStatus() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { type: 'GET_WALLET_STATUS' },
        (response) => {
          resolve(response || { isUnlocked: false });
        }
      );
    });
  }

  async function loadWalletData() {
    try {
      // Mock data for now - in real implementation, this would come from storage
      const mockData = {
        balance: '0.25000000',
        balanceUsd: '12,500.00',
        transactions: [
          { type: 'Received', amount: '+0.05 BTC', timestamp: Date.now() - 86400000 },
          { type: 'Sent', amount: '-0.01 BTC', timestamp: Date.now() - 172800000 }
        ]
      };

      // Update UI
      balanceElement.textContent = `${mockData.balance} BTC`;
      balanceUsdElement.textContent = `$${mockData.balanceUsd} USD`;

      // Update transactions
      updateTransactionsList(mockData.transactions);

    } catch (error) {
      console.error('Failed to load wallet data:', error);
      showError('Failed to load wallet data');
    }
  }

  function updateTransactionsList(transactions) {
    const transactionsList = document.getElementById('transactions-list');

    if (transactions.length === 0) {
      transactionsList.innerHTML = '<div style="text-align: center; opacity: 0.7; padding: 20px;">No transactions yet</div>';
      return;
    }

    transactionsList.innerHTML = transactions.map(tx => `
      <div class="transaction-item">
        <div class="transaction-type">${tx.type}</div>
        <div class="transaction-amount">${tx.amount}</div>
      </div>
    `).join('');
  }

  function setupEventListeners() {
    // Send button
    document.getElementById('send-btn').addEventListener('click', () => {
      openFullWallet('/send');
    });

    // Receive button
    document.getElementById('receive-btn').addEventListener('click', () => {
      openFullWallet('/receive');
    });

    // Swap button
    document.getElementById('swap-btn').addEventListener('click', () => {
      openFullWallet('/swap');
    });

    // History button
    document.getElementById('history-btn').addEventListener('click', () => {
      openFullWallet('/history');
    });

    // Settings button
    document.getElementById('settings-btn').addEventListener('click', () => {
      openFullWallet('/settings');
    });
  }

  function openFullWallet(path = '/') {
    const extensionId = chrome.runtime.id;
    const url = `chrome-extension://${extensionId}/index.html${path}`;

    chrome.tabs.create({ url });
    window.close();
  }

  function showUnlockScreen() {
    const unlockHTML = `
      <div style="padding: 40px 20px; text-align: center; height: 100%; background: var(--system-background); display: flex; flex-direction: column; justify-content: center;">
        <div class="logo" style="margin: 0 auto 20px; background: var(--apple-blue); color: white;">🔒</div>
        <h2 style="margin-bottom: 16px; color: #000000; font-weight: 600;">Wallet Locked</h2>
        <p style="margin-bottom: 24px; color: var(--apple-gray);">Enter your password to unlock</p>

        <div style="margin-bottom: 20px;">
          <input
            type="password"
            id="unlock-password"
            placeholder="Enter password"
            style="width: 100%; padding: 12px; border: 1px solid var(--secondary-system-background); border-radius: 8px; background: var(--system-background); color: #000000; font-size: 16px; font-family: inherit;"
          />
        </div>

        <button
          id="unlock-btn"
          style="width: 100%; padding: 12px; border: none; border-radius: 8px; background: var(--apple-blue); color: white; font-weight: 500; cursor: pointer; margin-bottom: 16px; font-size: 16px;"
        >
          Unlock Wallet
        </button>

        <div style="font-size: 12px;">
          <a href="#" id="forgot-password" style="color: var(--apple-blue); text-decoration: none;">Forgot password?</a>
        </div>
      </div>
    `;

    document.body.innerHTML = unlockHTML;

    // Set up unlock functionality
    const passwordInput = document.getElementById('unlock-password');
    const unlockBtn = document.getElementById('unlock-btn');

    unlockBtn.addEventListener('click', async () => {
      const password = passwordInput.value;

      if (!password) {
        showError('Please enter your password');
        return;
      }

      try {
        unlockBtn.textContent = 'Unlocking...';
        unlockBtn.disabled = true;

        // Simulate password validation (in real implementation, this would be secure)
        await new Promise(resolve => setTimeout(resolve, 500));

        if (password.length >= 8) { // Simple validation for demo
          chrome.runtime.sendMessage({ type: 'UNLOCK_WALLET' });

          // Reload popup
          window.location.reload();
        } else {
          showError('Invalid password');
          unlockBtn.textContent = 'Unlock Wallet';
          unlockBtn.disabled = false;
        }

      } catch (error) {
        console.error('Unlock failed:', error);
        showError('Unlock failed');
        unlockBtn.textContent = 'Unlock Wallet';
        unlockBtn.disabled = false;
      }
    });

    // Enter key support
    passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        unlockBtn.click();
      }
    });

    // Focus password input
    passwordInput.focus();

    // Forgot password
    document.getElementById('forgot-password').addEventListener('click', (e) => {
      e.preventDefault();
      openFullWallet('/recovery');
    });
  }

  function showError(message) {
    // Apple-style error display
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      right: 20px;
      background: var(--apple-red);
      color: white;
      padding: 12px;
      border-radius: 8px;
      text-align: center;
      z-index: 1000;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(255, 59, 48, 0.3);
    `;
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 3000);
  }

  // Check for pending send address (from context menu)
  chrome.storage.local.get(['pendingSendAddress'], (result) => {
    if (result.pendingSendAddress) {
      // Open send page with pre-filled address
      openFullWallet(`/send?to=${encodeURIComponent(result.pendingSendAddress)}`);

      // Clear the pending address
      chrome.storage.local.remove(['pendingSendAddress']);
    }
  });

  // Update activity timestamp
  chrome.runtime.sendMessage({ type: 'UPDATE_ACTIVITY' });
});