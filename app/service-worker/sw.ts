/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute } from "workbox-routing";
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

const WORKBOX_CACHES = [
  'html-cache',
  'vpsn-webmanifest',
  'api-cache',
  'images-cache',
  'cms-assets-images',
  'google-fonts',
  'static-assets',
  // Note: 'pages-cache' retiré — on utilise NetworkFirst pour les pages HTML
  // Note: 'workbox-precache' est géré automatiquement par cleanupOutdatedCaches
];

// self.__WB_MANIFEST est le point d'injection par défaut
const entries = self.__WB_MANIFEST;

// Assurer que la route racine est incluse dans le précache
const rootEntry = { url: '/', revision: null };
const hasRoot = entries.some(entry =>
  typeof entry === 'string' ? entry === '/' : entry.url === '/'
);
if (!hasRoot) {
  entries.push(rootEntry);
}

// Précacher les routes essentielles
precacheAndRoute(entries);

// Nettoyer les anciens caches de workbox-precache (supprime les entrées périmées)
cleanupOutdatedCaches();

// Force le nouveau SW à prendre le contrôle immédiatement
// Crucial pour les déploiements : tous les utilisateurs reçoivent les nouveaux assets
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Définir les routes à mettre en cache (toutes les routes)
const allowlist: RegExp[] = [/.*/];

// Configuration pour le offline
if (import.meta.env.PROD) {
  // Cache du manifest
  registerRoute(
    ({ request, sameOrigin }) => sameOrigin && request.destination === 'manifest',
    new NetworkFirst({
      cacheName: 'vpsn-webmanifest',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 100 }),
      ],
    })
  );

  // Cache des API avec timeout
  registerRoute(
    ({ url }) =>
      url.pathname.startsWith('/items/') ||
      (url.pathname.startsWith('/api/') && !url.pathname.includes('sitemap')),
    new NetworkFirst({
      cacheName: 'api-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 3600 }),
      ],
      networkTimeoutSeconds: 5,
    })
  );

  // Cache des images locales
  registerRoute(
    ({ request }) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        }),
      ],
    })
  );

  // Cache des assets statiques (JS, CSS) — NetworkFirst pour éviter les 404 après déploiement
  // Le réseau est prioritaire pour toujours récupérer les nouveaux chunks hashés
  registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style',
    new NetworkFirst({
      cacheName: 'static-assets',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
        }),
      ],
      networkTimeoutSeconds: 5,
    })
  );

  // Cache des assets du CMS (images et médias)
  registerRoute(
    ({ url }) =>
      url.origin === 'https://cms.vie-publique.sn' &&
      url.pathname.startsWith('/assets'),
    new StaleWhileRevalidate({
      cacheName: 'cms-assets-images',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 250,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        }),
      ],
    })
  );

  // Cache des assets via proxy local (/cms/ et /medias/)
  registerRoute(
    ({ url }) =>
      url.pathname.startsWith('/cms/') ||
      url.pathname.startsWith('/medias/'),
    new CacheFirst({
      cacheName: 'cms-assets-images',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 250,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        }),
      ],
    })
  );

  // Navigation principale — NetworkFirst obligatoire pour éviter les 404
  // Toujours essayer le réseau d'abord pour récupérer le HTML frais
  // qui référence les bons chunks JS/CSS après un déploiement
  registerRoute(
    new NavigationRoute(
      new NetworkFirst({
        cacheName: 'html-cache',
        plugins: [
          new CacheableResponsePlugin({ statuses: [200] }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24h max pour le HTML
          }),
        ],
        networkTimeoutSeconds: 8, // Timeout plus généreux pour éviter le fallback stale
      }),
      { allowlist }
    )
  );

  // Google Fonts
  registerRoute(
    ({url}) => url.host.startsWith('fonts.g'),
    new CacheFirst({
      cacheName: 'google-fonts',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 30,
          maxAgeSeconds: 60 * 24 * 60 * 60, // 60 jours
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200]
        }),
      ],
    })
  );

  // Ignorer les scripts tiers (instant.page, analytics, etc.)
  registerRoute(
    ({url}) =>
      url.host === 'instant.page' ||
      url.host.includes('google-analytics') ||
      url.host.includes('googletagmanager'),
    new NetworkFirst({
      networkTimeoutSeconds: 3,
      plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
      ],
    })
  );
}

