// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyBeNDfEqIPunqPDHEM2H-8j39ANWqSEkos',
  authDomain: 'vie-publique.firebaseapp.com',
  projectId: 'vie-publique',
  storageBucket: 'vie-publique.firebasestorage.app',
  messagingSenderId: '740668513968',
  appId: '1:740668513968:web:1978a521f5a5468510e575',
});

const messaging = firebase.messaging();

// Handle push events
self.addEventListener('push', (event) => {
  event.waitUntil(
    (async () => {
      try {
        let title = 'Vie Publique Sénégal';
        let body = '';
        let data = {};

        if (event.data) {
          const payload = event.data.json();

          if (payload.notification) {
            title = payload.notification.title || title;
            body = payload.notification.body || body;
          }

          if (payload.data) {
            data = payload.data;
          }
        }

        await self.registration.showNotification(title, {
          body,
          icon: '/pwa-192x192.png',
          badge: '/pwa-192x192.png',
          tag: 'vie-publique-' + Date.now(),
          data,
        });
      } catch (error) {
        // Silent fail
      }
    })()
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
