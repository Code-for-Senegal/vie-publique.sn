import { readItems } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getLocalCmsClient() as any;

    try {
      const electionsData = (await directus.request(
        (readItems as any)("elections", {
          fields: ["id", "year", "type", "name", "status", "description", "election_date", "campaign_start_date", "campaign_end_date", "rounds", "date_round_2"],
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

      return {
        years,
        types,
        elections: electionsData,
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
