import { readItems } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const sortBy = (query.sortBy as string) || "rank";

    try {
      const directus = getCmsClient();

      // Récupération des membres du bureau de l'assemblée (pas de pagination, liste limitée)
      const officeData = await directus
        .request(
          readItems("assembly_office", {
            fields: [
              "id",
              "role",
              "rank",
              "deputy.id",
              "deputy.gender",
              "deputy.first_name",
              "deputy.last_name",
              "deputy.profession",
              "deputy.birthplace",
              "deputy.birthdate",
              "deputy.photo",
              "deputy.group.name",
              "deputy.group.color",
            ],
            sort: [sortBy],
            limit: 50, // Bureau limité
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message: error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      // Transformation des données
      const transformedOffice = officeData.map((member) => ({
        id: member.id,
        role: member.role,
        rank: member.rank || null,
        deputy: member.deputy
          ? {
              id: member.deputy.id,
              first_name: member.deputy.first_name,
              last_name: member.deputy.last_name,
              gender: member.deputy.gender || null,
              photo: member.deputy.photo
                ? `${config.cmsApiUrl}/assets/${member.deputy.photo}`
                : null,
              profession: member.deputy.profession || null,
              birthplace: member.deputy.birthplace || null,
              birthdate: member.deputy.birthdate || null,
              group: member.deputy.group || null,
            }
          : null,
      }));

      return {
        office: transformedOffice,
        totalMembers: transformedOffice.length,
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "Une erreur est survenue lors de la récupération du bureau de l'assemblée",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "assembly-office",
    getKey: (event) => {
      const query = getQuery(event);
      return `assembly-office-${JSON.stringify(query)}`;
    },
  },
);
