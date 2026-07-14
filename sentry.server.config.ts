/**
 * Configuration Sentry côté SERVEUR (Nitro).
 * Injectée dans le build via l'option `autoInjectServerSentry: 'top-level-import'`
 * du module @sentry/nuxt (pas besoin de modifier la commande de démarrage node).
 *
 * ⚠️ Ici, PAS de useRuntimeConfig() : ce fichier s'exécute avant l'init de Nitro.
 * On lit directement process.env (docs Sentry). Périmètre : erreurs uniquement.
 * Voir docs/infra/sentry.md avant de modifier.
 */
import * as Sentry from '@sentry/nuxt';

const dsn = process.env.NUXT_PUBLIC_SENTRY_DSN;

// Pas de DSN configuré → Sentry entièrement désactivé (aucun impact runtime)
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NUXT_PUBLIC_APP_ENV || process.env.NODE_ENV || 'production',

    // Erreurs uniquement — pas de tracing de performance
    tracesSampleRate: 0,
  });
}
