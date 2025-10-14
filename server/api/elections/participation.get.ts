// server/api/elections/participation.get.ts
import { readItems } from "@directus/sdk";

/**
 * Endpoint pour récupérer les données de participation par département
 * Route: /api/elections/participation
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();

    try {
      // Récupération des données de participation depuis la collection "carte"
      const participationData = await directus.request(
        readItems("carte", {
          fields: [
            "departement",
            "region",
            "voters",
            "participation_10h",
            "participation_12h",
            "participation_14h",
            "participation_17h",
          ],
          sort: ["region", "departement"],
        })
      );

      return participationData;
    } catch (error) {
      console.error("Error fetching participation data:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des données de participation",
      });
    }
  },
  {
    maxAge: 5 * 60, // Cache de 5 minutes (données en temps réel)
    name: "election-participation",
  }
);
