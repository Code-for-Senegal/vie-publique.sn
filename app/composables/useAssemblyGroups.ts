import type { AssemblyGroup } from '~/types/assembly';

export interface AssemblyGroupsOptions {
  /** ID du groupe pour récupération unitaire */
  id?: string | Ref<string>;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer les groupes parlementaires
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { groups, loading, searchQuery, filterStatus } = useAssemblyGroups();
 *
 * // Détail d'un groupe
 * const { group, loading } = useAssemblyGroups({ id: '123' });
 */
export const useAssemblyGroups = (options: AssemblyGroupsOptions = {}) => {
  // Pour un groupe unique, pas besoin de state UI
  if (unref(options.id)) {
    const collection = useCmsCollection<AssemblyGroup>({
      collection: 'assembly/groups',
      id: options.id as string | Ref<string>,
    });

    return {
      // Données
      group: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité avec l'ancien code
      groups: computed(() => []),
      groupById: collection.item,
      currentPage: ref(1),
      searchQuery: ref(''),
      sortBy: ref(options.sort || '-id'),
      filterStatus: ref('active'),
      itemsPerPage: ref(options.limit || 2000),
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
      fetchAssemblyGroups: () => {},
      fetchAssemblyGroupById: async () => {},
      reset: () => {},
    };
  }

  // Gestion des filtres spécifiques aux groupes
  const filterStatus = ref<string>('active'); // Status du groupe (active, inactive)

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || '-id',
    defaultItemsPerPage: options.limit || 2000,
    defaultFilter: 'active',
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'q',
      filter: 'status',
      page: 'page',
      sort: 'sort',
    },
  });

  // Construction des filtres spécifiques aux groupes
  const filters = computed(() => {
    const filters: Record<string, any> = {};

    // Filtre par statut
    if (filterStatus.value && filterStatus.value !== 'all') {
      filters.filterStatus = filterStatus.value;
    }

    return filters;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<AssemblyGroup>({
    collection: 'assembly/groups',
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.apiSearchQuery,
  });

  // Computed pour compatibilité avec l'ancien code
  const totalItems = computed(() => collection.pagination.value?.total || 0);
  const totalPages = computed(() => collection.pagination.value?.totalPages || 1);

  // Méthodes spécifiques aux groupes
  const setFilterStatus = (status: string) => {
    filterStatus.value = status;
    // Reset à la page 1 lors d'un changement de filtre
    state.currentPage.value = 1;
  };

  return {
    // Données
    groups: collection.items,
    group: collection.item,
    groupById: collection.item, // Alias pour compatibilité
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    itemsPerPage: state.itemsPerPage,

    // États spécifiques aux groupes
    filterStatus,

    // Méthodes (depuis useCollectionState)
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: () => {
      state.resetFilters();
      filterStatus.value = 'active';
    },

    // Méthodes spécifiques
    setFilterStatus,

    // Computed
    totalItems,
    totalPages,
    hasActiveFilters: computed(
      () => state.hasActiveFilters.value || filterStatus.value !== 'active',
    ),

    // Méthodes de compatibilité avec l'ancien code (deprecated)
    fetchAssemblyGroups: collection.refresh,
    fetchAssemblyGroupById: async () => collection.refresh(),
    reset: () => {
      state.resetFilters();
      filterStatus.value = 'active';
    },
  };
};
