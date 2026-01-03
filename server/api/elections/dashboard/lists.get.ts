import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getLocalCmsClient() as any;
    const query = getQuery(event);
    const coalitionId = query.coalitionId as string;
    const year = query.year ? parseInt(query.year as string) : null;
    const type = query.type as string;
    const constituencyId = query.constituencyId as string;

    if (!coalitionId && !constituencyId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID de coalition ou de circonscription requis",
      });
    }

    try {
      let electionId = null;
      if (year && type) {
        const elections = await directus.request(
          (readItems as any)("elections", {
            fields: ["id", "election_date"],
            filter: {
              year: { _eq: year },
              type: { _eq: type },
            },
            sort: ["-election_date", "-id"],
            limit: 1,
          })
        );
        electionId = elections[0]?.id;
      }

      const targetConstituencyIds: (string | number)[] = [];

      if (constituencyId) {
        targetConstituencyIds.push(constituencyId);

        const children = await directus.request(
          (readItems as any)("election_constituencies", {
              fields: ['id'],
              filter: { parent: { _eq: constituencyId } }
          })
        );
        if (children && children.length > 0) {
          targetConstituencyIds.push(...children.map((c: any) => c.id));
        }
      }

      const filter: any = {
        status: { _eq: "published" },
      };

      if (coalitionId) {
          filter.coalition = { _eq: coalitionId };
      }

      if (targetConstituencyIds.length > 0) {
          filter.constituency = { _in: targetConstituencyIds };
      }

      if (electionId) {
        filter.election = { _eq: electionId };
      }

      const lists = await directus.request(
        (readItems as any)("election_electoral_lists", {
          fields: [
            "id",
            "name",
            "type",
            "is_substitute",
            // "type_scrutin",
            "constituency.id",
            "constituency.name",
            "constituency.type",
            "coalition.id",
            "coalition.name",
            "coalition.color",
            "coalition.logo",
            {
              candidates: [
                "id",
                "first_name",
                "last_name",
                "photo",
                "profession",
                "gender",
                "position",
                "biography",
                "birthdate",
                "birthplace",
                "voter_number",
                "facebook",
                "twitter",
              ],
            },
          ],
          filter,
          sort: ["type", "is_substitute", "name"],
          limit: -1,
        })
      );

      return {
        data: lists,
      };
    } catch (error: any) {
      console.error("Error in dashboard lists.get:", error);
      return { data: [], error: error.message };
    }
  },
  {
    maxAge: 60 * 30,
    name: "elections-dashboard-lists",
    getKey: (event) => {
      const query = getQuery(event);
      return `lists-${query.coalitionId || 'all'}-${query.constituencyId || 'all'}-${query.year}-${query.type}`;
    },
  }
);
