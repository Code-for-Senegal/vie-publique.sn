import { readItems } from '@directus/sdk';
import type { SocialStat } from '~~/types/social-stat';

/**
 * Endpoint pour récupérer les statistiques des réseaux sociaux depuis Directus
 * GET /api/social-stats
 *
 * @returns Liste des réseaux sociaux avec cache de 30 minutes
 */
export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      const statsData = await directus
        .request(
          readItems('vp_social_stats', {
            fields: ['id', 'name', 'followers', 'display', 'order', 'link', 'status'],
            sort: ['order'],
            filter: {
              status: {
                _eq: 'published',
              },
              display: {
                _eq: true,
              },
            },
          }),
        )
        .catch((error) => {
          console.error('Directus Error Details:', JSON.stringify(error, null, 2));
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message:
              error.errors?.[0]?.message ||
              'Erreur interne du serveur lors de la connexion CMS',
          });
        });

      const transformedStats: SocialStat[] = statsData.map((stat: any) => ({
        id: stat.id,
        name: stat.name,
        followers: stat.followers || 0,
        display: stat.display ?? true,
        order: stat.order || 0,
        link: stat.link || '',
        status: stat.status,
      }));

      return {
        data: transformedStats,
        total: transformedStats.length,
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des stats sociales:', error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage:
          error.message ||
          'Une erreur est survenue lors de la récupération des statistiques sociales',
      });
    }
  },
  {
    maxAge: 60 * 30,
    name: 'social-stats',
    getKey: () => 'social-stats-list',
  },
);
