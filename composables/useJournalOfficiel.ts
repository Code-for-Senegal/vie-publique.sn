import { useJournalOfficielStore } from "~/stores/journalOfficiel";

interface Document {
  id: string;
  title?: string;
  publish_date: string;
  slug?: string;
  jo_number?: string;
  description?: string;
}

export const useJournalOfficiel = () => {
  const store = useJournalOfficielStore();
  const config = useRuntimeConfig();
  const documents = ref<Document[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fonction pour construire les paramètres de requête
  const buildQueryParams = () => {
    const params = new URLSearchParams({
      "filter[status]": "published",
      "filter[type]": "official_journal",
      page: store.currentPage.toString(),
      limit: store.itemsPerPage.toString(),
      sort: "-publish_date",
    });

    // Ajouter la recherche si présente
    if (store.searchQuery) {
      params.append("search", store.searchQuery);
    }

    // Ajouter le filtre par année si sélectionnée
    if (store.selectedYear !== "all") {
      const year = parseInt(store.selectedYear);
      params.append("filter[year(publish_date)]", year.toString());
    }

    return params;
  };

  // Fonction pour récupérer le nombre total de documents
  const fetchTotalCount = async () => {
    // Construire les paramètres de filtre
    const filterParams = new URLSearchParams();
    filterParams.append("filter[status]", "published");
    filterParams.append("filter[type]", "official_journal");

    // Ajouter la recherche si présente
    if (store.searchQuery) {
      filterParams.append("search", store.searchQuery);
    }

    // Ajouter le filtre par année si sélectionnée
    if (store.selectedYear !== "all") {
      const year = parseInt(store.selectedYear);
      filterParams.append("filter[year(publish_date)]", year.toString());
    }

    const response = await fetch(
      `${config.public.cmsApiUrl}/items/documents?aggregate[countDistinct]=id&${filterParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${config.public.cmsApiKey}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        "Erreur lors de la récupération du nombre total de documents",
      );
    }

    const data = await response.json();
    store.setTotalItems(parseInt(data.data[0].countDistinct.id));
  };

  // Fonction pour récupérer les documents paginés
  const fetchDocuments = async () => {
    try {
      loading.value = true;
      store.setLoading(true);
      error.value = null;

      // Récupérer le nombre total de documents
      await fetchTotalCount();

      // Récupérer les documents paginés
      const params = buildQueryParams();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/documents?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des documents");
      }

      const data = await response.json();
      documents.value = data.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Une erreur est survenue";
      documents.value = [];
    } finally {
      loading.value = false;
      store.setLoading(false);
    }
  };

  // Fonction pour réinitialiser les filtres
  const resetFilters = () => {
    store.resetFilters();
    fetchDocuments();
  };

  // Fonction pour mettre à jour la recherche
  const updateSearch = (query: string) => {
    store.setSearchQuery(query);
    fetchDocuments();
  };

  // Fonction pour mettre à jour l'année sélectionnée
  const updateYear = (year: string) => {
    store.setSelectedYear(year);
    fetchDocuments();
  };

  // Fonction pour mettre à jour la page courante
  const updatePage = (page: number) => {
    store.setCurrentPage(page);
    fetchDocuments();
  };

  // Charger les documents au montage
  onMounted(() => {
    fetchDocuments();
  });

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    resetFilters,
    updateSearch,
    updateYear,
    updatePage,
  };
};
