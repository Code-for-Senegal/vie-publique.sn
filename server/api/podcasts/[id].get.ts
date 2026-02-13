import { readItem } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID du podcast manquant",
      });
    }

    try {
      const directus = getCmsClient();

      const podcastData = await directus.request(
        readItem("vp_podcasts", id, {
          fields: [
            "id",
            "title",
            "slug",
            "status",
            "description",
            "youtube_video_id",
            "youtube_url",
            "duration",
            "date_published",
            "date_updated",
            "cover_image",
            "tags",
            "category.id",
            "category.name",
            "category.slug",
            "category.color",
            "featured",
            "view_count",
          ],
        }),
      );

      if (podcastData.status !== "published") {
        throw createError({
          statusCode: 404,
          statusMessage: "Podcast non trouvé",
        });
      }

      const podcast = {
        id: podcastData.id,
        title: podcastData.title,
        slug: podcastData.slug,
        description: podcastData.description,
        youtube_video_id: podcastData.youtube_video_id,
        youtube_url: podcastData.youtube_url,
        duration: podcastData.duration,
        date_published: podcastData.date_published,
        ...(podcastData.date_updated
          ? { date_updated: podcastData.date_updated }
          : {}),
        ...(podcastData.cover_image
          ? { cover_image: podcastData.cover_image }
          : {}),
        ...(podcastData.tags ? { tags: podcastData.tags } : {}),
        ...(podcastData.category
          ? {
              category: {
                id: podcastData.category.id,
                name: podcastData.category.name,
                slug: podcastData.category.slug,
                color: podcastData.category.color,
              },
            }
          : {}),
        ...(podcastData.featured !== undefined
          ? { featured: podcastData.featured }
          : {}),
        ...(podcastData.view_count !== undefined
          ? { view_count: podcastData.view_count }
          : {}),
      };

      return {
        data: podcast,
      };
    } catch (error: any) {
      console.error(
        `Erreur lors de la récupération du podcast ${id}:`,
        error,
      );

      if (error.statusCode) {
        throw error;
      }

      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération du podcast",
      });
    }
  },
  {
    maxAge: 60 * 60,
    name: "podcast-detail",
    getKey: (event) => {
      const id = getRouterParam(event, "id");
      return `podcast-detail-${id}`;
    },
  },
);
