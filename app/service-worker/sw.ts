/// <reference lib="WebWorker" />
/// <reference types="vite/client" />
import {
  cleanupOutdatedCaches,
  precacheAndRoute,
} from "workbox-precaching";
import { NavigationRoute, registerRoute, setCatchHandler } from "workbox-routing";
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from "workbox-strategies";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import { ExpirationPlugin } from "workbox-expiration";

declare let self: ServiceWorkerGlobalScope;

// Noms des caches connus — utilisés pour le nettoyage à l'activation
const CACHE_NAMES = {
  HTML: 'html-cache',
  MANIFEST: 'vpsn-webmanifest',
  API: 'api-cache',
  IMAGES: 'images-cache',
  CMS_ASSETS: 'cms-assets-images',
  FONTS: 'google-fonts',
  STATIC: 'static-assets',
} as const;

const KNOWN_CACHES = new Set(Object.values(CACHE_NAMES));

// Page offline inline — servie quand réseau ET cache échouent
const OFFLINE_HTML = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Hors ligne — Vie Publique Sénégal</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, -apple-system, sans-serif; background: #f9fafb; color: #111827; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 1.5rem; }
    .card { background: white; border-radius: 1rem; padding: 2.5rem; max-width: 420px; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .icon { font-size: 3rem; margin-bottom: 1rem; }
    h1 { font-size: 1.25rem; margin-bottom: 0.75rem; }
    p { color: #6b7280; margin-bottom: 1.5rem; line-height: 1.5; font-size: 0.95rem; }
    button { background: #047857; color: white; border: none; padding: 0.75rem 2rem; border-radius: 0.5rem; font-size: 1rem; cursor: pointer; transition: background 0.2s; }
    button:active { background: #065f46; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">📡</div>
    <h1>Connexion indisponible</h1>
    <p>Impossible de charger la page. Vérifiez votre connexion internet ou réessayez dans quelques instants.</p>
    <button onclick="location.reload()">Réessayer</button>
  </div>
</body>
</html>`;

// self.__WB_MANIFEST est le point d'injection par défaut
precacheAndRoute(self.__WB_MANIFEST);

// Nettoyer les anciens caches de workbox-precache (supprime les entrées périmées)
cleanupOutdatedCaches();

// Force le nouveau SW à prendre le contrôle immédiatement
// Crucial pour les déploiements : tous les utilisateurs reçoivent les nouveaux assets
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

// Configuration des routes en production uniquement
if (import.meta.env.PROD) {
  // Plugin custom : quand le serveur renvoie une erreur (4xx/5xx) sur une navigation,
  // on tente de servir la version en cache plutôt que l'erreur brute.
  // Cela protège les utilisateurs PWA pendant les déploiements ou les pannes temporaires.
  const navigationErrorFallbackPlugin = {
    fetchDidSucceed: async ({ request, response }: { request: Request; response: Response }) => {
      // Laisser passer les réponses OK
      if (response.ok) return response;

      // Seulement pour les navigations (pages HTML)
      if (request.mode !== 'navigate') return response;

      console.warn(`[SW] Serveur a renvoyé ${response.status} pour ${request.url}`);

      try {
        const cache = await caches.open(CACHE_NAMES.HTML);

        // Essayer la même URL (ignoreSearch pour gérer les query params UTM de la PWA)
        const cached = await cache.match(request, { ignoreSearch: true });
        if (cached) {
          console.log('[SW] Fallback : page cachée servie');
          return cached;
        }

        // Essayer la racine comme dernier recours (couvre start_url avec params)
        const root = await cache.match(new Request('/'));
        if (root) {
          console.log('[SW] Fallback : page racine cachée servie');
          return root;
        }
      } catch (err) {
        console.error('[SW] Erreur fallback cache:', err);
      }

      // Aucun cache disponible — retourner une page d'erreur propre au lieu du 500 brut
      return new Response(OFFLINE_HTML, {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    },
  };

  // Cache du manifest
  registerRoute(
    ({ request, sameOrigin }) => sameOrigin && request.destination === 'manifest',
    new NetworkFirst({
      cacheName: CACHE_NAMES.MANIFEST,
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
      cacheName: CACHE_NAMES.API,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({ maxEntries: 150, maxAgeSeconds: 3600 }),
      ],
      networkTimeoutSeconds: 5,
    })
  );

  // Cache des images locales (icônes, logos, assets statiques du build)
  // EXCLUT les images CMS (/cms/, /medias/) — celles-ci ont leur propre route plus bas
  // avec StaleWhileRevalidate pour éviter de cacher des images partiellement téléchargées.
  registerRoute(
    ({ request, url }) =>
      request.destination === 'image' &&
      !url.pathname.startsWith('/cms/') &&
      !url.pathname.startsWith('/medias/'),
    new CacheFirst({
      cacheName: CACHE_NAMES.IMAGES,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 150,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        }),
      ],
    })
  );

  // Assets statiques (JS, CSS) — CacheFirst car hashés par Nuxt (/_nuxt/BxOFP-3D.js)
  // Le hash = la version. Même URL = même contenu, pour toujours.
  // Cache HIT → sert en < 1ms. Cache MISS (nouveau hash après déploiement) → réseau → cache.
  // C'est la stratégie correcte pour les fichiers immuables : pas de requête réseau inutile.
  registerRoute(
    ({ request }) =>
      request.destination === 'script' ||
      request.destination === 'style',
    new CacheFirst({
      cacheName: CACHE_NAMES.STATIC,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours — assets hashés, jamais périmés
        }),
      ],
    })
  );

  // Cache des assets du CMS (images et médias externes)
  registerRoute(
    ({ url }) =>
      url.origin === 'https://cms.vie-publique.sn' &&
      url.pathname.startsWith('/assets'),
    new StaleWhileRevalidate({
      cacheName: CACHE_NAMES.CMS_ASSETS,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 250,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        }),
      ],
    })
  );

  // Cache des images CMS via proxy local (/cms/ et /medias/)
  // StaleWhileRevalidate : sert le cache instantanément ET rafraîchit en arrière-plan.
  // Corrige le bug des images coupées : si une image partielle est cachée (connexion lente/coupée),
  // la revalidation en background la remplace par la version complète au prochain chargement.
  // CacheFirst cacherait l'image tronquée pendant 30 jours sans jamais la corriger.
  registerRoute(
    ({ url, request }) =>
      request.mode !== 'navigate' &&
      request.destination === 'image' &&
      (url.pathname.startsWith('/cms/') ||
       url.pathname.startsWith('/medias/')),
    new StaleWhileRevalidate({
      cacheName: CACHE_NAMES.CMS_ASSETS,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 250,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 jours
        }),
      ],
    })
  );

  // Cache des fichiers CMS non-image via proxy local (/cms/ et /medias/)
  // PDFs, documents, vidéos — NetworkFirst pour éviter de stocker des Go en cache.
  registerRoute(
    ({ url, request }) =>
      request.mode !== 'navigate' &&
      request.destination !== 'image' &&
      (url.pathname.startsWith('/cms/') ||
       url.pathname.startsWith('/medias/')),
    new NetworkFirst({
      cacheName: CACHE_NAMES.CMS_ASSETS,
      plugins: [
        new CacheableResponsePlugin({ statuses: [200] }),
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 7 * 24 * 60 * 60, // 7 jours — les docs changent plus souvent
        }),
      ],
      networkTimeoutSeconds: 10, // Timeout généreux pour les gros fichiers
    })
  );

  // Navigation principale — NetworkFirst avec fallback intelligent
  // Le plugin navigationErrorFallbackPlugin intercepte les erreurs serveur (4xx/5xx)
  // et sert la version cachée au lieu d'afficher l'erreur brute à l'utilisateur.
  registerRoute(
    new NavigationRoute(
      new NetworkFirst({
        cacheName: CACHE_NAMES.HTML,
        plugins: [
          navigationErrorFallbackPlugin,
          new CacheableResponsePlugin({ statuses: [200] }),
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24h max pour le HTML
          }),
        ],
        networkTimeoutSeconds: 8,
      }),
      { allowlist: [/.*/] }
    )
  );

  // Google Fonts
  registerRoute(
    ({url}) => url.host.startsWith('fonts.g'),
    new CacheFirst({
      cacheName: CACHE_NAMES.FONTS,
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

  // Handler global de dernier recours — quand réseau ET cache échouent totalement
  setCatchHandler(async ({ request }) => {
    if (request.destination === 'document') {
      return new Response(OFFLINE_HTML, {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return Response.error();
  });
}

// Nettoyage à l'activation — supprimer UNIQUEMENT les caches inconnus (anciens SW)
// IMPORTANT : On ne purge PAS html-cache ni static-assets.
// NetworkFirst garantit la fraîcheur quand le serveur est disponible.
// Les caches servent de filet de sécurité pendant les déploiements :
// si le serveur renvoie 500, l'utilisateur voit la dernière version fonctionnelle
// plutôt qu'une page d'erreur.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames =>
        Promise.all(
          cacheNames
            .filter(name => !KNOWN_CACHES.has(name) && !name.startsWith('workbox-precache'))
            .map(name => {
              console.log(`[SW] Purge ancien cache inconnu : ${name}`);
              return caches.delete(name);
            })
        )
      )
      .then(() => self.clients.claim())
      .then(() => {
        // Notifier les clients qu'une mise à jour est active
        self.clients.matchAll({ type: 'window' }).then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'SW_UPDATED' });
          });
        });
      })
  );
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
