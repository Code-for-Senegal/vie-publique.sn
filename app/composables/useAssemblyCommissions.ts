import type { AssemblyCommission } from "~/types/assembly";

export interface AssemblyCommissionsOptions {
  /** ID de la commission pour récupération unitaire */
  id?: string;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer les commissions parlementaires
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { commissions, loading, searchQuery, filterType } = useAssemblyCommissions();
 *
 * // Détail d'une commission
 * const { commission, loading } = useAssemblyCommissions({ id: '123' });
 */
export const useAssemblyCommissions = (
  options: AssemblyCommissionsOptions = {},
) => {
  // Pour une commission unique, pas besoin de state UI
  if (options.id) {
    const collection = useCmsCollection<AssemblyCommission>({
      collection: "assembly/commissions",
      id: options.id,
    });

    return {
      // Données
      commission: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité avec l'ancien code
      commissions: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(""),
      sortBy: ref(options.sort || "id"),
      filterType: ref("all"),
      itemsPerPage: ref(options.limit || 50),
      pagination: computed(() => undefined),
      totalItems: computed(() => 0),
      totalPages: computed(() => 0),
      hasActiveFilters: computed(() => false),

      // Méthodes vides pour compatibilité
      setCurrentPage: () => {},
      setSearchQuery: () => {},
      setSortBy: () => {},
      setFilterType: () => {},
      setItemsPerPage: () => {},
      resetFilters: () => {},
      fetchAssemblyCommissions: () => {},
      fetchAssemblyCommissionById: async () => {},
      resetCommissions: () => {},
    };
  }

  // Gestion des filtres spécifiques aux commissions
  const filterType = ref<string>("all"); // Type de commission (permanent, special, ad_hoc)

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || "id",
    defaultItemsPerPage: options.limit || 50,
    defaultFilter: "all",
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: "q",
      filter: "type",
      page: "page",
      sort: "sort",
    },
  });

  // Construction des filtres spécifiques aux commissions
  const filters = computed(() => {
    const filters: Record<string, any> = {};

    // Filtre par type de commission
    if (filterType.value && filterType.value !== "all") {
      filters.filterType = filterType.value;
    }

    return filters;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<AssemblyCommission>({
    collection: "assembly/commissions",
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

  // Méthodes spécifiques aux commissions
  const setFilterType = (type: string) => {
    filterType.value = type;
    // Reset à la page 1 lors d'un changement de filtre
    state.currentPage.value = 1;
  };

  return {
    // Données
    commissions: collection.items,
    commission: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    itemsPerPage: state.itemsPerPage,

    // États spécifiques aux commissions
    filterType,

    // Méthodes (depuis useCollectionState)
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: () => {
      state.resetFilters();
      filterType.value = "all";
    },

    // Méthodes spécifiques
    setFilterType,

    // Computed
    totalItems,
    totalPages,
    hasActiveFilters: computed(
      () => state.hasActiveFilters.value || filterType.value !== "all",
    ),

    // Méthodes de compatibilité avec l'ancien code (deprecated)
    fetchAssemblyCommissions: collection.refresh,
    fetchAssemblyCommissionById: async () => collection.refresh(),
    resetCommissions: () => {
      state.resetFilters();
      filterType.value = "all";
    },
  };
};