// Gestion des mises à jour — purge agressive des caches périmés
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Purger les caches inconnus (anciens SW) ET les caches de pages potentiellement stale
          const isKnown = WORKBOX_CACHES.includes(cacheName) ||
            cacheName.startsWith('workbox-precache');
          if (!isKnown) {
            console.log(`[SW] Purging old cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
          // Purger le html-cache pour forcer le fetch d'un HTML frais après activation
          if (cacheName === 'html-cache' || cacheName === 'static-assets') {
            console.log(`[SW] Clearing deployment-sensitive cache: ${cacheName}`);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())      .then(() => {
        // Notifier les clients qu'une mise à jour est active
        self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'SW_UPDATED' });
          });
        });
      })  );
});

// Communication avec le client — gestion propre du skipWaiting
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

/*
  Gestion des événements push
  Supporte deux formats:
  1. Firebase FCM: { notification: { title, body }, data: { url } }
  2. Custom: { title, body, openUrl }
*/
self.addEventListener('push', event => {
  if (!event.data) return;

  try {
    const payload = JSON.parse(event.data.text());

    // Extraire titre et body (supporte Firebase et custom format)
    let title = 'Vie Publique Sénégal';
    let body = '';
    let imageUrl: string | undefined;
    let openUrl = '/';

    // Format Firebase FCM
    if (payload.notification) {
      title = payload.notification.title || title;
      body = payload.notification.body || body;
      imageUrl = payload.notification.image || payload.notification.imageUrl;
    }

    // Format custom ou data Firebase
    if (payload.title) title = payload.title;
    if (payload.body) body = payload.body;
    if (payload.imageUrl) imageUrl = payload.imageUrl;
    if (payload.openUrl) openUrl = payload.openUrl;

    // Firebase data object
    if (payload.data) {
      if (payload.data.url) openUrl = payload.data.url;
      if (payload.data.openUrl) openUrl = payload.data.openUrl;
    }

    event.waitUntil(
      self.registration.showNotification(title, {
        body: body || 'Nouvelle notification',
        icon: '/pwa-192x192.png',
        badge: '/badge-72x72.png',
        image: imageUrl,
        vibrate: [100, 50, 100],
        tag: 'vpsn-notification',
        renotify: true,
        data: {
          openUrl,
          timestamp: Date.now(),
        },
      })
    );
  } catch {
    event.waitUntil(
      self.registration.showNotification('Vie Publique Sénégal', {
        body: 'Nouvelle notification',
        icon: '/pwa-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'vpsn-notification',
      })
    );
  }
});

/*
  Gestion des événements de notification
*/
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'close') return;

  const targetUrl = event.notification.data?.openUrl || event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Chercher un onglet existant du site
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          (client as WindowClient).navigate(targetUrl);
          return (client as WindowClient).focus();
        }
      }
      // Sinon ouvrir une nouvelle fenêtre
      return self.clients.openWindow(targetUrl);
    })
  );
});

self.addEventListener('notificationclose', _event => {
  // Analytics hook possible ici
});

/*
  Gestion du changement de subscription push (P15)
  Se déclenche quand le navigateur rafraîchit la push subscription.
  Notifie les clients pour qu'ils puissent re-synchroniser le token.
*/
self.addEventListener('pushsubscriptionchange', (event: Event) => {
  const pushEvent = event as ExtendableEvent;
  pushEvent.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      Array.from(clients).forEach(client => {
        client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' });
      });
    })
  );
});