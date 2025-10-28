/**
 * API Route: GET /api/state/entities/:slug
 * Détail d'une entité publique avec historique, enfants et fil d'Ariane
 */

import { readItems } from '@directus/sdk';
import type { StateEntityDetailResponse } from '~/types/state-entity';

export default defineCachedEventHandler(
  async (event): Promise<StateEntityDetailResponse> => {
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
        readItems('state_entities', {
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

      // 2. Récupérer les enfants directs
      const children = await cmsClient.request(
        readItems('state_entities', {
          filter: {
            parent_entity: { _eq: entity.id },
            status: { _eq: 'active' },
          },
          fields: [
            'id',
            'public_slug',
            'name',
            'short_name',
            'acronym',
            'type',
            'status',
            'director_name',
            'director_title',
            'website',
          ],
          sort: ['type', 'name'],
          limit: -1, // Tous les enfants
        }),
      );

      // 3. Récupérer l'historique des événements
      const history = await cmsClient.request(
        readItems('state_entity_events', {
          filter: {
            entity_id: { _eq: entity.id },
          },
          fields: [
            'id',
            'entity_id',
            'event_type',
            'event_date',
            'description',
            'legal_reference',
            'decree_number',
            'old_name',
            'new_name',
            'old_parent.id',
            'old_parent.name',
            'new_parent.id',
            'new_parent.name',
            'date_created',
          ],
          sort: ['-event_date'],
          limit: -1,
        }),
      );

      // 4. Construire le fil d'Ariane (breadcrumb)
      const breadcrumb = [];
      let currentEntity = entity;

      while (currentEntity.parent_entity) {
        // Si parent_entity est un objet
        if (
          typeof currentEntity.parent_entity === 'object' &&
          currentEntity.parent_entity !== null
        ) {
          breadcrumb.unshift(currentEntity.parent_entity);

          // Charger le parent suivant
          const parentData = await cmsClient.request(
            readItems('state_entities', {
              filter: { id: { _eq: currentEntity.parent_entity.id } },
              fields: [
                'id',
                'name',
                'public_slug',
                'type',
                'parent_entity.id',
                'parent_entity.name',
                'parent_entity.public_slug',
                'parent_entity.type',
              ],
              limit: 1,
            }),
          );

          if (parentData && parentData.length > 0) {
            currentEntity = parentData[0];
          } else {
            break;
          }
        } else {
          break;
        }
      }

      return {
        entity,
        children: children || [],
        history: history || [],
        breadcrumb,
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
