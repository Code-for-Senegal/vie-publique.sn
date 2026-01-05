import { aggregate, readItems } from "@directus/sdk";

/**
 * Endpoint pour récupérer les statistiques des listes électorales pour le dashboard
 * Route: /api/elections/dashboard/stats/lists
 *
 * Retourne le nombre de candidats par coalition, filtré par année et type d'élection
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getLocalCmsClient();
    const query = getQuery(event);
    const year = query.year ? parseInt(query.year as string) : null;
    const type = query.type as string;

    try {
      let electionFilter = {};

      // Si année et type sont fournis, récupérer l'ID de l'élection
      if (year && type) {
        const elections = await directus.request(
          readItems("elections", {
            fields: ["id"],
            filter: {
              year: { _eq: year },
              type: { _eq: type },
            },
            limit: 1,
          })
        );
        
        const electionId = elections[0]?.id;
        
        if (electionId) {
          electionFilter = { election: { _eq: electionId } };
        } else {
             // Si pas d'élection trouvée pour les critères, retourner vide
             return { data: [] };
        }
      }

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
              ...electionFilter,
            },
            sort: ["-count.id"],
          },
        })
      );

      return {
        data: statsData,
      };
    } catch (error) {
      console.error("Error fetching dashboard election stats lists:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des statistiques des listes électorales",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "election-dashboard-stats-lists",
    getKey: (event) => {
        const query = getQuery(event);
        return `election-dashboard-stats-lists-${query.year || "all"}-${query.type || "all"}`;
    }
  }
);
