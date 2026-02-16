// server/api/elections/map/national.get.ts
import { readItems, aggregate } from "@directus/sdk";

/**
 * Endpoint pour récupérer les données de la carte électorale nationale
 * Route: /api/elections/map/national
 *
 * Query params:
 * - department: Filtrer par département spécifique
 * - groupBy: Grouper par département pour obtenir les statistiques
 * - election: ID de l'élection pour filtrer les données
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const query = getQuery(event);

    const department = query.department as string | undefined;
    const groupByDepartment = query.groupBy === "department";
    const electionId = query.election as string | undefined;

    try {
      // Construire le filtre de base avec l'élection si fournie
      const buildFilter = (additionalFilters: Record<string, any> = {}) => {
        const filter: any = { ...additionalFilters };
        if (electionId) {
          filter.election = { _eq: parseInt(electionId) };
        }
        return filter;
      };

      // Si on demande les statistiques groupées par département
      if (groupByDepartment) {
        const filter = buildFilter(
          department ? { department: { _eq: department } } : {}
        );

        const statsData = await directus.request(
          aggregate("election_map_national", {
            aggregate: {
              count: ["polling_place", "office_number"],
              sum: ["voters"],
              countDistinct: ["municipality", "polling_place"],
            },
            groupBy: ["department"],
            query: {
              filter,
              limit: 2000,
            },
          })
        );

        return {
          data: statsData,
        };
      }

      // Si on demande les détails d'un département
      if (department) {
        const filter = buildFilter({ department: { _eq: department } });

        const pollingStations = await directus.request(
          readItems("election_map_national", {
            fields: [
              "id",
              "department",
              "municipality",
              "polling_place",
              "office_number",
              "voters",
              "region",
            ],
            filter,
            limit: 2000,
            sort: ["municipality", "polling_place", "office_number"],
          })
        );

        return {
          data: pollingStations,
        };
      }

      // Par défaut, retourner les statistiques de tous les départements
      const filter = buildFilter();

      const allStats = await directus.request(
        aggregate("election_map_national", {
          aggregate: {
            count: ["polling_place", "office_number"],
            sum: ["voters"],
            countDistinct: ["municipality", "polling_place"],
          },
          groupBy: ["department"],
          query: {
            filter: Object.keys(filter).length > 0 ? filter : undefined,
            limit: 2000,
          },
        })
      );

      return {
        data: allStats,
      };
    } catch (error) {
      console.error("Error fetching election map national data:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des données de la carte nationale",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "election-map-national",
    getKey: (event) => {
      const query = getQuery(event);
      return `election-map-national-${JSON.stringify(query)}`;
    },
  }
);
