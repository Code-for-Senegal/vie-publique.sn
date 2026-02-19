import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient() as any;

    try {
      const electionsData = (await directus.request(
        (readItems as any)("elections", {
          fields: [
            "id",
            "year",
            "type",
            "name",
            "status",
            "description",
            "election_date",
            "campaign_start_date",
            "campaign_end_date",
            "rounds",
            "election_date_round_2",
            "participation_rate",
            "registered_voters",
            "voters_count",
            "null_ballots",
            "valid_votes",
            "absolute_majority",
            "national_quotient",
            "documents.documents_id.id",
            "documents.documents_id.slug",
            "documents.documents_id.title",
            "documents.documents_id.description",
            "documents.documents_id.type",
            "documents.documents_id.file",
            "documents.documents_id.cover_image",
            "documents.documents_id.publish_date",
            "documents.documents_id.status"
          ],
          sort: ["-year", "-election_date", "-id"],
        })
      )) as any[];

      if (!electionsData || electionsData.length === 0) {
          return {
            years: [{ label: "2024", value: 2024 }],
            types: [
              { label: "Législatives", value: "legislative" },
              { label: "Présidentielle", value: "presidential" },
              { label: "Locales", value: "locale" },
            ],
            elections: []
          };
      }

      const yearsSet = new Set<number>();
      const typesSet = new Set<string>();

      electionsData.forEach((e: any) => {
        if (e.year) yearsSet.add(e.year);
        if (e.type) typesSet.add(e.type);
      });

      const years = Array.from(yearsSet)
        .sort((a, b) => b - a)
        .map((y) => ({ label: String(y), value: y }));

      const typesMap: Record<string, string> = {
          'legislative': 'Législatives',
          'presidential': 'Présidentielle',
          'locale': 'Locales'
      };

      const types = Array.from(typesSet).map((t) => ({
        label: typesMap[t] || t.charAt(0).toUpperCase() + t.slice(1),
        value: t,
      }));

      // Traiter les données des élections pour nettoyer et filtrer les documents
      const processedElections = electionsData.map((election: any) => {
        // Extraire et filtrer les documents (seulement les publiés)
        const documents = election.documents && Array.isArray(election.documents)
          ? election.documents
              .map((doc: any) => doc.documents_id)
              .filter((d: any) => d && d.id && d.status === "published")
              .sort((a: any, b: any) => {
                // Trier par date de publication (plus récent en premier)
                const dateA = a.publish_date ? new Date(a.publish_date).getTime() : 0;
                const dateB = b.publish_date ? new Date(b.publish_date).getTime() : 0;
                return dateB - dateA;
              })
          : [];

        return {
          ...election,
          documents
        };
      });

      // Récupérer les IDs des élections qui ont au moins un document publié
      const electionIdsWithDocuments = processedElections
        .filter((e: any) => e.documents && e.documents.length > 0)
        .map((e: any) => e.id);

      return {
        years,
        types,
        elections: processedElections,
        election_ids_with_documents: electionIdsWithDocuments,
      };
    } catch (error) {
      console.error("Error fetching dashboard config:", error);
      return {
          years: [{ label: "2024", value: 2024 }],
          types: [{ label: "Législatives", value: "legislatives" }],
          error: true
      };
    }
  },
  {
    maxAge: 60 * 60,
    name: "elections-dashboard-config",
    getKey: () => "elections-dashboard-config",
  }
);
