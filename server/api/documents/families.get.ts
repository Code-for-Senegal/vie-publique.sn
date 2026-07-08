/**
 * GET /api/documents/families
 * Retourne les familles de documents disponibles avec le nombre de documents
 */
export default defineCachedEventHandler(
  async () => {
    try {
      const config = useRuntimeConfig();

      // Aggregation par family via l'API Directus
      const params = new URLSearchParams();
      params.append('aggregate[countDistinct]', 'id');
      params.append('groupBy[]', 'family');
      params.append('filter[status][_eq]', 'published');
      params.append('filter[family][_nnull]', 'true');

      const response = await $fetch<{ data: any[] }>(
        `${config.cmsApiUrl}/items/documents?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${config.cmsApiKey}`,
          },
        },
      );

      const families = (response.data || [])
        .filter((item: any) => item.family)
        .map((item: any) => ({
          family: item.family as string,
          count: parseInt(item.countDistinct?.id || '0'),
        }))
        .sort((a: any, b: any) => b.count - a.count);

      return { families };
    } catch (error) {
      console.error('Erreur API documents families:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des familles de documents',
      });
    }
  },
  {
    maxAge: 60 * 5,
    name: 'documents-families',
    getKey: () => 'documents-families',
  },
);
