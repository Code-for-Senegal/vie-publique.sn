/**
 * API Route: GET /api/state/tree
 * Arbre hiérarchique complet des entités publiques
 * Retourne la structure complète pour l'affichage en arbre
 */

import { readItems } from '@directus/sdk'
import type { StateEntityTreeNode } from '~/types/state-entity'

export default defineCachedEventHandler(
  async (event): Promise<StateEntityTreeNode[]> => {
    const cmsClient = getCmsClient()

    try {
      // Récupérer toutes les entités actives
      const entities = await cmsClient.request(
        readItems('state_entities', {
          filter: {
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
            'parent_entity',
            'director_name',
            'director_title',
          ],
          sort: ['type', 'name'],
          limit: -1, // Toutes les entités
        }),
      )

      // Construire un map pour accès rapide
      const entityMap = new Map<number, StateEntityTreeNode>()
      entities.forEach((entity) => {
        entityMap.set(entity.id, {
          ...entity,
          children: [],
          level: 0,
        })
      })

      // Construire l'arbre hiérarchique
      const roots: StateEntityTreeNode[] = []

      entities.forEach((entity) => {
        const node = entityMap.get(entity.id)!

        if (entity.parent_entity) {
          // Entité avec parent
          const parentId =
            typeof entity.parent_entity === 'object'
              ? entity.parent_entity.id
              : entity.parent_entity

          const parent = entityMap.get(parentId)
          if (parent) {
            node.level = parent.level + 1
            parent.children.push(node)
          } else {
            // Parent non trouvé, traiter comme racine
            roots.push(node)
          }
        } else {
          // Entité racine (ministère)
          roots.push(node)
        }
      })

      // Trier récursivement les enfants
      const sortChildren = (nodes: StateEntityTreeNode[]) => {
        nodes.sort((a, b) => {
          // D'abord par type
          if (a.type !== b.type) {
            return a.type.localeCompare(b.type)
          }
          // Ensuite par nom
          return a.name.localeCompare(b.name)
        })

        nodes.forEach((node) => {
          if (node.children.length > 0) {
            sortChildren(node.children)
          }
        })
      }

      sortChildren(roots)

      return roots
    } catch (error) {
      console.error('Error fetching state tree:', error)
      throw createError({
        statusCode: 500,
        message: "Erreur lors de la récupération de l'arbre hiérarchique",
      })
    }
  },
  {
    maxAge: 60 * 60, // Cache 1 heure
    name: 'state-tree',
  },
)
