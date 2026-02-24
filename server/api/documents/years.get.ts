/**
 * GET /api/documents/years
 * Retourne les années disponibles avec le nombre de documents
 *
 * Query params:
 * - type (optionnel) : Filtrer par type de document
 * - family (optionnel) : Filtrer par famille de documents
 */
export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const type = query.type as string;
    const family = query.family as string;

    try {
      const config = useRuntimeConfig();

      // Construction des query params pour Directus (appel direct pour aggregation)
      const params = new URLSearchParams();
      params.append('aggregate[countDistinct]', 'id');
      params.append('groupBy[]', 'year(publish_date)');
      params.append('filter[status][_eq]', 'published');

      if (type && type !== 'all') {
        params.append('filter[type][_eq]', type);
      }

      if (family && family !== 'all') {
        params.append('filter[family][_eq]', family);
      }

      const response = await $fetch<{ data: any[] }>(
        `${config.cmsApiUrl}/items/documents?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${config.cmsApiKey}`,
          },
        },
      );

      const years = (response.data || [])
        .filter((item: any) => item.publish_date_year)
        .map((item: any) => ({
          year: parseInt(item.publish_date_year),
          count: parseInt(item.countDistinct?.id || '0'),
        }))
        .sort((a: any, b: any) => b.year - a.year);

      return { years };
    } catch (error) {
      console.error('Erreur API documents years:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des années',
      });
    }
  },
  {
    maxAge: 60 * 5 * 1, // 5 minutes
    name: 'documents-years',
    getKey: (event) => {
      const query = getQuery(event);
      return `documents-years-${query.type || 'all'}-${query.family || 'all'}`;
    },
  },
);
