// server/api/elections/results/departments.get.ts

/**
 * Endpoint pour récupérer les résultats électoraux par département
 * Route: /api/elections/results/departments
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
        `${config.public.sunuElectionApiUrl}/results/departments`,
        {
          headers: {
            "api-key": config.public.sunuElectionApiKey,
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error("Error fetching election results:", error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage:
          error.message || "Erreur lors de la récupération des résultats électoraux",
      });
    }
  },
  {
    maxAge: 30, // Cache de 30 secondes (données en temps réel)
    name: "election-results-departments",
  }
);
