// server/api/elections/diaspora/countries.get.ts
import { readItems } from "@directus/sdk";

/**
 * Endpoint pour récupérer les statistiques des pays de la diaspora
 * Route: /api/elections/diaspora/countries
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();

    try {
      // Récupération des données agrégées par pays
      const countriesData = await directus.request(
        readItems("election_map_diaspora", {
          limit: 2000,
          groupBy: ["country"],
          aggregate: {
            count: ["polling_place", "office_number"],
            sum: ["voters"],
            countDistinct: ["polling_place"],
          },
        })
      );

      return {
        countries: countriesData,
      };
    } catch (error) {
      console.error("Error fetching diaspora countries:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des pays de la diaspora",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "election-diaspora-countries",
  }
);
