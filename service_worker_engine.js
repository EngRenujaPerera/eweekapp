// ==========================================================================
// FILE: sw.js (E-WEEK 2026 Progressive Web Push & Background Sync Worker)
// ==========================================================================

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for Web Push payloads triggered by committee broadcasts
self.addEventListener('push', (event) => {
  let payload = {
    title: 'E-WEEK 2026 Alert',
    body: 'New tournament announcement released!',
    icon: 'logo.png',
    badge: 'logo.png',
    data: { url: './' }
  };

  if (event.data) {
    try {
      payload = Object.assign(payload, event.data.json());
    } catch (e) {
      payload.body = event.data.text();
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon || 'logo.png',
    badge: payload.badge || 'logo.png',
    vibrate: [100, 50, 100],
    data: payload.data || { url: './' },
    actions: [
      { action: 'open_notices', title: 'View Notices' },
      { action: 'dismiss', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// Handle clicking on system notification
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus open portal or open a new window
      for (let client of windowClients) {
        if ('focus' in client) {
          client.postMessage({ action: 'open_announcements' });
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow('./#announcements');
      }
    })
  );
});