import type { AssemblyVote } from "~/types/assembly";

export interface AssemblyVotesOptions {
  /** ID du vote pour récupération unitaire */
  id?: string;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer les votes parlementaires
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { votes, loading, searchQuery, filterStatus } = useAssemblyVotes();
 *
 * // Détail d'un vote
 * const { vote, loading } = useAssemblyVotes({ id: '123' });
 */
export const useAssemblyVotes = (options: AssemblyVotesOptions = {}) => {
  // Pour un vote unique, pas besoin de state UI
  if (options.id) {
    const collection = useCmsCollection<AssemblyVote>({
      collection: "assembly/votes",
      id: options.id,
    });

    return {
      // Données
      vote: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité avec l'ancien code
      votes: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(""),
      sortBy: ref(options.sort || "-date"),
      filterStatus: ref("all"),
      itemsPerPage: ref(options.limit || 50),
      pagination: computed(() => undefined),
      totalItems: computed(() => 0),
      totalPages: computed(() => 0),
      hasActiveFilters: computed(() => false),

      // Méthodes vides pour compatibilité
      setCurrentPage: () => {},
      setSearchQuery: () => {},
      setSortBy: () => {},
      setFilterStatus: () => {},
      setItemsPerPage: () => {},
      resetFilters: () => {},
      fetchAssemblyVotes: () => {},
      fetchAssemblyVoteById: async () => {},
      resetVotes: () => {},
    };
  }

  // Gestion des filtres spécifiques aux votes
  const filterStatus = ref<string>("all"); // Status du vote

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || "-date",
    defaultItemsPerPage: options.limit || 50,
    defaultFilter: "all",
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: "q",
      filter: "status",
      page: "page",
      sort: "sort",
    },
  });

  // Construction des filtres spécifiques aux votes
  const filters = computed(() => {
    const filters: Record<string, any> = {};

    // Filtre par statut
    if (filterStatus.value && filterStatus.value !== "all") {
      filters.filterStatus = filterStatus.value;
    }

    return filters;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<AssemblyVote>({
    collection: "assembly/votes",
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

  // Méthodes spécifiques aux votes
  const setFilterStatus = (status: string) => {
    filterStatus.value = status;
    // Reset à la page 1 lors d'un changement de filtre
    state.currentPage.value = 1;
  };

  return {
    // Données
    votes: collection.items,
    vote: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    itemsPerPage: state.itemsPerPage,

    // États spécifiques aux votes
    filterStatus,

    // Méthodes (depuis useCollectionState)
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: () => {
      state.resetFilters();
      filterStatus.value = "all";
    },

    // Méthodes spécifiques
    setFilterStatus,

    // Computed
    totalItems,
    totalPages,
    hasActiveFilters: computed(
      () => state.hasActiveFilters.value || filterStatus.value !== "all",
    ),

    // Méthodes de compatibilité avec l'ancien code (deprecated)
    fetchAssemblyVotes: collection.refresh,
    fetchAssemblyVoteById: async () => collection.refresh(),
    resetVotes: () => {
      state.resetFilters();
      filterStatus.value = "all";
    },
  };
};
