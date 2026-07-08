import { readItems } from '@directus/sdk'

export default defineCachedEventHandler(
  async (event) => {
    try {
      const query = getQuery(event);
      const electionId = query.election as string | undefined;

      // Récupérer le client CMS
      const cmsClient = getCmsClient();

      // Construire les options de requête
      const fields = ['*', 'election.id', 'election.type', 'election.year'];

      // Appel API vers le CMS avec ou sans filtre
      // Limite à -1 pour récupérer tous les enregistrements (communes peuvent être nombreuses ~543)
      const response = electionId
        ? await cmsClient.request(
            readItems('carte', {
              fields,
              filter: { election: { _eq: parseInt(electionId) } },
              limit: -1
            })
          )
        : await cmsClient.request(
            readItems('carte', { fields, limit: -1 })
          );

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des données de carte:', error);

      throw createError({
        statusCode: 500,
        statusMessage: 'Erreur lors de la récupération des données de carte'
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: 'carte',
    getKey: (event) => {
      const query = getQuery(event);
      return `carte-${query.election || 'all'}`;
    },
  },
);
