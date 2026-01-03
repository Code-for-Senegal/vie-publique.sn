import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    try {
      const directus = getCmsClient();

      const documentsWithElections = await directus.request(
        readItems("documents", {
          fields: ["election_id"],
          filter: {
            election_id: {
              _nnull: true,
            },
            status: {
              _eq: "published",
            },
          },
          limit: -1,
        })
      );

      const electionIds = [
        ...new Set(
          documentsWithElections
            .map((doc: any) => doc.election_id)
            .filter(Boolean)
        ),
      ];

      return {
        election_ids: electionIds,
        total: electionIds.length,
      };
    } catch (error) {
      throw createError({
        statusCode: 500,
        statusMessage:
          "Erreur lors de la récupération des élections avec documents",
      });
    }
  },
  {
    maxAge: 60 * 60,
    name: "elections-with-documents",
  }
);
