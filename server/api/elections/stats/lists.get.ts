// server/api/elections/stats/lists.get.ts
import { aggregate } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

/**
 * Endpoint pour récupérer les statistiques des listes électorales
 * Route: /api/elections/stats/lists
 *
 * Retourne le nombre de candidats par coalition
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();

    try {
      const statsData = await directus.request(
        aggregate("election_electoral_lists", {
          aggregate: {
            count: ["id"],
          },
          groupBy: ["coalition"],
          query: {
            filter: {
              is_substitute: { _eq: false },
              type: { _in: ["departmental", "diaspora"] },
            },
            sort: ["-count.id"],
          },
        })
      );

      return {
        data: statsData,
      };
    } catch (error) {
      console.error("Error fetching election stats lists:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des statistiques des listes électorales",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "election-stats-lists",
  }
);
