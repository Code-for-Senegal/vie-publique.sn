import { readItem } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();
    const id = getRouterParam(event, "id");

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID du groupe parlementaire manquant",
      });
    }

    try {
      const directus = getCmsClient();

      // Récupération du groupe complet avec filtres pour les membres actifs
      const groupData = await directus
        .request(
          readItem("assembly_group", id, {
            fields: [
              "id",
              "name",
              "status",
              "creation_date",
              "logo",
              "description",
              "color",
              "president.id",
              "president.first_name",
              "president.last_name",
              "president.photo",
              "vice_president.id",
              "vice_president.first_name",
              "vice_president.last_name",
              "vice_president.photo",
              "members.id",
              "members.first_name",
              "members.last_name",
              "members.photo",
              "members.gender",
              "members.profession",
              "members.birthplace",
              "members.birthdate",
            ],
            filter: {
              status: {
                _eq: "active",
              },
            },
            limit: 2000,
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 404,
            message:
              error.errors?.[0]?.message || "Groupe parlementaire introuvable",
          });
        });

      // Transformation des données - retourner uniquement les IDs pour les photos
      const transformDeputy = (deputy: any) =>
        deputy
          ? {
              id: deputy.id,
              first_name: deputy.first_name,
              last_name: deputy.last_name,
              photo: deputy.photo || null,
              gender: deputy.gender || null,
              profession: deputy.profession || null,
              birthplace: deputy.birthplace || null,
              birthdate: deputy.birthdate || null,
            }
          : null;

      const transformedGroup = {
        id: groupData.id,
        name: groupData.name,
        status: groupData.status,
        creation_date: groupData.creation_date || null,
        logo: groupData.logo || null,
        description: groupData.description || null,
        color: groupData.color || null,
        president: transformDeputy(groupData.president),
        vice_president: transformDeputy(groupData.vice_president),
        members: Array.isArray(groupData.members)
          ? groupData.members.map(transformDeputy)
          : [],
      };

      return {
        group: transformedGroup,
      };
    } catch (error) {
      throw createError({
        statusCode: 404,
        statusMessage: "Groupe parlementaire non trouvé",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "assembly-group-detail",
    getKey: (event) => `assembly-group-${getRouterParam(event, "id")}`,
  },
);
