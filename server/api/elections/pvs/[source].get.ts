// server/api/elections/pvs/[source].get.ts

/**
 * Endpoint pour récupérer les procès-verbaux (PVs) électoraux
 * Route: /api/elections/pvs/national ou /api/elections/pvs/etranger
 *
 * Utilise l'API externe sunuElectionApiUrl
 */
export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const source = getRouterParam(event, "source");

    // Validation de la source
    if (source !== "national" && source !== "etranger") {
      throw createError({
        statusCode: 400,
        statusMessage: "Source invalide. Utilisez 'national' ou 'etranger'",
      });
    }

    // Vérification de la configuration
    if (!config.sunuElectionApiUrl || !config.sunuElectionApiKey) {
      throw createError({
        statusCode: 500,
        statusMessage: "Configuration de l'API électorale manquante",
      });
    }

    try {
      // Appel à l'API externe via le serveur Nuxt
      const response = await $fetch(
        `${config.sunuElectionApiUrl}/pvs/${source}`,
        {
          headers: {
            "api-key": config.sunuElectionApiKey,
          },
        }
      );

      return response;
    } catch (error: any) {
      console.error(`Error fetching PVs for ${source}:`, error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage:
          error.message || "Erreur lors de la récupération des procès-verbaux",
      });
    }
  },
  {
    maxAge: 30, // Cache de 30 secondes (données en temps réel)
    name: "election-pvs",
  }
);
