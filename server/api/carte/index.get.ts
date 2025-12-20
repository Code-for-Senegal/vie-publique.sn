import { readItems } from '@directus/sdk'

export default defineCachedEventHandler(
  async (event) => {
    try {
      // Récupérer le client CMS
      const cmsClient = getCmsClient();

      // Appel API vers le CMS
      const response = await cmsClient.request(readItems('carte'));

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
  },
);
