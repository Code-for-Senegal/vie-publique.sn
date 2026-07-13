/**
 * Client Typesense côté serveur (pattern `getCmsClient` / cms-client.ts).
 *
 * Centralise l'URL, la clé (search-only, jamais exposée au client) et les paramètres
 * de scoring communs aux routes qui interrogent l'index `vp-search` :
 * - `server/api/search.ts` (recherche globale)
 * - `server/api/documents/index.get.ts` (recherche de la liste documents, C10)
 *
 * Toute évolution du tuning de pertinence (query_by, text_match_type, prioritize_*)
 * se fait ICI pour rester cohérente entre les deux.
 * Référence : docs/search/audit-recherche-2026-07.md
 */

/**
 * Défauts de scoring de l'index v2.
 * ⚠️ `summary` n'existe que dans l'index v2 (vp-search) — ne pas repointer
 * TYPESENSE_COLLECTION sur un index sans ce champ.
 */
export const TYPESENSE_QUERY_DEFAULTS = {
  query_by: 'title,summary,content_text,tags',
  // max_score : meilleur score réel parmi les champs (max_weight favorisait le champ
  // au poids le plus élevé même sur un match faible, ex. "la" dans un titre)
  text_match_type: 'max_score',
  prioritize_exact_match: true,
  // Désactivés : les stop words français ("la", "de") matchent tôt/partout et biaisent le scoring
  prioritize_token_position: false,
  prioritize_num_matching_fields: false,
} as const;

/**
 * Recherche dans la collection configurée (`TYPESENSE_COLLECTION`, alias `vp-search`).
 * `params` surcharge les défauts ci-dessus. Lève un 500 si la config est absente —
 * les appelants qui veulent une dégradation propre l'attrapent (cf. /api/documents).
 */
export async function searchTypesense(params: Record<string, unknown>): Promise<any> {
  const config = useRuntimeConfig();
  if (!config.typesenseApiKey || !config.typesenseUrl) {
    throw createError({
      statusCode: 500,
      message: 'Configuration Typesense manquante',
    });
  }
  const collection = config.typesenseCollection || 'vp-search';

  return await $fetch(`${config.typesenseUrl}/collections/${collection}/documents/search`, {
    headers: {
      'x-typesense-api-key': config.typesenseApiKey as string,
    },
    params: { ...TYPESENSE_QUERY_DEFAULTS, ...params },
  });
}
