import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async () => {
    try {
      const directus = getCmsClient();

      const categories = await directus.request(
        readItems("podcast_category", {
          fields: ["id", "name", "slug", "description", "color"],
          sort: ["sort", "name"],
        }),
      );

      return {
        data: categories,
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des catégories",
      });
    }
  },
  {
    maxAge: 60 * 60,
    name: "podcast-categories",
    getKey: () => "podcast-categories",
  },
);
