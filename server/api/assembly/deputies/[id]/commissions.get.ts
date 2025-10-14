// server/api/assembly/deputies/[id]/commissions.get.ts
import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID du député requis",
      });
    }

    try {
      // Récupérer les commissions auxquelles le député appartient
      const commissionsData = await directus.request(
        readItems("assembly_commission_assembly_deputy", {
          fields: [
            {
              assembly_commission_id: ["id", "name"],
            },
            "assembly_deputy_id",
          ],
          filter: {
            assembly_deputy_id: { _eq: id },
          },
        })
      );

      return {
        commissions: commissionsData,
      };
    } catch (error) {
      console.error(`Error fetching commissions for deputy ${id}:`, error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des commissions",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "assembly-deputy-commissions",
  }
);
