export const useSearchEnhanced = () => {
  const route = useRoute();
  const router = useRouter();

  // États de recherche
  const searchQuery = ref((route.query.q as string) || "");
  const searchResults = ref([]);
  const totalResults = ref(0);
  const totalIndexed = ref(0);
  const loading = ref(false);
  const currentPage = ref(parseInt(route.query.page as string) || 1);
  const hasSearched = ref(false);
  const selectedTypes = ref<string[]>(
    (route.query.types as string)?.split(",").filter(Boolean) || [],
  );
  const itemsPerPage = 10;

  // Fonction pour mettre en surbrillance les termes recherchés
  const highlightText = (text: string, query: string) => {
    if (!text || !query) return text;

    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${escapedQuery})`, "gi");
    return text.replace(
      regex,
      '<mark class="bg-yellow-200 px-1 rounded">$1</mark>',
    );
  };

  // Fonction pour formater l'URL des résultats (identique à la page recherche.vue)
  const formatResultUrl = (result: any) => {
    return result.formattedUrl || "/actualites";
  };

  // Synchroniser avec l'URL
  const syncWithUrl = () => {
    const query: any = {};

    if (searchQuery.value) {
      query.q = searchQuery.value;
    }

    if (currentPage.value > 1) {
      query.page = currentPage.value.toString();
    }

    if (selectedTypes.value.length > 0) {
      query.types = selectedTypes.value.join(",");
    }

    router.push({ query });
  };

  // Fonction de recherche améliorée
  const performSearch = async () => {
    if (!searchQuery.value.trim() && selectedTypes.value.length === 0) {
      searchResults.value = [];
      totalResults.value = 0;
      hasSearched.value = false;
      return;
    }

    loading.value = true;
    hasSearched.value = true;

    // Synchroniser avec l'URL
    syncWithUrl();

    try {
      const searchParams = {
        q: searchQuery.value,
        page: currentPage.value,
        limit: itemsPerPage,
        types: selectedTypes.value.join(","),
      };

      const { data } = await useFetch("/api/search", {
        query: searchParams,
      });

      if (data.value) {
        // Traiter les résultats avec highlighting (en gardant les données originales)
        searchResults.value = (data.value.data || []).map((result: any) => ({
          ...result,
          highlightedTitle: result.highlights?.title?.[0]?.snippet
            ? result.highlights.title[0].snippet
            : highlightText(result.document?.title || "", searchQuery.value),
          highlightedContent: result.highlights?.content_text?.[0]?.snippet
            ? result.highlights.content_text[0].snippet
            : highlightText(
                result.document?.content_text?.substring(0, 300) || "",
                searchQuery.value,
              ),
        }));

        totalResults.value = data.value.total || 0;
        totalIndexed.value = data.value.totalIndexed || data.value.total || 0;
      }
    } catch (error) {
      searchResults.value = [];
      totalResults.value = 0;
    } finally {
      loading.value = false;
    }
  };

  // Recherche avec debounce pour temps réel
  const debouncedSearch = useDebounceFn(() => {
    currentPage.value = 1;
    performSearch();
  }, 300);

  // Observer les changements de la requête de recherche
  watch(searchQuery, () => {
    debouncedSearch();
  });

  // Observer les changements de filtres
  watch(
    selectedTypes,
    (newTypes, oldTypes) => {
      currentPage.value = 1;
      performSearch();
    },
    { deep: true },
  );

  // Observer les changements de page
  watch(currentPage, () => {
    if (hasSearched.value) {
      performSearch();
    }
  });

  // Calcul du nombre total de pages
  const totalPages = computed(() => {
    return Math.ceil(totalResults.value / itemsPerPage);
  });

  // Fonction pour obtenir la couleur du badge selon le type
  const getTypeBadgeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      document: "bg-orange-100 text-orange-800 border-orange-200",
      actualite: "bg-blue-100 text-blue-800 border-blue-200",
      actualités: "bg-blue-100 text-blue-800 border-blue-200",
      default: "bg-gray-100 text-gray-800 border-gray-200",
    };

    return typeColors[type?.toLowerCase()] || typeColors.default;
  };

  // Fonction pour basculer un type dans les filtres
  const toggleType = (type: string) => {
    const index = selectedTypes.value.indexOf(type);
    if (index > -1) {
      selectedTypes.value.splice(index, 1);
    } else {
      selectedTypes.value.push(type);
    }
  };

  // Initialisation au montage
  onMounted(() => {
    // Si il y a déjà une requête dans l'URL, lancer la recherche
    if (searchQuery.value || selectedTypes.value.length > 0) {
      performSearch();
    }
  });

  return {
    searchQuery,
    searchResults,
    totalResults,
    totalIndexed,
    loading,
    currentPage,
    hasSearched,
    selectedTypes,
    performSearch,
    debouncedSearch,
    totalPages,
    itemsPerPage,
    getTypeBadgeColor,
    toggleType,
    highlightText,
  };
};
