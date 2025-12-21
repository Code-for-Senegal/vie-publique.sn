import { readItems } from '@directus/sdk';
import type { Contributor } from '~/types/contributor';

/**
 * Endpoint pour récupérer la liste des contributeurs depuis Directus
 * GET /api/contributors
 *
 * @returns Liste des contributeurs avec cache de 30 minutes
 */
export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      // Récupération des contributeurs publiés
      // Note: On demande uniquement les champs confirmés par le snippet utilisateur
      const contributorsData = await directus
        .request(
          readItems('vp_team', {
            fields: [
              'id',
              'name',
              'first_name',
              'last_name',
              'job',
              'role',
              'image',
              'gender',
              'order',
              'status',
              'linkedin',
            ],
            sort: ['order'],
            filter: {
              status: {
                _eq: 'published',
              },
            },
          }),
        )
        .catch((error) => {
          console.error('Directus Error Details:', JSON.stringify(error, null, 2));
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message:
              error.errors?.[0]?.message || 'Erreur interne du serveur lors de la connexion CMS',
          });
        });

      // Transformation des données
      const transformedContributors: Contributor[] = contributorsData.map((contributor) => ({
        id: contributor.id,
        name: contributor.name,
        first_name: contributor.first_name || '',
        last_name: contributor.last_name || '',
        role: contributor.role || null,
        job: contributor.job || '',
        description: '', // Champ non présent dans l'API selon le snippet
        image: contributor.image || null,
        gender: contributor.gender || 'M',
        order: contributor.order || 0,
        status: contributor.status,
        linkedin: contributor.linkedin || null, // On tente de le récupérer si dispo
      }));

      return {
        data: transformedContributors,
        total: transformedContributors.length,
      };
    } catch (error: any) {
      console.error('Erreur lors de la récupération des contributeurs:', error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage:
          error.message || 'Une erreur est survenue lors de la récupération des contributeurs',
      });
    }
  },
  {
    maxAge: 60 * 30, // 30 minutes de cache
    name: 'contributors',
    getKey: () => 'contributors-list',
  },
);
