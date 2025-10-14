import { readItems } from "@directus/sdk";
import { getCmsClient } from "~/server/utils/cms-client";

export default defineCachedEventHandler(
  async (event) => {
    const config = useRuntimeConfig();

    // Récupération des paramètres de requête
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 50;
    const search = query.search as string;
    const sortBy = (query.sortBy as string) || "id";
    const filterType = query.filterType as string; // Type de commission (permanent, special, ad_hoc)

    try {
      const directus = getCmsClient();

      // Construction du filtre dynamique
      const filter: any = {};

      // Filtre par type de commission
      if (filterType && filterType !== "all") {
        filter.type = {
          _eq: filterType,
        };
      }

      // Recherche textuelle (nom de la commission)
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

      // Récupération des commissions avec pagination
      const commissionData = await directus
        .request(
          readItems("assembly_commission", {
            fields: [
              "id",
              "name",
              "description",
              "type",
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
          }),
        )
        .catch((error) => {
          throw createError({
            statusCode: error.errors?.[0]?.extensions?.code || 500,
            message: error.errors?.[0]?.message || "Erreur interne du serveur",
          });
        });

      // Récupération du total de commissions
      const totalCount = await directus
        .request(
          readItems("assembly_commission", {
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
        .catch(() => commissionData.length);

      // Transformation des données
      const transformedCommissions = commissionData.map((commission) => ({
        id: commission.id,
        name: commission.name,
        description: commission.description || null,
        type: commission.type,
        president: commission.president
          ? {
              id: commission.president.id,
              first_name: commission.president.first_name,
              last_name: commission.president.last_name,
              photo: commission.president.photo
                ? `${config.cmsApiUrl}/assets/${commission.president.photo}`
                : null,
            }
          : null,
        membersCount: Array.isArray(commission.members)
          ? commission.members.length
          : 0,
      }));

      return {
        commissions: transformedCommissions,
        totalCommissions: Number(totalCount),
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
          "Une erreur est survenue lors de la récupération des commissions",
      });
    }
  },
  {
    maxAge: 60 * 60, // 1 heure
    name: "assembly-commissions",
    getKey: (event) => {
      const query = getQuery(event);
      return `assembly-commissions-${JSON.stringify(query)}`;
    },
  },
);
