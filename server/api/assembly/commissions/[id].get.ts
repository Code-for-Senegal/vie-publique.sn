import { readItem } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID de la commission manquant",
      });
    }

    try {
      const directus = getCmsClient();

      // Récupération de la commission complète
      const commissionData = await directus
        .request(
          readItem("assembly_commission", id, {
            fields: [
              "id",
              "name",
              "description",
              "type",
              "president.id",
              "president.first_name",
              "president.last_name",
              "president.photo",
              "president.gender",
              "vice_president.id",
              "vice_president.first_name",
              "vice_president.last_name",
              "vice_president.photo",
              "1st_vice_president.id",
              "1st_vice_president.first_name",
              "1st_vice_president.last_name",
              "1st_vice_president.photo",
              "2nd_vice_president.id",
              "2nd_vice_president.first_name",
              "2nd_vice_president.last_name",
              "2nd_vice_president.photo",
              "secretary.id",
              "secretary.first_name",
              "secretary.last_name",
              "secretary.photo",
              "reporter.id",
              "reporter.first_name",
              "reporter.last_name",
              "reporter.photo",
              "members.assembly_deputy_id.id",
              "members.assembly_deputy_id.first_name",
              "members.assembly_deputy_id.last_name",
              "members.assembly_deputy_id.gender",
              "members.assembly_deputy_id.photo",
              "members.assembly_deputy_id.profession",
              "members.assembly_deputy_id.birthplace",
              "members.assembly_deputy_id.birthdate",
              "members.assembly_deputy_id.group.name",
              "members.assembly_deputy_id.group.color",
            ],
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 404,
            message: error.errors?.[0]?.message || "Commission introuvable",
          });
        });

      // Transformation des données
      const transformDeputy = (deputy: any) =>
        deputy
          ? {
              id: deputy.id,
              first_name: deputy.first_name,
              last_name: deputy.last_name,
              gender: deputy.gender || null,
              photo: deputy.photo
                ? `${config.cmsApiUrl}/assets/${deputy.photo}`
                : null,
              profession: deputy.profession || null,
              birthplace: deputy.birthplace || null,
              birthdate: deputy.birthdate || null,
              group: deputy.group || null,
            }
          : null;

      const transformedCommission = {
        id: commissionData.id,
        name: commissionData.name,
        description: commissionData.description || null,
        type: commissionData.type,
        president: transformDeputy(commissionData.president),
        vice_president: transformDeputy(commissionData.vice_president),
        "1st_vice_president": transformDeputy(
          commissionData["1st_vice_president"],
        ),
        "2nd_vice_president": transformDeputy(
          commissionData["2nd_vice_president"],
        ),
        secretary: transformDeputy(commissionData.secretary),
        reporter: transformDeputy(commissionData.reporter),
        members: Array.isArray(commissionData.members)
          ? commissionData.members.map((member: any) =>
              transformDeputy(member.assembly_deputy_id),
            )
          : [],
      };

      return {
        commission: transformedCommission,
      };
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Commission non trouvée",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "assembly-commission-detail",
    getKey: (event) => `assembly-commission-${getRouterParam(event, "id")}`,
  },
);
