/**
 * API Route: GET /api/state/stats
 * Statistiques sur les entités publiques
 */

import { readItems } from '@directus/sdk';
import type { StateEntityStats } from '~/types/state-entity';

export default defineCachedEventHandler(
  async (): Promise<StateEntityStats> => {
    const cmsClient = getCmsClient();

    try {
      // Récupérer toutes les entités pour calculer les stats
      const entities = await cmsClient.request(
        readItems('state_entities', {
          fields: ['id', 'type', 'status'],
          limit: -1,
        }),
      );

      // Calculer les statistiques
      const byType: Record<string, number> = {
        ministere: 0,
        secretariat_etat: 0,
        direction: 0,
        agence: 0,
        autorite: 0,
        societe_nationale: 0,
        etablissement: 0,
        commission: 0,
        conseil: 0,
        autre: 0,
      };

      const byStatus: Record<string, number> = {
        active: 0,
        inactive: 0,
        dissolved: 0,
        merged: 0,
        renamed: 0,
      };

      entities.forEach((entity) => {
        // Comptage par type
        if (entity.type && byType[entity.type] !== undefined) {
          byType[entity.type]++;
        }

        // Comptage par statut
        if (entity.status && byStatus[entity.status] !== undefined) {
          byStatus[entity.status]++;
        }
      });

      return {
        total: entities.length,
        by_type: byType as any,
        by_status: byStatus as any,
        active_ministries: byType.ministere,
        total_agencies: byType.agence,
        total_directions: byType.direction,
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
