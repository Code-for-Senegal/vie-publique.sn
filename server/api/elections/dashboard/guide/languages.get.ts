import { readField } from "@directus/sdk";

export default defineCachedEventHandler(
  async (event) => {
    const directus = getCmsClient() as any;

    try {
      const field = await directus.request(
        (readField as any)("election_electoral_guide", "langue")
      );

      const choices = field?.meta?.options?.choices || [];

      return {
        data: choices,
      };
    } catch (error: any) {
      console.error("Error in guide-languages.get:", error);
      return {
        data: [
            { text: "Wolof", value: "wolof" },
            { text: "Français", value: "francais" }
        ],
        error: error.message
      };
    }
  },
  {
    maxAge: 60 * 60 * 24,
    name: "elections-guide-languages",
  }
);
