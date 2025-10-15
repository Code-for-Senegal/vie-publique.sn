import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 50;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-id";
    const filterType = query.filterType as string; // Type de média

    try {
      const directus = getCmsClient();

      // Construction du filtre dynamique
      const filter: any = {
        status: {
          _eq: "compliant",
        },
      };

      // Filtre par type de média (television, radio, presse_ecrite, en_ligne, audiovisuel)
      if (filterType && filterType !== "all") {
        filter.type = {
          _eq: filterType,
        };
      }

      // Recherche textuelle (nom du média)
      if (search) {
        filter._or = [
          {
            name: {
              _icontains: search,
            },
          },
        ];
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Récupération des médias avec pagination
      const mediaData = await directus
        .request(
          readItems("media", {
            fields: [
              "id",
              "name",
              "type",
              "logo",
              "facebook",
              "website",
              "instagram",
              "tiktok",
              "twitter",
              "youtube",
              "description",
              "group.name",
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

      // Récupération du total de médias
      const totalCount = await directus
        .request(
          readItems("media", {
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
        .catch(() => mediaData.length);

      // Transformation des données
      const transformedMedias = mediaData.map((media) => ({
        id: media.id,
        name: media.name,
        type: media.type,
        logo: media.logo ? `${config.cmsApiUrl}/assets/${media.logo}` : null,
        facebook: media.facebook || null,
        website: media.website || null,
        instagram: media.instagram || null,
        tiktok: media.tiktok || null,
        twitter: media.twitter || null,
        youtube: media.youtube || null,
        description: media.description || null,
        group: media.group || null,
      }));

      return {
        medias: transformedMedias,
        totalMedias: Number(totalCount),
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
          "Une erreur est survenue lors de la récupération des médias",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "medias",
    getKey: (event) => {
      const query = getQuery(event);
      return `medias-${JSON.stringify(query)}`;
    },
  },
);
