// server/api/elections/bureaux-temoins.get.ts

/**
 * Endpoint pour récupérer les bureaux témoins
 * Route: /api/elections/bureaux-temoins
 *
 * Utilise l'API externe sunuElectionApiUrl
 */
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Vérification de la configuration
    if (!config.public.sunuElectionApiUrl || !config.public.sunuElectionApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Configuration de l'API électorale manquante",
      });
    }

    try {
      // Appel à l'API externe via le serveur Nuxt
      const response = await $fetch(
        `${config.public.sunuElectionApiUrl}/bureaux/temoins`,
        {
          headers: {
            "api-key": config.public.sunuElectionApiKey,
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error("Error fetching bureaux temoins:", error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage:
          error.message || "Erreur lors de la récupération des bureaux témoins",
      });
    }
  },
  {
    maxAge: 60 * 5, // Cache de 5 minutes
    name: "election-bureaux-temoins",
  }
);
