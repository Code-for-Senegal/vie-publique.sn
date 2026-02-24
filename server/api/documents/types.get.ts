/**
 * GET /api/documents/types
 * Retourne les types de documents disponibles avec le nombre de documents
 *
 * Query params:
 * - family (optionnel) : Filtrer par famille de documents
 */
export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const family = query.family as string;

    try {
      const config = useRuntimeConfig();

      // Aggregation par type via l'API Directus
      const params = new URLSearchParams();
      params.append('aggregate[countDistinct]', 'id');
      params.append('groupBy[]', 'type');
      params.append('filter[status][_eq]', 'published');

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

      const types = (response.data || [])
        .filter((item: any) => item.type)
        .map((item: any) => ({
          type: item.type as string,
          count: parseInt(item.countDistinct?.id || '0'),
        }))
        .sort((a: any, b: any) => b.count - a.count);

      return { types };
    } catch (error) {
      console.error('Erreur API documents types:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des types',
      });
    }
  },
  {
    maxAge: 60 * 5 * 1, // 5 minutes
    name: 'documents-types',
    getKey: (event) => {
      const query = getQuery(event);
      return `documents-types-${query.family || 'all'}`;
    },
  },
);
