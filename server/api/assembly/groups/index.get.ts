import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 2000;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "-id";
    const filterStatus = query.filterStatus as string; // Status du groupe (active, inactive)

    try {
      const directus = getCmsClient();

      // Construction du filtre dynamique
      const filter: any = {
        status: {
          _eq: filterStatus || "active",
        },
      };

      // Recherche textuelle (nom du groupe)
      if (search) {
        filter._or = [
          {
            name: {
              _icontains: search,
            },
          },
          {
            description: {
              _icontains: search,
            },
          },
        ];
      }

      // Calcul de l'offset pour la pagination
      const offset = (page - 1) * limit;

      // Récupération des groupes avec pagination
      const groupData = await directus
        .request(
          readItems("assembly_group", {
            fields: [
              "id",
              "name",
              "status",
              "creation_date",
              "logo",
              "color",
              "president.id",
              "president.first_name",
              "president.last_name",
              "president.photo",
              "members",
            ],
            filter,
            limit,
            offset,
            sort: [sortBy],
            deep: {
              members: {
                _filter: {
                  status: {
                    _eq: "active",
                  },
                },
                _limit: 165,
              },
            },
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message: error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      // Récupération du total de groupes
      const totalCount = await directus
        .request(
          readItems("assembly_group", {
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
        .catch(() => groupData.length);

      // Transformation des données
      const transformedGroups = groupData.map((group) => ({
        id: group.id,
        name: group.name,
        status: group.status,
        creation_date: group.creation_date || null,
        logo: group.logo || null,
        color: group.color || null,
        president: group.president
          ? {
              id: group.president.id,
              first_name: group.president.first_name,
              last_name: group.president.last_name,
              photo: group.president.photo || null,
            }
          : null,
        members: Array.isArray(group.members) ? group.members : [],
      }));

      return {
        groups: transformedGroups,
        totalGroups: Number(totalCount),
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
          "Une erreur est survenue lors de la récupération des groupes parlementaires",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "assembly-groups",
    getKey: (event) => {
      const query = getQuery(event);
      return `assembly-groups-${JSON.stringify(query)}`;
    },
  },
);
