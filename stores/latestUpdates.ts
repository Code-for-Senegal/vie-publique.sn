import { defineStore } from "pinia";

interface Update {
  id: string;
  title: string;
  type: "document" | "question";
  date_created: string;
  publish_date?: string;
  url: string;
  slug?: string;
}

interface DirectusDocument {
  id: string;
  title: string;
  publish_date: string;
  date_created: string;
  slug?: string;
}

interface DirectusQuestion {
  id: string;
  subject: string;
  question_date: string;
  date_created: string;
}

interface DirectusResponse<T> {
  data: T[];
}

export const useLatestUpdatesStore = defineStore("latestUpdates", {
  state: () => ({
    documents: [] as Update[],
    questions: [] as Update[],
    loading: false,
    error: null as Error | null,
    lastFetch: null as Date | null,
  }),

  getters: {
    getLatestDocuments: (state) => state.documents,
    getLatestQuestions: (state) => state.questions,
    isLoading: (state) => state.loading,
    hasError: (state) => state.error,
    shouldRefetch: (state) => {
      if (!state.lastFetch) return true;
      // Refetch si les données ont plus de 5 minutes
      const fiveMinutes = 5 * 60 * 1000;
      return Date.now() - state.lastFetch.getTime() > fiveMinutes;
    },
  },

  actions: {
    async fetchUpdates() {
      // Si les données sont récentes, pas besoin de refetch
      if (
        !this.shouldRefetch &&
        this.documents.length > 0 &&
        this.questions.length > 0
      ) {
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        const config = useRuntimeConfig();
        const apiUrl = config.public.cmsApiUrl;
        const apiKey = config.public.cmsApiKey;

        // Paramètres pour les documents
        const documentsFields = "id,title,slug,publish_date,date_created,type";
        const documentsSort = "sort=-date_created";
        const documentsFilters = "filter[status]=published";

        // Paramètres pour les questions
        const questionsFields = "id,subject,question_date,date_created";
        const questionsSort = "sort=-date_created";
        const questionsFilters = "filter[status]=published";

        const [documentsRes, questionsRes] = await Promise.all([
          fetch(
            `${apiUrl}/items/documents?fields=${documentsFields}&${documentsSort}&${documentsFilters}&limit=3`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
              },
            },
          ),
          fetch(
            `${apiUrl}/items/assembly_question?fields=${questionsFields}&${questionsSort}&${questionsFilters}&limit=3`,
            {
              headers: {
                Authorization: `Bearer ${apiKey}`,
              },
            },
          ),
        ]);

        if (!documentsRes.ok || !questionsRes.ok) {
          throw new Error("Error fetching updates");
        }

        const [documents, questions] = (await Promise.all([
          documentsRes.json(),
          questionsRes.json(),
        ])) as [
          DirectusResponse<DirectusDocument>,
          DirectusResponse<DirectusQuestion>,
        ];

        // Formater les résultats
        this.documents = documents.data.map((doc) => ({
          id: doc.id,
          title: doc.title,
          type: "document" as const,
          date_created: doc.date_created,
          publish_date: doc.publish_date,
          url: `/documents/${doc.id}/${doc.slug || "document"}`,
          slug: doc.slug,
        }));

        this.questions = questions.data.map((q) => ({
          id: q.id,
          title: q.subject,
          type: "question" as const,
          date_created: q.date_created,
          url: `/assemblee-nationale/questions/${q.id}`,
          slug: undefined,
        }));

        this.lastFetch = new Date();
      } catch (e) {
        console.error("Error fetching updates:", e);
        this.error = e as Error;
      } finally {
        this.loading = false;
      }
    },

    // Méthode pour forcer le rafraîchissement
    async forceRefresh() {
      this.lastFetch = null;
      await this.fetchUpdates();
    },
  },
});
