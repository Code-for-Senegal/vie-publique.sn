import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient() as any;
    const query = getQuery(event);
    const coalitionId = query.coalitionId as string;

    if (!coalitionId) {
      throw createError({
        statusCode: 400,
        statusMessage: "ID de coalition requis",
      });
    }

    try {
      const videos = await directus.request(
        (readItems as any)("election_coalition_videos", {
          fields: ["id", "url_youtube", "date", "election_coalition"],
          filter: {
            election_coalition: { _eq: coalitionId },
          },
          sort: ["-date"],
          limit: -1,
        })
      );

      return {
        data: videos,
      };
    } catch (error: any) {
      console.error("Error fetching coalition videos:", error);
      return { data: [], error: error.message };
    }
  },
  {
    maxAge: 60 * 30,
    name: "elections-dashboard-coalition-videos",
    getKey: (event) => {
      const query = getQuery(event);
      return `coalition-videos-${query.coalitionId}`;
    },
  }
);
