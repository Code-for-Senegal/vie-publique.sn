import { aggregate } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

/**
 * Endpoint pour récupérer les statistiques des départements
 * GET /api/elections/map/department-stats?department=Dakar (optionnel)
 *
 * @returns Statistiques agrégées des départements
 */
export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const department = query.department as string | undefined;

    try {
      const directus = getCmsClient();

      // Paramètres de base pour l'agrégation
      interface AggregateParams {
        aggregate: {
          count: string[];
          sum: string[];
          countDistinct: string[];
        };
        query?: {
          filter: {
            department: {
              _eq: string;
            };
          };
          groupBy: string[];
        };
      }

      const aggregateParams: AggregateParams = {
        aggregate: {
          count: ["office_number"],
          sum: ["voters"],
          countDistinct: ["municipality", "polling_place"],
        },
      };

      // Si un département spécifique est demandé
      if (department) {
        aggregateParams.query = {
          filter: {
            department: {
              _eq: department,
            },
          },
          groupBy: ["department"],
        };
      }

      // Récupération des statistiques
      const statsData = await directus
        .request(
          aggregate("election_map_national", aggregateParams),
        )
        .catch((error) => {
          console.error("Erreur Directus:", error);
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message:
              error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      // Si on cherche un département spécifique, retourner le premier résultat
      if (department && statsData && statsData.length > 0) {
        return statsData[0];
      }

      return {
        data: statsData || [],
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des stats:", error);
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des statistiques",
      });
    }
  },
  {
    maxAge: 60 * 30, // 30 minutes de cache
    name: "election-department-stats",
    getKey: (event) => {
      const query = getQuery(event);
      const department = query.department as string | undefined;
      return department
        ? `department-stats-${department}`
        : "departments-stats-all";
    },
  },
);
