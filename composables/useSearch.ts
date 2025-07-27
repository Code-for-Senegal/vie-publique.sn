export const useSearch = () => {
  const searchQuery = ref("");
  const searchResults = ref([]);
  const totalResults = ref(0);
  const loading = ref(false);
  const currentPage = ref(1);
  const hasSearched = ref(false);

  // Fonction de recherche
  const performSearch = async () => {
    if (!searchQuery.value.trim()) {
      searchResults.value = [];
      totalResults.value = 0;
      hasSearched.value = false;
      return;
    }

    loading.value = true;
    hasSearched.value = true;

    try {
      const { data } = await useFetch("/api/search", {
        query: {
          q: searchQuery.value,
          page: currentPage.value,
        },
      });

      if (data.value) {
        searchResults.value = data.value.data || [];
        totalResults.value = data.value.total || 0;
      }
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      loading.value = false;
    }
  };

  // Recherche avec debounce
  const debouncedSearch = useDebounceFn(performSearch, 300);

  // Observer les changements de la requête
  watch(searchQuery, () => {
    currentPage.value = 1;
    debouncedSearch();
  });

  // Observer les changements de page
  watch(currentPage, () => {
    if (hasSearched.value) {
      performSearch();
    }
  });

  // Calcul du nombre total de pages
  const totalPages = computed(() => {
    return Math.ceil(totalResults.value / 20);
  });

  return {
    searchQuery,
    searchResults,
    totalResults,
    loading,
    currentPage,
    hasSearched,
    performSearch,
    debouncedSearch,
    totalPages,
  };
};
