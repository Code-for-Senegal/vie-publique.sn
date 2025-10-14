// server/api/assembly/deputies/index.get.ts
import { readItems, aggregate } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient();
    const query = getQuery(event);

    // Paramètres de pagination
    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 200;
    const offset = (page - 1) * limit;

    // Paramètres de filtrage
    const groupId = query.groupId as string | undefined;
    const status = (query.status as string) || "active";
    const search = query.search as string | undefined;
    const gender = query.gender as string | undefined;

    try {
      // Construction du filtre
      const filter: any = {
        status: { _eq: status },
      };

      // Only add group filter if groupId is provided AND not "all"
      if (groupId && groupId !== "all") {
        filter.group = { _eq: groupId };
      }

      // Add gender filter if provided
      if (gender && gender !== "all") {
        filter.gender = { _eq: gender };
      }

      if (search) {
        filter._or = [
          { first_name: { _icontains: search } },
          { last_name: { _icontains: search } },
          { profession: { _icontains: search } },
        ];
      }

      // Récupération des députés
      const deputiesData = await directus.request(
        readItems("assembly_deputy", {
          fields: [
            "id",
            "biography",
            "gender",
            "first_name",
            "last_name",
            "profession",
            "birthplace",
            "birthdate",
            "photo",
            {
              electoral_list: [
                "name",
                "type",
                {
                  coalition: ["name", "color"],
                  constituency: ["name"],
                },
              ],
            },
            {
              group: ["name", "color"],
            },
          ],
          filter,
          limit,
          offset,
          sort: ["last_name", "first_name"],
        })
      );

      // Récupération du total
      const [totalCount] = await directus.request(
        aggregate("assembly_deputy", {
          aggregate: { count: "*" },
          query: { filter },
        })
      );

      const total = Number(totalCount.count);
      const totalPages = Math.ceil(total / limit);

      return {
        deputies: deputiesData,
        totalDeputies: total,
        pagination: {
          page,
          limit,
          total,
          totalPages,
        },
      };
    } catch (error) {
      console.error("Error fetching deputies:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Erreur lors de la récupération des députés",
      });
    }
  },
  {
    maxAge: 60 * 60, // Cache de 1 heure
    name: "assembly-deputies",
  }
);
