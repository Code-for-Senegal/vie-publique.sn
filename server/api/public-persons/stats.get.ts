import { aggregate } from '@directus/sdk';

export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      const personFilter = {
        status: { _eq: 'published' },
      };

      // Agrégation par catégorie de poste (via les nominations actives publiées)
      const categoryStats = await directus.request(
        aggregate('public_person_appointments', {
          aggregate: { count: ['id'] },
          groupBy: ['position_category', 'position_category_slug'],
          query: {
            filter: {
              status: { _eq: 'published' },
              is_current: { _eq: true },
            },
          },
        }),
      );

      // Agrégation par genre (sur les personnes)
      const genderStats = await directus.request(
        aggregate('public_persons', {
          aggregate: { count: ['id'] },
          groupBy: ['sexe'],
          query: { filter: personFilter },
        }),
      );

      // Transformation - Catégories (clé = slug, valeur = { label, count })
      const totalsByCategory: Record<string, { label: string; count: number }> = {};
      categoryStats.forEach((stat: any) => {
        if (stat.position_category && stat.position_category_slug) {
          totalsByCategory[stat.position_category_slug] = {
            label: stat.position_category,
            count: parseInt(stat.count.id),
          };
        }
      });

      // Transformation - Genre
      let maleCount = 0;
      let femaleCount = 0;
      genderStats.forEach((stat: any) => {
        if (stat.sexe === 'male') {
          maleCount = parseInt(stat.count.id);
        } else if (stat.sexe === 'female') {
          femaleCount = parseInt(stat.count.id);
        }
      });

      // Total global des personnes
      const totalResult = await directus.request(
        aggregate('public_persons', {
          aggregate: { count: ['id'] },
          query: { filter: personFilter },
        }),
      );

      const total = totalResult[0]?.count?.id ? parseInt(totalResult[0].count.id) : 0;

      return {
        totalsByCategory: Object.fromEntries(
          Object.entries(totalsByCategory).sort(([, a], [, b]) => a.label.localeCompare(b.label)),
        ),
        totalsByGender: { maleCount, femaleCount },
        total,
      };
    } catch (error) {
      console.error('Error fetching public persons stats:', error);
      throw createError({
        statusCode: 500,
        statusMessage: 'Une erreur est survenue lors de la récupération des statistiques',
      });
    }
  },
  {
    maxAge: process.env.NODE_ENV === 'production' ? 5 * 60 : 0, // 5 min en prod (à augmenter après stabilisation)
    name: 'public-persons-stats',
    getKey: () => 'public-persons-stats',
  },
);
