import { readItem } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID de l'actualité manquant",
      });
    }

    try {
      const directus = getCmsClient();

      const newsData = await directus.request(
        readItem("news", id, {
          fields: [
            "id",
            "title",
            "slug",
            "status",
            "date_published",
            "date_updated",
            "cover_image",
            "content",
            "tags",
            "featured",
            "category.name",
            "category.slug",
            "document.file",
          ],
        }),
      );

      // Vérifier si l'article est publié
      if (newsData.status !== "published") {
        throw createError({
          statusCode: 404,
          statusMessage: "Article non trouvé",
        });
      }

      // Retourne uniquement les IDs - les composables client transformeront en URLs proxy
      const article = {
        id: newsData.id,
        title: newsData.title,
        slug: newsData.slug,
        date_published: newsData.date_published,
        content: newsData.content,
        ...(newsData.date_updated
          ? { date_updated: newsData.date_updated }
          : {}),
        ...(newsData.cover_image
          ? { cover_image: newsData.cover_image }
          : {}),
        ...(newsData.featured !== undefined
          ? { featured: newsData.featured }
          : {}),
        ...(newsData.tags ? { tags: newsData.tags } : {}),
        ...(newsData.category
          ? {
              category: {
                name: newsData.category.name,
                slug: newsData.category.slug,
              },
            }
          : {}),
        ...(newsData.document?.file
          ? {
              document: {
                file: newsData.document.file,
              },
            }
          : {}),
      };

      // Structure cohérente avec documents
      return {
        data: article, // Gardé "data" pour cohérence avec useCmsCollection
      };
    } catch (error: any) {
      console.error(
        `Erreur lors de la récupération de l'actualité ${id}:`,
        error,
      );

      if (error.statusCode) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération de l'actualité",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "news-detail",
    getKey: (event) => {
      const id = getRouterParam(event, "id");
      return `news-detail-${id}`;
    },
  },
);
