/**
 * API Route: GET /api/state/entities
 * Liste paginée des entités publiques avec filtres
 */

import { readItems } from '@directus/sdk';
import type { StateEntityListResponse, StateEntityFilters } from '~/types/state-entity';

export default defineCachedEventHandler(
  async (event): Promise<StateEntityListResponse> => {
    const query = getQuery(event) as StateEntityFilters;
    const cmsClient = getCmsClient();

    // Pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || -1; // Par défaut tout récupérer
    const offset = (page - 1) * (limit > 0 ? limit : 0);

    // Construction des filtres Directus
    const filters: any = {};

    // Filtre par recherche (nom, slug)
    if (query.search) {
      filters._or = [
        { name: { _icontains: query.search } },
        { slug: { _icontains: query.search } },
      ];
    }

    // Filtre pour n'afficher que les entités avec page publique
    filters.has_public_page = { _eq: true };

    // Tri
    const sort = query.sort || ['name'];

    try {
      // Étape 1: Récupérer tous les types depuis state_type
      const types = await cmsClient.request(
        readItems('state_type', {
          fields: ['id', 'code', 'label'],
          limit: -1,
        })
      ).catch(() => []); // Si erreur, continuer sans types

      // Créer un map id -> type info
      const typesMap = new Map(types.map((t: any) => [t.id, { code: t.code, label: t.label }]));

      // Étape 2: Récupérer les entités
      const data = await cmsClient.request(
        readItems('state_entity', {
          fields: [
            'id',
            'public_slug',
            'name',
            'slug',
            'has_public_page',
            'type', // ID de la relation
            'business_key',
            'last_decree_reference',
          ],
          filter: filters,
          sort,
          limit: limit > 0 ? limit : -1,
          offset: limit > 0 ? offset : 0,
        }),
      );

      // Étape 3: Enrichir les données avec les infos de type
      const enrichedData = data.map((entity: any) => ({
        ...entity,
        type_info: typesMap.get(entity.type) || { code: 'other', label: 'Autre' },
      }));

      // Compte total
      const totalCount = await cmsClient
        .request(
          readItems('state_entity', {
            fields: ['id'],
            filter: filters,
            aggregate: {
              count: ['id'],
            },
          }),
        )
        .then((result: any) => result?.[0]?.count?.id || 0)
        .catch(() => data.length);

      return {
        data: enrichedData || [],
        meta: {
          total_count: Number(totalCount),
          filter_count: Number(totalCount),
          page,
          limit: limit > 0 ? limit : Number(totalCount),
          total_pages: limit > 0 ? Math.ceil(Number(totalCount) / limit) : 1,
        },
      };
    } catch (error) {
      console.error('Error fetching state entities:', error);
      throw createError({
        statusCode: 500,
        message: 'Erreur lors de la récupération des entités publiques',
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache 1 heure
    name: 'state-entities-list',
    getKey: (event) => buildCacheKey("state-entities-list", getQuery(event)),
  },
);
