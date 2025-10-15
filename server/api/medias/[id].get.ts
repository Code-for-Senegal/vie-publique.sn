import { readItem } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID du média manquant",
      });
    }

    try {
      const directus = getCmsClient();

      // Récupération du média complet
      const mediaData = await directus
        .request(
          readItem("media", id, {
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
              "status",
            ],
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 404,
            message: error.errors?.[0]?.message || "Média introuvable",
          });
        });

      // Transformation des données
      const transformedMedia = {
        id: mediaData.id,
        name: mediaData.name,
        type: mediaData.type,
        logo: mediaData.logo
          ? `${config.cmsApiUrl}/assets/${mediaData.logo}`
          : null,
        facebook: mediaData.facebook || null,
        website: mediaData.website || null,
        instagram: mediaData.instagram || null,
        tiktok: mediaData.tiktok || null,
        twitter: mediaData.twitter || null,
        youtube: mediaData.youtube || null,
        description: mediaData.description || null,
        group: mediaData.group || null,
      };

      return {
        media: transformedMedia,
      };
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Média non trouvé",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "media-detail",
    getKey: (event) => `media-${getRouterParam(event, "id")}`,
  },
);
