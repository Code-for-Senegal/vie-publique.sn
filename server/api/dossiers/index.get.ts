import { readItems } from '@directus/sdk';
import type { DossierListItem } from '~~/types/dossier';

/**
 * GET /api/dossiers
 * Liste paginée des dossiers PUBLIÉS (les brouillons ne sont jamais exposés).
 *
 * Query params :
 *  - page (number, défaut 1)
 *  - limit (number, défaut 12)
 *  - search (string) → recherche titre / résumé
 *  - tag (string) → filtre par tag
 *  - sortBy (string, défaut '-publish_date')
 *  - featured ('1' pour ne renvoyer que les dossiers mis en avant)
 */
export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 12;
    const search = (query.search as string) || '';
    const type = (query.type as string) || '';
    const tag = (query.tag as string) || '';
    const sortBy = (query.sortBy as string) || (query.sort as string) || '-publish_date';
    const onlyFeatured = query.featured === '1' || query.featured === 'true';

    try {
      const directus = getCmsClient();

      // Filtre : uniquement les dossiers publiés
      const filter: Record<string, any> = {
        status: { _eq: 'published' },
      };

      if (type && type !== 'all') {
        filter.type = { _eq: type };
      }

      if (tag && tag !== 'all') {
        filter.tags = { _contains: tag };
      }

      if (onlyFeatured) {
        filter.featured = { _eq: true };
      }

      if (search) {
        filter._or = [{ title: { _icontains: search } }, { summary: { _icontains: search } }];
      }

      // Tri stable : critère demandé + id en dernier ressort
      const sortFields: string[] = [];
      const cleanSort = sortBy.toString().trim();
      if (cleanSort) sortFields.push(cleanSort);
      if (sortFields.length === 0) sortFields.push('-publish_date');
      sortFields.push('id');

      const offset = (page - 1) * limit;

      const data = await directus
        .request(
          readItems('dossier', {
            fields: [
              'id',
              'title',
              'slug',
              'type',
              'summary',
              'cover_image',
              'publish_date',
              'date_updated',
              'tags',
              'featured',
            ],
            filter,
            limit,
            offset,
            sort: sortFields,
          }),
        )
        .catch((error: any) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message: error.errors?.[0]?.message || 'Erreur interne du serveur',
          });
        });

      const totalCount = await directus
        .request(
          readItems('dossier', {
            fields: ['id'],
            filter,
            aggregate: { count: ['id'] },
          }),
        )
        .then((result: any) => result?.[0]?.count?.id || 0)
        .catch(() => data.length);

      const dossiers: DossierListItem[] = (data as any[]).map((d) => ({
        id: d.id,
        title: d.title?.trim() || d.title,
        slug: d.slug,
        ...(d.type ? { type: d.type } : {}),
        ...(d.summary ? { summary: d.summary } : {}),
        ...(d.cover_image ? { cover_image: d.cover_image } : {}),
        ...(d.publish_date ? { publish_date: d.publish_date } : {}),
        ...(d.date_updated ? { date_updated: d.date_updated } : {}),
        ...(Array.isArray(d.tags) ? { tags: d.tags } : {}),
        ...(d.featured ? { featured: true } : {}),
      }));

      return {
        // `items` est lu par useCmsCollection ; `dossiers` reste explicite.
        items: dossiers,
        dossiers,
        pagination: {
          page,
          limit,
          total: Number(totalCount),
          totalPages: Math.ceil(Number(totalCount) / limit),
        },
      };
    } catch (error: any) {
      // NE PAS retourner d'objet vide ici : ce handler est `defineCachedEventHandler`,
      // donc une réponse vide (HTTP 200) serait MISE EN CACHE et resservie même après
      // rétablissement du CMS (cache empoisonné). On relance une erreur — Nitro ne cache
      // pas les handlers qui throw — et le front gère déjà l'état `error`. Pattern aligné
      // sur le reste des endpoints (news, documents, podcasts…).
      if (error?.statusCode) throw error;
      console.error('Erreur récupération dossiers:', error?.message || error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Une erreur est survenue lors de la récupération des dossiers',
      });
    }
  },
  {
    maxAge: getCacheMaxAge(CacheDuration.SHORT, 0), // prod : 5 min · dev : pas de cache
    name: 'dossiers',
    getKey: (event) => buildCacheKey('dossiers', getQuery(event)),
  },
);
