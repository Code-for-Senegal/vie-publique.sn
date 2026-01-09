import { readItem } from '@directus/sdk';

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const id = getRouterParam(event, 'id');

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID du vote parlementaire manquant',
      });
    }

    try {
      const directus = getCmsClient();

      // Récupération du vote avec les bons champs (ceux utilisés dans index.get.ts et [id].vue)
      const voteData = await directus
        .request(
          readItem('assembly_vote', id, {
            fields: [
              'id',
              'name',
              'desc',
              'description',
              'date',
              'status',
              'type',
              'voters',
              'voters_for',
              'voters_against',
              'voters_abstention',
              'number',
            ],
          }),
        )
        .catch((error) => {
          console.error('Directus Error:', error);
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 404,
            message: error.errors?.[0]?.message || 'Vote parlementaire introuvable',
          });
        });

      // On retourne directement l'objet vote, ou on peut le transformer si nécessaire
      // Le frontend attend { vote: ... }
      return {
        vote: voteData,
      };
    } catch (error: any) {
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.statusMessage || 'Erreur lors de la récupération du vote',
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: 'assembly-vote-detail',
    getKey: (event) => `assembly-vote-${getRouterParam(event, 'id')}`,
  },
);
