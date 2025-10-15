import type { GovernmentMember } from "~/types/government-member";

export interface NominationsOptions {
  /** ID de la nomination pour récupération unitaire */
  id?: string;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer les nominations présidentielles
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { nominations, loading, searchQuery, filterType, filterGender } = useNominations();
 *
 * // Détail d'une nomination
 * const { nomination, loading } = useNominations({ id: '123' });
 */
export const useNominations = (options: NominationsOptions = {}) => {
  const route = useRoute();

  // Pour une nomination unique, pas besoin de state UI
  if (options.id) {
    const collection = useCmsCollection<GovernmentMember>({
      collection: "nominations",
      id: options.id,
    });

    return {
      // Données
      nomination: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité
      nominations: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(""),
      sortBy: ref(options.sort || "-nominationDate"),
      filterType: ref("all"),
      filterGender: ref("all"),
      itemsPerPage: ref(options.limit || 25),
      pagination: computed(() => undefined),
      totalItems: computed(() => 0),
      totalPages: computed(() => 0),
      hasActiveFilters: computed(() => false),

      // Méthodes vides pour compatibilité
      setCurrentPage: () => {},
      setSearchQuery: () => {},
      setSortBy: () => {},
      setFilterType: () => {},
      setFilterGender: () => {},
      setItemsPerPage: () => {},
      resetFilters: () => {},
    };
  }

  // Gestion des filtres spécifiques aux nominations
  const filterType = ref<string>("all"); // Type de nomination (Ministre, Directeur, etc.)
  const filterGender = ref<string>("all"); // Genre (Monsieur, Madame)

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || "-nominationDate",
    defaultItemsPerPage: options.limit || 25,
    defaultFilter: "all",
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: "q", // ?q=audit
      filter: "type", // ?type=Ministre
      page: "page",
      sort: "sort",
    },
    additionalFilters: {
      gender: filterGender,
    },
  });

  // Lecture des filtres depuis l'URL
  onMounted(() => {
    if (route.query.type) {
      filterType.value = route.query.type as string;
    }
    if (route.query.gender) {
      filterGender.value = route.query.gender as string;
    }
  });

  // Synchronisation du filtre type avec l'URL
  watch(filterType, () => {
    const query: any = { ...route.query };
    if (filterType.value !== "all") {
      query.type = filterType.value;
    } else {
      delete query.type;
    }
    useRouter().replace({ query });
  });

  // Construction des filtres spécifiques aux nominations
  const filters = computed(() => {
    const filters: Record<string, any> = {};

    // Filtre par type de nomination
    if (filterType.value && filterType.value !== "all") {
      filters.filterType = filterType.value;
    }

    // Filtre par genre
    if (filterGender.value && filterGender.value !== "all") {
      filters.filterGender = filterGender.value;
    }

    return filters;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<GovernmentMember>({
    collection: "nominations",
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.searchQuery,
  });

  // Computed pour compatibilité avec l'ancien code
  const totalItems = computed(() => collection.pagination.value?.total || 0);
  const totalPages = computed(
    () => collection.pagination.value?.totalPages || 1,
  );

  // Méthodes spécifiques aux nominations
  const setFilterType = (type: string) => {
    filterType.value = type;
    // Reset à la page 1 lors d'un changement de filtre
    state.currentPage.value = 1;
  };

  const setFilterGender = (gender: string) => {
    filterGender.value = gender;
    // Reset à la page 1 lors d'un changement de filtre
    state.currentPage.value = 1;
  };

  // Récupération des statistiques globales (tous les totaux)
  const { data: stats } = useFetch("/api/nominations/stats", {
    key: "nominations-stats",
  });

  // Computed pour les totaux par type (depuis l'API stats)
  const totalsByType = computed(() => {
    return stats.value?.totalsByType || {};
  });

  // Computed pour les totaux par genre (depuis l'API stats)
  const totalsByGender = computed(() => {
    return stats.value?.totalsByGender || { maleCount: 0, femaleCount: 0 };
  });

  return {
    // Données
    nominations: collection.items,
    nomination: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    itemsPerPage: state.itemsPerPage,

    // États spécifiques aux nominations
    filterType,
    filterGender,

    // Méthodes (depuis useCollectionState)
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: () => {
      state.resetFilters();
      filterType.value = "all";
      filterGender.value = "all";
    },

    // Méthodes spécifiques
    setFilterType,
    setFilterGender,

    // Computed
    totalItems,
    totalPages,
    totalsByType,
    totalsByGender,
    hasActiveFilters: computed(
      () =>
        state.hasActiveFilters.value ||
        filterType.value !== "all" ||
        filterGender.value !== "all",
    ),
  };
};
