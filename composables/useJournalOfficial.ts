// composables/useJournalOfficial.ts
export const useJournalOfficial = () => {
  const journaux = ref([]);
  const journal = ref<any>(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchJournaux = async () => {
    loading.value = true;
    error.value = null;

    const sort = `sort=-document.publish_date`;
    const filters = `filter[status]=published`;
    const fields =
      "id,number,type,slug,document.id,document.title,document.description,document.publish_date,document.file";

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/official_journals?fields=${fields}&${sort}&${filters}`,
        {
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dataResponse = await response.json();
      journaux.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des journaux officiels";
      journaux.value = [];
    } finally {
      loading.value = false;
    }
  };

  // FIXME rempalce with get by id
  const fetchJournalBySlug = async (slug: string) => {
    loading.value = true;
    error.value = null;

    const fields =
      "id,number,type,slug,document.id,document.title,document.description,document.publish_date,document.content_html,document.file";

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/official_journals?fields=${fields}&filter[slug][_eq]=${slug}`,
        {
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dataResponse = await response.json();
      if (dataResponse.data && dataResponse.data.length > 0) {
        journal.value = dataResponse.data[0];
      }
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement du journal officiel";
      journal.value = null;
    } finally {
      loading.value = false;
    }
  };

  const resetState = () => {
    journaux.value = [];
    journal.value = null;
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchJournaux();
  });

  return {
    journaux,
    journal,
    loading,
    error,
    fetchJournaux,
    fetchJournalBySlug,
    resetState,
  };
};
