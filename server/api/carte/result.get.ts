import { readItems } from '@directus/sdk'

export default defineCachedEventHandler(
  async (event) => {
    try {
      // Récupérer le client CMS
      const cmsClient = getCmsClient();

      // Appel API vers le CMS pour les résultats avec les champs nécessaires
      const response = await cmsClient.request(
        readItems('carte', {
          fields: [
            '*',
            'coalition_gagnante.name',
            'coalition_gagnante.color',
            'coalition_gagnante.logo',
            'constituencie.name',
            'constituencie.region',
            'constituencie.type',
            'constituencie.nationale_type',
            'election.type',
            'election.year',
            'voters',
            'liste_gagnante.is_substitute',
            'liste_gagnante.candidates.first_name',
            'liste_gagnante.candidates.last_name',
            'liste_gagnante.candidates.position',
          ],
        }),
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
  },
);
