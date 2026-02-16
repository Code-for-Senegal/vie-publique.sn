import { readItems } from "@directus/sdk";
import type { PollingStation } from "~~/types/election-map-national";

/**
 * Endpoint pour récupérer les détails d'un département (bureaux de vote)
 * GET /api/elections/map/department-details/:department
 *
 * @returns Liste des bureaux de vote du département
 */
export default defineCachedEventHandler(
  async (event) => {
    const department = getRouterParam(event, "department");

    if (!department) {
      throw createError({
        statusCode: 400,
        statusMessage: "Le nom du département est requis",
      });
    }

    try {
      const directus = getCmsClient();

      // Récupération des bureaux de vote du département
      const pollingStations = await directus
        .request(
          readItems("election_map_national", {
            filter: {
              department: {
                _eq: decodeURIComponent(department),
              },
            },
            sort: ["municipality", "polling_place", "office_number"],
            limit: -1, // Récupérer tous les bureaux
          }),
        )
        .catch((error) => {
          console.error("Erreur Directus:", error);
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message:
              error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      return {
        data: pollingStations as PollingStation[],
        total: pollingStations.length,
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des détails du département ${department}:`,
        error,
      );
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des détails du département",
      });
    }
  },
  {
    maxAge: 60 * 30, // 30 minutes de cache
    name: "election-department-details",
    getKey: (event) => {
      const department = getRouterParam(event, "department");
      return `department-details-${department}`;
    },
  },
);
