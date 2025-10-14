import { aggregate } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

/**
 * Endpoint pour récupérer les statistiques d'un pays de la diaspora
 * GET /api/elections/diaspora/country-stats/:country
 *
 * @returns Statistiques agrégées du pays (localités, bureaux, électeurs)
 */
export default defineCachedEventHandler(
  async (event) => {
    const country = getRouterParam(event, "country");

    if (!country) {
      throw createError({
        statusCode: 400,
        statusMessage: "Le nom du pays est requis",
      });
    }

    try {
      const directus = getCmsClient();

      // Récupération des statistiques agrégées
      const statsData = await directus
        .request(
          aggregate("election_map_diaspora", {
            query: {
              filter: {
                country: {
                  _eq: decodeURIComponent(country),
                },
              },
              groupBy: ["country"],
            },
            aggregate: {
              count: ["office_number", "polling_place"],
              sum: ["voters"],
              countDistinct: ["locality", "polling_place"],
            },
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

      // Retourner les stats du pays (premier élément du tableau)
      return {
        data: statsData && statsData.length > 0 ? statsData[0] : null,
      };
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des stats du pays ${country}:`,
        error,
      );
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des statistiques",
      });
    }
  },
  {
    maxAge: 60 * 30, // 30 minutes de cache
    name: "diaspora-country-stats",
    getKey: (event) => {
      const country = getRouterParam(event, "country");
      return `diaspora-stats-${country}`;
    },
  },
);
