/**
 * API Route: GET /api/state/entities
 * Liste paginée des entités publiques avec filtres
 */

import { readItems } from '@directus/sdk'
import type { StateEntityListResponse, StateEntityFilters } from '~/types/state-entity'

export default defineCachedEventHandler(
  async (event): Promise<StateEntityListResponse> => {
    const query = getQuery(event) as StateEntityFilters
    const cmsClient = getCmsClient()

    // Pagination
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 20
    const offset = (page - 1) * limit

    // Construction des filtres Directus
    const filters: any = {}

    // Filtre par recherche (nom, acronyme, short_name)
    if (query.search) {
      filters._or = [
        { name: { _icontains: query.search } },
        { acronym: { _icontains: query.search } },
        { short_name: { _icontains: query.search } },
      ]
    }

    // Filtre par type
    if (query.type) {
      filters.type = { _eq: query.type }
    }

    // Filtre par statut (par défaut: active)
    if (query.status) {
      filters.status = { _eq: query.status }
    } else {
      filters.status = { _eq: 'active' }
    }

    // Filtre par entité parente
    if (query.parent_id !== undefined) {
      if (query.parent_id === null) {
        // Racines seulement (ministères)
        filters.parent_entity = { _null: true }
      } else {
        filters.parent_entity = { _eq: query.parent_id }
      }
    }

    // Tri
    const sort = query.sort || ['name']

    try {
      // Requête avec pagination et filtres
      const data = await cmsClient.request(
        readItems('state_entities', {
          fields: [
            'id',
            'public_slug',
            'name',
            'short_name',
            'acronym',
            'type',
            'status',
            'description',
            'mission',
            'parent_entity.id',
            'parent_entity.name',
            'parent_entity.public_slug',
            'address',
            'phone',
            'email',
            'website',
            'director_name',
            'director_title',
            'created_at',
            'dissolved_at',
            'legal_reference',
            'decree_number',
            'decree_date',
            'date_created',
            'date_updated',
          ],
          filter: filters,
          sort,
          limit,
          offset,
        }),
      )

      // Compte total
      const totalCount = await cmsClient
        .request(
          readItems('state_entities', {
            fields: ['id'],
            filter: filters,
            aggregate: {
              count: ['id'],
            },
          }),
        )
        .then((result: any) => result?.[0]?.count?.id || 0)
        .catch(() => data.length)

      return {
        data: data || [],
        meta: {
          total_count: Number(totalCount),
          filter_count: Number(totalCount),
          page,
          limit,
          total_pages: Math.ceil(Number(totalCount) / limit),
        },
      }
    } catch (error) {
      console.error('Error fetching state entities:', error)
      throw createError({
        statusCode: 500,
        message: 'Erreur lors de la récupération des entités publiques',
      })
    }
  },
  {
    maxAge: 60 * 60, // Cache 1 heure
    name: 'state-entities-list',
    getKey: (event) => {
      const query = getQuery(event)
      return `state-entities-${JSON.stringify(query)}`
    },
  },
)
