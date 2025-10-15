// server/api/elections/coalitions/index.get.ts
import { readItems } from "@directus/sdk";

/**
 * Endpoint pour récupérer la liste des coalitions
 * Route: /api/elections/coalitions
 *
 * Query params:
 * - ranking: boolean - Inclure les données de classement (voix, pourcentage, sièges)
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const query = getQuery(event);
    const ranking = query.ranking === "true";

    try {
      const fields: any[] = [
        "id",
        "name",
        "logo",
        "list_order",
        "bulletin",
        "head_of_list.photo",
        "head_of_list.first_name",
        "head_of_list.last_name",
      ];

      if (ranking) {
        fields.push(
          "voix",
          "pourcentage",
          "sieges",
          "sieges_departement"
        );
      }

      const coalitions = await directus.request(
        readItems("election_coalition", {
          fields,
          filter: {
            status: { _eq: "published" },
          },
          sort: ranking ? ["-voix"] : ["list_order"],
        })
      );

      return {
        data: coalitions,
      };
    } catch (error) {
      console.error("Error fetching coalitions:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des coalitions",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "election-coalitions",
    getKey: (event) => {
      const query = getQuery(event);
      return `election-coalitions-${query.ranking || "default"}`;
    },
  }
);
