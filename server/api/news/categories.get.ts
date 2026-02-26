import { readItems } from '@directus/sdk';

/**
 * GET /api/news/categories
 * Retourne les catégories d'actualités disponibles avec le nombre d'articles
 */
export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      // Récupérer toutes les catégories depuis la collection news_category
      const categoriesData = await directus.request(
        readItems('news_category', {
          fields: ['id', 'name', 'slug'],
          sort: ['name'],
        }),
      );

      // Compter les articles publiés par catégorie
      const config = useRuntimeConfig();
      const params = new URLSearchParams();
      params.append('aggregate[countDistinct]', 'id');
      params.append('groupBy[]', 'category');
      params.append('filter[status][_eq]', 'published');

      const countsResponse = await $fetch<{ data: any[] }>(
        `${config.cmsApiUrl}/items/news?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${config.cmsApiKey}`,
          },
        },
      );

      // Construire un map id -> count
      const countMap = new Map<string, number>();
      for (const item of countsResponse.data || []) {
        if (item.category) {
          countMap.set(item.category, parseInt(item.countDistinct?.id || '0'));
        }
      }

      const categories = (categoriesData || [])
        .filter((cat: any) => cat.name)
        .map((cat: any) => ({
          name: cat.name as string,
          slug: (cat.slug || '') as string,
          count: countMap.get(cat.id) || 0,
        }))
        .sort((a: any, b: any) => b.count - a.count);

      return { categories };
    } catch (error) {
      console.error('Erreur API news categories:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des catégories',
      });
    }
  },
  {
    maxAge: 60 * 5, // 5 minutes
    name: 'news-categories',
    getKey: () => 'news-categories',
  },
);
