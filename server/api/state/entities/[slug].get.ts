/**
 * API Route: GET /api/state/entities/:slug
 * Détail d'une entité publique avec historique, enfants et fil d'Ariane
 */

import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event): Promise<any> => {
    const slug = getRouterParam(event, 'slug');
    const cmsClient = getCmsClient();

    if (!slug) {
      throw createError({
        statusCode: 400,
        message: 'Le slug est requis',
      });
    }

    try {
      // 1. Récupérer l'entité principale
      const entityData = await cmsClient.request(
        readItems('state_entity', {
          filter: {
            public_slug: { _eq: slug },
          },
          fields: [
            '*',
            'parent_entity.id',
            'parent_entity.name',
            'parent_entity.public_slug',
            'parent_entity.type',
          ],
          limit: 1,
        }),
      );

      if (!entityData || entityData.length === 0) {
        throw createError({
          statusCode: 404,
          message: 'Entité non trouvée',
        });
      }

      const entity = entityData[0];

      // 2. Récupérer les enfants directs via state_structure (relations actives seulement)
      const structureData = await cmsClient.request(
        readItems('state_structure', {
          filter: {
            parent_entity: { _eq: entity.id },
            date_valid_to: { _null: true }, // Relations actives uniquement
          },
          fields: [
            'id',
            'child_entity.id',
            'child_entity.public_slug',
            'child_entity.name',
            'child_entity.slug',
            'child_entity.has_public_page',
            'child_entity.type.code',
            'child_entity.type.label',
          ],
          sort: ['child_entity.name'],
          limit: -1,
        }),
      );

      // Extraire les enfants
      const children = structureData.map((s: any) => s.child_entity);

      // 3. Récupérer l'historique des rattachements (via state_structure)
      const historyData = await cmsClient.request(
        readItems('state_structure', {
          filter: {
            child_entity: { _eq: entity.id },
          },
          fields: [
            'id',
            'parent_entity.id',
            'parent_entity.name',
            'parent_entity.public_slug',
            'date_valid_from',
            'date_valid_to',
            'decree_reference',
          ],
          sort: ['-date_valid_from'],
          limit: -1,
        }),
      );

      return {
        entity,
        children: children || [],
        history: historyData || [],
      };
    } catch (error: any) {
      if (error.statusCode === 404) {
        throw error;
      }
      console.error('Error fetching state entity detail:', error);
      throw createError({
        statusCode: 500,
        message: "Erreur lors de la récupération des détails de l'entité",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache 1 heure
    name: 'state-entity-detail',
    getKey: (event) => {
      const slug = getRouterParam(event, 'slug');
      return `state-entity-${slug}`;
    },
  },
);
