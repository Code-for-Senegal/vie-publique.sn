import { readItems } from '@directus/sdk'

export default defineCachedEventHandler(
  async (event) => {
    try {
      const query = getQuery(event);
      const electionId = query.election as string | undefined;

      // Récupérer le client CMS
      const cmsClient = getCmsClient();

      // Champs nécessaires pour les résultats
      const fields = [
        '*',
        'coalition_gagnante.name',
        'coalition_gagnante.color',
        'coalition_gagnante.logo',
        'constituencie.name',
        'constituencie.region',
        'constituencie.type',
        'constituencie.nationale_type',
        'election.id',
        'election.type',
        'election.year',
        'voters',
        'winning_list.is_substitute',
        'winning_list.candidates.first_name',
        'winning_list.candidates.last_name',
        'winning_list.candidates.position',
      ];

      // Appel API vers le CMS avec ou sans filtre
      const response = electionId
        ? await cmsClient.request(
            readItems('carte', {
              fields,
              filter: { election: { _eq: parseInt(electionId) } },
              limit: -1,
            })
          )
          : await cmsClient.request(
            readItems('carte', { fields ,
              limit: -1,
            })
          );

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de résultats:', error);

      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des données de résultats de carte'
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: 'carte-result',
    getKey: (event) => {
      const query = getQuery(event);
      return `carte-result-${query.election || 'all'}`;
    },
  },
);
