import { aggregate } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      const filter = {
        status: {
          _eq: "compliant",
        },
      };

      // ✅ Agrégation par type (utilise l'agrégation Directus - ULTRA RAPIDE)
      const typeStats = await directus.request(
        aggregate("media", {
          aggregate: {
            count: ["id"],
          },
          groupBy: ["type"],
          query: {
            filter,
          },
        }),
      );

      // Transformation des résultats - Type
      const totalsByType: Record<string, number> = {};
      typeStats.forEach((stat: any) => {
        // Ignore les types null
        if (stat.type && stat.type !== null) {
          totalsByType[stat.type] = parseInt(stat.count.id);
        }
      });

      // Total global
      const totalResult = await directus.request(
        aggregate("media", {
          aggregate: {
            count: ["id"],
          },
          query: {
            filter,
          },
        }),
      );

      const total = totalResult[0]?.count?.id
        ? parseInt(totalResult[0].count.id)
        : 0;

      return {
        totalsByType: Object.fromEntries(
          Object.entries(totalsByType).sort(([a], [b]) => a.localeCompare(b)),
        ),
        total,
      };
    } catch (error) {
      console.error("Error fetching medias stats:", error);
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des statistiques",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure (les stats changent rarement)
    name: "medias-stats",
    getKey: () => "medias-stats",
  },
);
