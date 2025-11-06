/**
 * API Route: GET /api/state/tree
 * Arbre hiérarchique complet des entités publiques
 * Retourne la structure complète pour l'affichage en arbre
 */

import { readItems } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event): Promise<any[]> => {
    const cmsClient = getCmsClient();

    try {
      // Récupérer toutes les structures actives (avec leurs entités)
      const structures = await cmsClient.request(
        readItems('state_structure', {
          filter: {
            date_valid_to: { _null: true }, // Relations actives uniquement
          },
          fields: [
            'id',
            'parent_entity.id',
            'parent_entity.name',
            'parent_entity.public_slug',
            'parent_entity.slug',
            'parent_entity.has_public_page',
            'parent_entity.type.code',
            'parent_entity.type.label',
            'child_entity.id',
            'child_entity.name',
            'child_entity.public_slug',
            'child_entity.slug',
            'child_entity.has_public_page',
            'child_entity.type.code',
            'child_entity.type.label',
          ],
          limit: -1,
        }),
      );

      // Récupérer aussi les racines (entités sans parent)
      const roots = await cmsClient.request(
        readItems('state_entity', {
          filter: {
            has_public_page: { _eq: true },
          },
          fields: [
            'id',
            'name',
            'public_slug',
            'slug',
            'has_public_page',
            'type', // Récupérer juste l'ID de type pour le moment
          ],
          sort: ['name'],
          limit: -1,
        }),
      );

      // Construire l'arbre : retourner simplement les racines avec un compteur d'enfants
      const treeData = roots.map((root: any) => {
        // Compter les enfants directs
        const childrenCount = structures.filter(
          (s: any) => s.parent_entity?.id === root.id
        ).length;

        return {
          ...root,
          children_count: childrenCount,
          children: [], // Les enfants seront chargés à la demande
        };
      });

      return treeData;
    } catch (error) {
      console.error('Error fetching state tree:', error);
      throw createError({
        statusCode: 500,
        message: "Erreur lors de la récupération de l'arbre hiérarchique",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache 1 heure
    name: 'state-tree',
  },
);
