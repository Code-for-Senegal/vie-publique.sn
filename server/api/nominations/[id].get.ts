import { readItem } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";
import type { GovernmentMember } from "~/types/government-member";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID de nomination manquant",
      });
    }

    try {
      const directus = getCmsClient();

      // Récupération de la nomination complète
      const nominationData = await directus
        .request(
          readItem("positions", id, {
            fields: [
              "id",
              "name",
              "sexe",
              "type",
              "role",
              "organisation",
              "nominationDate",
              "endDate",
              "photo",
              "formation",
              "predecessor",
              "rating",
              "description",
            ],
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 404,
            message:
              error.errors?.[0]?.message || "Nomination introuvable",
          });
        });

      // Transformation des données
      const transformedNomination: GovernmentMember = {
        id: nominationData.id,
        name: nominationData.name,
        sexe: nominationData.sexe,
        type: nominationData.type || null,
        role: nominationData.role,
        organisation: nominationData.organisation || null,
        nominationDate: nominationData.nominationDate,
        endDate: nominationData.endDate || "",
        photo: nominationData.photo
          ? `${config.cmsApiUrl}/assets/${nominationData.photo}`
          : null,
        formation: nominationData.formation || null,
        predecessor: nominationData.predecessor || null,
        rating: nominationData.rating || null,
        portrait: null, // TODO: Ajouter ce champ dans Directus si nécessaire
        description: nominationData.description || null,
      };

      return {
        nomination: transformedNomination,
      };
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Nomination non trouvée",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "nomination-detail",
    getKey: (event) => `nomination-${getRouterParam(event, "id")}`,
  },
);
