/**
 * API Route: GET /api/state/stats
 * Statistiques sur les entités publiques
 */

import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (): Promise<any> => {
    const cmsClient = getCmsClient();

    try {
      // Récupérer toutes les entités
      const entities = await cmsClient.request(
        readItems('state_entity', {
          fields: ['id', 'type'],
          limit: -1,
        }),
      );

      return {
        total: entities.length,
      };
    } catch (error) {
      console.error('Error fetching state stats:', error);
      throw createError({
        statusCode: 500,
        message: 'Erreur lors de la récupération des statistiques',
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache 1 heure
    name: 'state-stats',
  },
);
