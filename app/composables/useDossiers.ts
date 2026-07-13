import type { DossierListItem } from '~~/types/dossier';

export interface DossiersOptions {
  /** Tri par défaut */
  sort?: string;
  /** Nombre d'items par page */
  limit?: number;
  /** Synchroniser les filtres avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour la LISTE des dossiers (page /dossiers).
 * Suit le pattern maison : useCmsCollection (fetch) + useCollectionState (état UI).
 *
 * Le détail d'un dossier se récupère via `useDossier(slug)`.
 *
 * @example
 * const { dossiers, loading, searchQuery, setSearchQuery, totalPages } = useDossiers();
 */
export const useDossiers = (options: DossiersOptions = {}) => {
  const state = useCollectionState({
    defaultSort: options.sort || '-publish_date',
    defaultItemsPerPage: options.limit || 12,
    defaultFilter: 'all',
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'q', // ?q=code
      filter: 'type', // ?type=reform
      page: 'page',
      sort: 'sort',
    },
  });

  // Filtre par type / catégorie (depuis filterValue)
  const filters = computed(() => {
    const f: Record<string, any> = {};
    if (state.filterValue.value && state.filterValue.value !== 'all') {
      f.type = state.filterValue.value;
    }
    return f;
  });

  const collection = useCmsCollection<DossierListItem>({
    collection: 'dossiers',
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.apiSearchQuery,
  });

  const totalItems = computed(() => collection.pagination.value?.total || 0);
  const totalPages = computed(() => collection.pagination.value?.totalPages || 1);

  // Recalage des pages hors-limites (cf. useDocuments)
  watch([totalPages, collection.loading], () => {
    if (!collection.loading.value && state.currentPage.value > totalPages.value) {
      state.currentPage.value = totalPages.value;
    }
  });

  return {
    // Données
    dossiers: collection.items,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    filterValue: state.filterValue,
    itemsPerPage: state.itemsPerPage,

    // Méthodes
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setFilterValue: state.setFilterValue,
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: state.resetFilters,

    // Computed
    totalItems,
    totalPages,
    hasActiveFilters: state.hasActiveFilters,
  };
};
