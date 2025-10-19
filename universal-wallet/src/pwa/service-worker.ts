/// <reference lib="webworker" />

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { BackgroundSync } from 'workbox-background-sync';
import { Queue } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope;

// Security headers for all responses
const SECURITY_HEADERS = {
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://blockstream.info https://mempool.space https://api.opi.network;",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin'
};

// Precache and route
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Cache strategies
const staleWhileRevalidate = new StaleWhileRevalidate({
  cacheName: 'universal-wallet-cache',
  plugins: [{
    cacheWillUpdate: async ({ response }) => {
      return response.status === 200 ? response : null;
    },
    cacheDidUpdate: async ({ cacheName, request, oldResponse, newResponse }) => {
      console.log(`Cache updated for ${request.url}`);
    }
  }]
});

const cacheFirst = new CacheFirst({
  cacheName: 'universal-wallet-assets',
  plugins: [{
    cacheWillUpdate: async ({ response }) => {
      return response.status === 200 ? response : null;
    }
  }]
});

const networkFirst = new NetworkFirst({
  cacheName: 'universal-wallet-api',
  networkTimeoutSeconds: 3,
  plugins: [{
    cacheWillUpdate: async ({ response }) => {
      return response.status === 200 ? response : null;
    }
  }]
});

// Background sync for transactions
const bgSyncQueue = new Queue('transaction-queue', {
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('Transaction synced successfully');
      } catch (error) {
        console.error('Transaction sync failed:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  }
});

// Route handlers
registerRoute(
  ({ request }) => request.destination === 'document',
  staleWhileRevalidate
);

registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  cacheFirst
);

registerRoute(
  ({ request }) => request.destination === 'image',
  cacheFirst
);

// API routes with network first strategy
registerRoute(
  ({ url }) =>
    url.hostname === 'blockstream.info' ||
    url.hostname === 'mempool.space' ||
    url.hostname === 'api.opi.network',
  networkFirst
);

// Transaction API with background sync
registerRoute(
  ({ url, request }) =>
    url.pathname.includes('/api/transactions') &&
    request.method === 'POST',
  async ({ event }) => {
    try {
      const response = await fetch(event.request);
      return response;
    } catch (error) {
      await bgSyncQueue.pushRequest({ request: event.request });
      return new Response(
        JSON.stringify({ error: 'Transaction queued for retry' }),
        {
          status: 202,
          statusText: 'Accepted',
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
);

// Security enhancement: Add security headers to all responses
self.addEventListener('fetch', (event) => {
  // Skip non-HTTP requests
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    fetch(event.request).then((response) => {
      // Clone the response to add headers
      const newResponse = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
          ...Object.fromEntries(response.headers),
          ...SECURITY_HEADERS
        }
      });
      return newResponse;
    }).catch((error) => {
      console.error('Fetch failed:', error);
      // Return a fallback response for critical routes
      if (event.request.mode === 'navigate') {
        return caches.match('/offline.html') || new Response('Offline');
      }
      throw error;
    })
  );
});

// App update notification
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push notifications for transactions
self.addEventListener('push', (event) => {
  const options = {
    body: 'You have a new transaction',
    icon: '/icons/icon-192.png',
    badge: '/icons/badge-72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Universal Wallet', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('/transactions')
    );
  } else if (event.action === 'close') {
    // Just close the notification
  } else {
    // Default action: open the app
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Periodic background sync for balance updates
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'balance-sync') {
    event.waitUntil(syncBalance());
  }
});

async function syncBalance() {
  try {
    // Sync wallet balance in background
    const response = await fetch('/api/balance');
    if (response.ok) {
      const data = await response.json();

      // Send message to all clients
      const clients = await self.clients.matchAll();
      clients.forEach(client => {
        client.postMessage({
          type: 'BALANCE_UPDATED',
          data
        });
      });
    }
  } catch (error) {
    console.error('Background balance sync failed:', error);
  }
}

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});