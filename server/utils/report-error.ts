import * as Sentry from '@sentry/nuxt';

/**
 * Signale une erreur serveur : console + Sentry (si DSN configuré, sinon no-op côté Sentry).
 *
 * À utiliser dans les blocs catch des handlers qui « dégradent proprement »
 * (échec CMS = donnée omise / fallback, jamais de 500 global — cf. CLAUDE.md) :
 * sans ce signalement, une panne CMS ou un token cassé peut passer inaperçu des jours.
 *
 * Répond aussi à SEC-9 (audit 2026-07) : au client un message générique,
 * les détails partent ici (logs + monitoring), jamais dans la réponse HTTP.
 *
 * @param error   l'erreur capturée
 * @param scope   identifiant court de l'endroit (ex. 'api/documents/related')
 * @param context données utiles au diagnostic (id, slug, params…) — pas de secrets
 */
export function reportServerError(
  error: unknown,
  scope: string,
  context?: Record<string, unknown>,
) {
  console.error(`[${scope}]`, error);
  Sentry.captureException(error, {
    tags: { scope },
    extra: context,
  });
}
