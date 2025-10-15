import { readItems } from "@directus/sdk";
import type { Partner } from "~/types/partner";

/**
 * Endpoint pour récupérer la liste des partenaires depuis Directus
 * GET /api/partners
 *
 * @returns Liste des partenaires avec cache de 30 minutes
 */
export default defineCachedEventHandler(
  async () => {
    const config = useRuntimeConfig();

    try {
      const directus = getCmsClient();

      // Récupération des partenaires publiés
      const partnersData = await directus
        .request(
          readItems("vp_partners", {
            fields: ["id", "name", "logo", "website", "status"],
            sort: ["name"],
            filter: {
              status: {
                _eq: "published"
              }
            }
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message:
              error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      // Transformation des données avec URLs complètes pour les logos
      const transformedPartners: Partner[] = partnersData.map((partner) => ({
        id: partner.id,
        name: partner.name,
        logo: partner.logo
          ? `${config.cmsApiUrl}/assets/${partner.logo}`
          : "",
        website: partner.website || "",
        status: partner.status,
      }));

      return {
        data: transformedPartners,
        total: transformedPartners.length,
      };
    } catch (error) {
      console.error("Erreur lors de la récupération des partenaires:", error);
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération des partenaires",
      });
    }
  },
  {
    maxAge: 60 * 30, // 30 minutes de cache
    name: "partners",
    getKey: () => "partners-list",
  },
);
