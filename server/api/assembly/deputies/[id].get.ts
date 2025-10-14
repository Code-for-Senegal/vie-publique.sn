// server/api/assembly/deputies/[id].get.ts
import { readItem } from "@directus/sdk";

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
      const deputy = await directus.request(
        readItem("assembly_deputy", id, {
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
            status: { _eq: "active" },
          },
        })
      );

      return {
        deputy,
      };
    } catch (error) {
      console.error(`Error fetching deputy ${id}:`, error);
      throw createError({
        statusCode: 404,
        statusMessage: "Député non trouvé",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "assembly-deputy-detail",
  }
);
