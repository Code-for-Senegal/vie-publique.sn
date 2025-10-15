import { aggregate } from "@directus/sdk";

export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      const filter = {
        status: {
          _eq: "published",
        },
      };

      // ✅ Agrégation par type (utilise l'agrégation Directus - ULTRA RAPIDE)
      const typeStats = await directus.request(
        aggregate("positions", {
          aggregate: {
            count: ["id"],
          },
          groupBy: ["type"],
          query: {
            filter,
          },
        }),
      );

      // ✅ Agrégation par genre (utilise l'agrégation Directus)
      const genderStats = await directus.request(
        aggregate("positions", {
          aggregate: {
            count: ["id"],
          },
          groupBy: ["sexe"],
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

      // Transformation des résultats - Genre
      let maleCount = 0;
      let femaleCount = 0;
      genderStats.forEach((stat: any) => {
        if (stat.sexe === "Monsieur") {
          maleCount = parseInt(stat.count.id);
        } else if (stat.sexe === "Madame") {
          femaleCount = parseInt(stat.count.id);
        }
      });

      // Total global
      const totalResult = await directus.request(
        aggregate("positions", {
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
        totalsByGender: { maleCount, femaleCount },
        total,
      };
    } catch (error) {
      console.error("Error fetching nominations stats:", error);
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des statistiques",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure (les stats changent rarement)
    name: "nominations-stats",
    getKey: () => "nominations-stats",
  },
);
