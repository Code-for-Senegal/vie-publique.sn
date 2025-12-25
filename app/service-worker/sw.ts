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
  'workbox-precache',
  'google-fonts',
  'static-assets',
  'pages-cache',
];

// Routes principales à précacher pour un accès offline
const CRITICAL_ROUTES = [
  '/',
  '/actualites',
  '/budget-senegal',
  '/assemblee-nationale',
  '/documents',
  '/gouvernement',
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

// Nettoyer les anciens caches
cleanupOutdatedCaches();

// Définir les routes à mettre en cache
let allowlist: undefined | RegExp[];
if (import.meta.env.DEV) {
  allowlist = [/.*/];
} else {
  allowlist = [/.*/];
}

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

  // Cache des API avec timeout - étendu pour plus de routes
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

  // Cache des pages principales (pour accès offline rapide)
  registerRoute(
    ({ url, request }) =>
      request.destination === 'document' &&
      CRITICAL_ROUTES.some(route => url.pathname === route || url.pathname.startsWith(route + '/')),
    new StaleWhileRevalidate({
      cacheName: 'pages-cache',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 heures
        }),
      ],
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

  // Cache des assets statiques (JS, CSS)
  registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style',
    new StaleWhileRevalidate({
      cacheName: 'static-assets',
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours
        }),
      ],
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

  // Navigation principale avec fallback
  registerRoute(
    new NavigationRoute(
      new NetworkFirst({
        cacheName: 'html-cache',
        plugins: [
          new CacheableResponsePlugin({ statuses: [200] }),
        ],
        networkTimeoutSeconds: 3,
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
}

// Gestion des mises à jour
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => Promise.all(
      cacheNames.map(cacheName => {
        if (!WORKBOX_CACHES.includes(cacheName)) {
          console.log('Suppression du cache obsolète:', cacheName);
          return caches.delete(cacheName);
        }
      })
    )).then(() => {
      console.log('Service Worker activé et caches nettoyés');
      return self.clients.claim();
    })
  );
});

// Communication avec le client
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    console.log('skipWaiting reçu, activation du nouveau Service Worker...');
    self.skipWaiting();
    self.clients.claim().then(() => {
      self.clients.matchAll().then(clients => {
        // Utiliser Array.from pour résoudre le problème TypeScript avec find()
        const clientsArray = Array.from(clients);
        console.log(`Notification de ${clientsArray.length} clients pour rechargement`);
        clientsArray.forEach(client => client.postMessage('reload'));
      });
    });
  }
});

/*
  Gestion des événements push
*/
self.addEventListener('push', event => {
  console.log('Push message received:', event);
  if (event.data) {
    try {
      const data = JSON.parse(event.data.text());
      
      // Valider que les champs obligatoires sont présents
      if (!data.title) {
        throw new Error('Le titre de la notification est manquant');
      }
      
      // Afficher la notification
      event.waitUntil(
        self.registration.showNotification(
          data.title,
          {
            body: data.body || 'Nouvelle notification',
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png',
            image: data.imageUrl,
            vibrate: [100, 50, 100, 50, 100],
            sound: data.sound,
            requireInteraction: data.requireInteraction || false,
            actions: [
              ...(data.actions || []),
              { action: 'close', title: 'Fermer' }
            ],
            data: {
              openUrl: data.openUrl || '/',
              timestamp: new Date().getTime()
            }
          }
        )
      );
    } catch (error) {
      console.error('Erreur lors du traitement du message push:', error);
      // Afficher une notification générique en cas d'erreur
      event.waitUntil(
        self.registration.showNotification(
          'Nouvelle notification',
          {
            body: 'Impossible de traiter les détails de la notification',
            icon: '/pwa-192x192.png',
            badge: '/pwa-192x192.png'
          }
        )
      );
    }
  }
});

/*
  Gestion des événements de notification
*/
self.addEventListener('notificationclick', event => {
  const notification = event.notification;
  const action = event.action;

  console.log('Notification cliquée', action);
  
  if (action === 'close') {
    notification.close();
    return;
  }

  // Ouvrir l'URL associée
  const targetUrl = notification.data?.openUrl || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Chercher une fenêtre visible
      const visibleClient = clients.find(client =>
        (client as WindowClient).visibilityState === 'visible'
      ) as WindowClient | undefined;

      if (visibleClient) {
        visibleClient.navigate(targetUrl);
        return visibleClient.focus();
      }
      // Sinon ouvrir une nouvelle fenêtre
      return self.clients.openWindow(targetUrl);
    })
  );

  notification.close();
});

self.addEventListener('notificationclose', event => {
  console.log('Notification fermée sans interaction:', event);
  // Vous pouvez ajouter une logique d'analyse ici si nécessaire
});

// self.skipWaiting(); // pour permettre la gestion manuelle des mises à jour
// clientsClaim(); // déjà géré dans l'événement 'activate'