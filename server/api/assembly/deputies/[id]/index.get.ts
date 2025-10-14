// server/api/assembly/deputies/[id]/index.get.ts
import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "L'ID du député est requis",
      });
    }

    try {
      // Récupération du député par ID
      const deputyData = await directus.request(
        readItems("assembly_deputy", {
          fields: [
            "id",
            "gender",
            "biography",
            "facebook",
            "twitter",
            "bio",
            "first_name",
            "last_name",
            "profession",
            "birthplace",
            "birthdate",
            "photo",
            "residence",
            {
              electoral_list: [
                "name",
                "type",
                {
                  coalition: ["name", "color"],
                  constituency: ["name"],
                },
              ],
            },
            {
              group: ["name", "color"],
            },
          ],
          filter: {
            id: { _eq: id },
            status: { _eq: "active" },
          },
          limit: 1,
        })
      );

      if (!deputyData || deputyData.length === 0) {
        throw createError({
          statusCode: 404,
          statusMessage: "Député non trouvé",
        });
      }

      return {
        deputy: deputyData[0],
      };
    } catch (error: any) {
      // Si c'est déjà une erreur createError, on la relance
      if (error.statusCode) {
        throw error;
      }

      console.error("Error fetching deputy:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération du député",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "assembly-deputy-detail",
    getKey: (event) => `deputy-${getRouterParam(event, "id")}`,
  }
);
