/**
 * Configuration Sentry côté CLIENT (navigateur).
 * Injectée automatiquement par le module @sentry/nuxt (fichier conventionnel à la racine).
 *
 * Périmètre volontairement minimal : capture d'ERREURS uniquement.
 * Pas de tracing ni de session replay (poids client + quota du plan gratuit).
 * Voir docs/monitoring/sentry.md avant de modifier.
 */
import * as Sentry from '@sentry/nuxt';
import { useRuntimeConfig } from '#imports';

const config = useRuntimeConfig();
const dsn = config.public.sentry?.dsn;

// Pas de DSN configuré → Sentry entièrement désactivé (aucun impact runtime)
if (dsn) {
  Sentry.init({
    dsn,
    environment: config.public.appEnv || 'production',
    release: `vie-publique.sn@${config.public.appVersion}`,

    // Erreurs uniquement — pas de tracing de performance
    tracesSampleRate: 0,

    // Bruit connu à NE PAS remonter (quota + signal/bruit) :
    ignoreErrors: [
      // Erreurs de chunks après déploiement — déjà auto-gérées par reload
      // (voir app/plugins/chunk-error-handler.client.ts)
      'Failed to fetch dynamically imported module',
      'Importing a module script failed',
      'error loading dynamically imported module',
      'Unable to preload CSS',
      'Loading chunk',
      'ChunkLoadError',
      'Failed to load module script',
      // Connectivité utilisateur (réseaux mobiles instables), pas un bug applicatif
      'Failed to fetch',
      'NetworkError when attempting to fetch a resource',
      'Load failed',
      // Extensions navigateur / scripts tiers hors de notre contrôle
      'ResizeObserver loop',
    ],
    // Ne pas remonter les erreurs venant de scripts tiers (GTM, Twitter, Facebook…)
    denyUrls: [
      /googletagmanager\.com/,
      /google-analytics\.com/,
      /clarity\.ms/,
      /connect\.facebook\.net/,
      /platform\.twitter\.com/,
    ],
  });
}
