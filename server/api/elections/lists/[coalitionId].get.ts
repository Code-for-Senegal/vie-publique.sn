// server/api/elections/lists/[coalitionId].get.ts
import { readItems } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

/**
 * Endpoint pour récupérer les listes électorales d'une coalition
 * Route: /api/elections/lists/[coalitionId]
 */
export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const coalitionId = getRouterParam(event, "coalitionId");

    if (!coalitionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID de coalition manquant",
      });
    }

    try {
      const lists = await directus.request(
        readItems("election_electoral_lists", {
          fields: [
            "name",
            "type",
            "is_substitute",
            "candidates.first_name",
            "candidates.last_name",
            "candidates.profession",
            "candidates.gender",
            "candidates.position",
            "candidates.photo",
            "candidates.biography",
            "candidates.voter_number",
            "constituency.name",
          ],
          filter: {
            coalition: { _eq: coalitionId },
          },
          limit: 400,
        })
      );

      return {
        data: lists,
      };
    } catch (error) {
      console.error(`Error fetching electoral lists for coalition ${coalitionId}:`, error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des listes électorales",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "election-lists",
    getKey: (event) => {
      const coalitionId = getRouterParam(event, "coalitionId");
      return `election-lists-${coalitionId}`;
    },
  }
);
