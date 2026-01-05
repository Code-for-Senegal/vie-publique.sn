import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getLocalCmsClient() as any;
    const query = getQuery(event);
    const year = query.year ? parseInt(query.year as string) : null;
    const type = query.type as string;
    const constituencyId = query.constituency_id;
    const search = query.search as string;

    try {
      let electionId = null;
      if (year && type) {
        const elections = await directus.request(
          (readItems as any)("elections", {
            fields: ["id", "year", "type", "election_date"],
            filter: {
              year: { _eq: year },
              type: { _eq: type },
            },
            sort: ["-election_date", "-id"],
            limit: 1,
          })
        );
        electionId = elections[0]?.id;

        if (!electionId) {
          return {
            data: [],
            meta: {
              electionId: null,
              count: 0,
              message: `Aucune élection trouvée pour ${type} ${year}`
            }
          };
        }
      }

      let coalitionIds: number[] = [];
      if (electionId) {
        const listsFilter: any = {
          election: { _eq: electionId },
          status: { _eq: "published" },
        };

        if (constituencyId) {
          listsFilter.constituency = { _eq: constituencyId };
        }

        const lists = await directus.request(
          (readItems as any)("election_electoral_lists", {
            fields: ["coalition"],
            filter: listsFilter,
            limit: -1,
          })
        );
        coalitionIds = [...new Set(lists.map((l: any) => l.coalition))].filter(Boolean) as number[];
      }

      if (coalitionIds.length === 0) {
        return {
          data: [],
          meta: {
            electionId,
            count: 0
          }
        };
      }

      const filter: any = {
        id: { _in: coalitionIds }
      };

      if (search) {
        filter._or = [
          { name: { _icontains: search } },
          { acronym: { _icontains: search } },
          { head_of_list: { first_name: { _icontains: search } } },
          { head_of_list: { last_name: { _icontains: search } } }
        ];
      }

      const coalitions = await directus.request(
        (readItems as any)("election_coalition", {
          fields: [
            "id",
            "name",
            "acronym",
            "logo",
            "color",
            "voix",
            "pourcentage",
            "sieges",
            "sieges_departement",
            "sieges_national",
            "list_order",
            "head_of_list.id",
            "head_of_list.first_name",
            "head_of_list.last_name",
            "head_of_list.photo",
            "head_of_list.profession",
          ],
          filter,
          sort: ["list_order", "name"],
          limit: -1,
        })
      );

      return {
        data: coalitions,
        meta: {
          electionId,
          count: coalitions.length
        }
      };
    } catch (error: any) {
      console.error("Error in coalitions.get:", error);
      return {
        data: [],
        error: error.message
      };
    }
  },
  {
    maxAge: 60 * 30,
    name: "elections-dashboard-coalitions",
    getKey: (event) => {
      const query = getQuery(event);
      return `coalitions-${query.year}-${query.type}-${query.constituency_id || 'all'}-${query.search || 'none'}`;
    },
  }
);
