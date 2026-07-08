import { readItems } from "@directus/sdk";
import type { NewsArticle } from "~/composables/news/useNews";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 9;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-date_published";
    const category = query.category as string;
    const featured = query.featured === "true";

    try {
      const directus = getCmsClient();

      const filter: any = {
        status: { _eq: "published" },
      };

      // Filtre par catégorie
      if (category && category !== "Toutes") {
        filter.category = {
          name: { _eq: category },
        };
      }

      // Filtre par featured
      if (featured) {
        filter.featured = { _eq: true };
      }

      // Filtre de recherche
      if (search) {
        filter._or = [
          { title: { _icontains: search } },
          { content: { _icontains: search } },
        ];
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Récupération des actualités avec pagination
      const newsData = await directus
        .request(
          readItems("news", {
            fields: [
              "id",
              "title",
              "slug",
              "date_published",
              "date_updated",
              "cover_image",
              "content",
              "featured",
              "tags",
              "category.name",
              "category.slug",
              "document.file",
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
            message: error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      // Récupération du total d'actualités
      const totalCount = await directus
        .request(
          readItems("news", {
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
        .catch(() => newsData.length);

      // Transformation des données - retourne uniquement les IDs, pas les URLs complètes
      // Les composables useCmsImage() et useCmsFile() se chargeront de générer les URLs proxy
      const transformedNews: NewsArticle[] = newsData.map((article) => ({
        id: article.id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        date_published: article.date_published,
        ...(article.date_updated ? { date_updated: article.date_updated } : {}),
        ...(article.cover_image
          ? { cover_image: article.cover_image }
          : {}),
        ...(article.featured !== undefined
          ? { featured: article.featured }
          : {}),
        ...(article.tags ? { tags: article.tags } : {}),
        ...(article.category
          ? {
              category: {
                name: article.category.name,
                slug: article.category.slug,
              },
            }
          : {}),
        ...(article.document?.file
          ? {
              document: {
                file: article.document.file,
              },
            }
          : {}),
      }));

      // Structure de retour cohérente avec documents
      return {
        data: transformedNews,
        totalNews: Number(totalCount),
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
          "Une erreur est survenue lors de la récupération des actualités",
      });
    }
  },
  {
    maxAge: 60 * 5, // 5 minutes
    name: "news",
    getKey: (event) => buildCacheKey("news", getQuery(event)),
  },
);
