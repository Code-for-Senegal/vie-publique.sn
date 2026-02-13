import { readItems } from "@directus/sdk";
import type { PodcastEpisode } from "~~/types/podcast";

export default defineCachedEventHandler(
  async (event) => {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 12;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-date_published";
    const category = query.category as string;
    const featured = query.featured === "true";

    try {
      const directus = getCmsClient();

      const filter: any = {
        status: { _eq: "published" },
      };

      if (category && category !== "Toutes") {
        filter.category = {
          name: { _eq: category },
        };
      }

      if (featured) {
        filter.featured = { _eq: true };
      }

      if (search) {
        filter._or = [
          { title: { _icontains: search } },
          { description: { _icontains: search } },
        ];
      }

      const offset = (page - 1) * limit;

      const podcastsData = await directus
        .request(
          readItems("vp_podcasts", {
            fields: [
              "id",
              "title",
              "slug",
              "description",
              "youtube_video_id",
              "youtube_url",
              "duration",
              "date_published",
              "cover_image",
              "tags",
              "category.id",
              "category.name",
              "category.slug",
              "category.color",
              "featured",
              "view_count",
            ],
            filter,
            limit,
            offset,
            sort: [sortBy],
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message:
              error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      const totalCount = await directus
        .request(
          readItems("vp_podcasts", {
            fields: ["id"],
            filter,
            aggregate: {
              count: ["id"],
            },
          }),
        )
        .then((result: any) => {
          return result?.[0]?.count?.id || 0;
        })
        .catch(() => podcastsData.length);

      const transformedPodcasts: PodcastEpisode[] = podcastsData.map(
        (podcast: any) => ({
          id: podcast.id,
          title: podcast.title,
          slug: podcast.slug,
          description: podcast.description,
          youtube_video_id: podcast.youtube_video_id,
          youtube_url: podcast.youtube_url,
          duration: podcast.duration,
          date_published: podcast.date_published,
          ...(podcast.cover_image
            ? { cover_image: podcast.cover_image }
            : {}),
          ...(podcast.tags ? { tags: podcast.tags } : {}),
          ...(podcast.category
            ? {
                category: {
                  id: podcast.category.id,
                  name: podcast.category.name,
                  slug: podcast.category.slug,
                  color: podcast.category.color,
                },
              }
            : {}),
          ...(podcast.featured !== undefined
            ? { featured: podcast.featured }
            : {}),
          ...(podcast.view_count !== undefined
            ? { view_count: podcast.view_count }
            : {}),
        }),
      );

      return {
        data: transformedPodcasts,
        totalPodcasts: Number(totalCount),
        pagination: {
          page,
          limit,
          total: Number(totalCount),
          totalPages: Math.ceil(Number(totalCount) / limit),
        },
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des podcasts",
      });
    }
  },
  {
    maxAge: 60 * 5,
    name: "podcasts",
    getKey: (event) => {
      const query = getQuery(event);
      return `podcasts-${JSON.stringify(query)}`;
    },
  },
);
