import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';

// Check if running as Chrome extension
const isExtension = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id;

// Debug logging
console.log('🚀 main.tsx loading...');
console.log('Document ready state:', document.readyState);

// Initialize React app
const container = document.getElementById('root');
console.log('Root container found:', !!container);

if (!container) {
  console.error('❌ Root element not found!');
  throw new Error('Root element not found');
}

console.log('✅ Creating React root...');
const root = createRoot(container);

console.log('✅ Rendering Universal Wallet App...');
root.render(
  <React.StrictMode>
    <App isExtension={isExtension} />
  </React.StrictMode>
);

console.log('✅ React app mounted!');

// Register service worker for PWA (only if not in extension)
if (!isExtension && 'serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('SW registered: ', registration);

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed') {
              if (navigator.serviceWorker.controller) {
                console.log('New content available; please refresh.');
              } else {
                console.log('Content cached for offline use.');
              }
            }
          });
        }
      });
    } catch (error) {
      console.log('SW registration failed: ', error);
    }
  });
}

// Security: Remove any potential XSS vectors
if (import.meta.env.PROD) {
  // Disable console in production
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

// Security: Detect and prevent common attacks
document.addEventListener('DOMContentLoaded', () => {
  // Prevent drag and drop to avoid file-based attacks
  document.addEventListener('dragover', (e) => e.preventDefault());
  document.addEventListener('drop', (e) => e.preventDefault());

  // Prevent right-click in production
  if (import.meta.env.PROD) {
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  }
});

// Export for potential extension usage
if (isExtension) {
  (window as any).UniversalWallet = { App };
}