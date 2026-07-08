import { readItems } from '@directus/sdk';

/**
 * Redirection legacy `/portraits/<slug>` (ancienne structure mono-segment)
 * vers la fiche actuelle `/personnalites/<id>/<slug>`.
 *
 * Contexte : l'ancien blanket routeRule `/portraits/** -> /personnalites/**`
 * renvoyait sur un 404 (la route cible est `/personnalites/[id]/[slug]`, à 2
 * segments). Or ces URLs rankent encore et reçoivent des clics (ex.
 * `/portraits/ousmane-diagne`). On résout donc le slug en id côté serveur.
 *
 * Robustesse : on compare des slugs **normalisés** (minuscules, sans tiret ni
 * accent) pour récupérer aussi les anciens slugs légèrement différents
 * (ex. `el-hadj-abdourahmane-diouf` -> `elhadj-abdourahmane-diouf`).
 * Slug introuvable -> redirection vers la liste (jamais de 404).
 */

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

/**
 * Alias pour les anciens slugs `/portraits/<slug>` qui diffèrent du slug actuel
 * par PLUS qu'un tiret/accent (ex. faute corrigée à la migration, mot retiré).
 * La normalisation ne peut pas les rattraper seule. Clé = ancien slug,
 * valeur = slug ACTUEL de la fiche (l'id est résolu via le CMS).
 *
 * Ajouter ici toute nouvelle correspondance legacy repérée dans la Search Console.
 */
const LEGACY_SLUG_ALIASES: Record<string, string> = {
  'yacine-fall': 'yassine-fall', // faute corrigée (Yacine -> Yassine)
  'omar-samba-ba': 'oumar-samba-ba', // Omar -> Oumar
  'general-jean-baptiste-tine': 'jean-baptiste-tine', // « général » retiré
};

// Index normalisé { ancien slug normalisé -> slug actuel } pour une recherche tolérante.
const ALIAS_BY_NORM: Record<string, string> = Object.fromEntries(
  Object.entries(LEGACY_SLUG_ALIASES).map(([legacy, current]) => [normalize(legacy), current]),
);

// Carte normalisée { slug normalisé -> { id, slug actuel } }, mise en cache 1h.
const getPersonSlugMap = defineCachedFunction(
  async (): Promise<Record<string, { id: string | number; slug: string }>> => {
    const directus = getCmsClient();
    const persons = await directus.request(
      readItems('public_persons', {
        fields: ['id', 'slug'],
        filter: { status: { _eq: 'published' } },
        limit: -1,
      }),
    );
    const map: Record<string, { id: string | number; slug: string }> = {};
    for (const p of persons as Array<{ id: string | number; slug: string | null }>) {
      if (p.slug) map[normalize(p.slug)] = { id: p.id, slug: p.slug };
    }
    return map;
  },
  { maxAge: 3600, name: 'portraits-person-slug-map', getKey: () => 'all' },
);

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');

  if (slug) {
    try {
      const map = await getPersonSlugMap();
      const norm = normalize(slug);

      // 1) Correspondance directe (tolère les diffs de tiret/accent).
      // 2) Sinon, alias legacy (faute corrigée / mot retiré) -> slug actuel.
      const hit =
        map[norm] || (ALIAS_BY_NORM[norm] ? map[normalize(ALIAS_BY_NORM[norm])] : undefined);

      if (hit?.id) {
        return sendRedirect(event, `/personnalites/${hit.id}/${hit.slug}`, 301);
      }
    } catch {
      // En cas d'erreur CMS, on tombe sur la liste plutôt qu'un 404.
    }
  }

  return sendRedirect(event, '/personnalites-senegal', 301);
});
