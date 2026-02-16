import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient() as any;
    const query = getQuery(event);
    const type = query.type as string;
    const language = query.language as string;

    const filter: any = {
      status: { _eq: "published" },
    };

    if (type && type !== 'all') {
      filter.type_election = { _eq: type };
    }

    if (language && language !== 'all') {
      filter.langue = { _eq: language };
    }

    try {
      const guides = await directus.request(
        (readItems as any)("election_electoral_guide", {
          fields: [
            "id",
            "titre",
            "description",
            "url_youtube",
            "type_election",
            "langue"
          ],
          filter,
          sort: ["sort", "-date_created"],
          limit: -1,
        })
      );

      return {
        data: guides,
      };
    } catch (error: any) {
      console.error("Error in guide-electoral.get:", error);
      return {
        data: [],
        error: error.message
      };
    }
  },
  {
    maxAge: 60 * 60, // 1 hour cache
    name: "elections-guide",
    getKey: (event) => {
      const query = getQuery(event);
      return `guide-${query.type || 'all'}-${query.language || 'all'}`;
    },
  }
);
