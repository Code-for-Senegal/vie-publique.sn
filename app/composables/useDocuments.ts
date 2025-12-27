import type { Document } from '~/types/document';

export interface DocumentsOptions {
  /** ID du document pour récupération unitaire */
  id?: string | Ref<string>;

  /** Type de document fixe (ex: 'audit_report', 'official_journal') */
  type?: string;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer les documents
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { documents, loading, searchQuery, setSearchQuery } = useDocuments({ type: 'audit_report' });
 *
 * // Détail d'un document
 * const { document, loading } = useDocuments({ id: '123' });
 */
export const useDocuments = (options: DocumentsOptions = {}) => {
  const route = useRoute();

  // Pour un document unique, pas besoin de state UI
  if (unref(options.id)) {
    const collection = useCmsCollection<Document>({
      collection: 'documents',
      id: options.id as string | Ref<string>,
    });

    return {
      // Données
      document: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité
      documents: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(''),
      sortBy: ref(options.sort || '-publish_date'),
      filterValue: ref('all'),
      itemsPerPage: ref(options.limit || 10),
      pagination: computed(() => undefined),
      totalItems: computed(() => 0),
      totalPages: computed(() => 0),
      hasActiveFilters: computed(() => false),

      // Méthodes vides pour compatibilité
      setCurrentPage: () => {},
      setSearchQuery: () => {},
      setSortBy: () => {},
      setFilterValue: () => {},
      setItemsPerPage: () => {},
      resetFilters: () => {},
    };
  }

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || '-publish_date',
    defaultItemsPerPage: options.limit || 10,
    defaultFilter: 'all',
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'q', // ?q=audit
      filter: options.type === 'audit_report' ? 'organisme' : 'type', // ?organisme=OFNAC ou ?type=law
      page: 'page',
      sort: 'sort',
    },
  });

  // Gestion du filtre par année pour journal officiel
  const yearFilter = ref<string>('all');

  // Lecture du filtre année depuis l'URL
  onMounted(() => {
    if (options.type === 'official_journal' && route.query.year) {
      yearFilter.value = route.query.year as string;
    }
  });

  // Synchronisation du filtre année avec l'URL
  watch(yearFilter, () => {
    if (options.type === 'official_journal') {
      const query: any = { ...route.query };
      if (yearFilter.value !== 'all') {
        query.year = yearFilter.value;
      } else {
        delete query.year;
      }
      useRouter().replace({ query });
    }
  });

  // Construction des filtres spécifiques aux documents
  const filters = computed(() => {
    const filters: Record<string, any> = {};

    // Type de document fixe (passé en option)
    if (options.type) {
      filters.type = options.type;
    }

    // Filtre dynamique selon le type de document
    const filterVal = state.filterValue.value;

    if (filterVal && filterVal !== 'all') {
      if (options.type === 'official_journal') {
        // Pour journal officiel : filtre par année
        filters.filterType = yearFilter.value !== 'all' ? yearFilter.value : filterVal;
      } else if (options.type === 'audit_report') {
        // Pour rapports d'audit : filtre par organisme
        filters.filterType = filterVal;
      } else if (!options.type) {
        // Sans type spécifique : filtre par type de document
        filters.type = filterVal;
      }
    }

    return filters;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<Document>({
    collection: 'documents',
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.searchQuery,
  });

  // Computed pour compatibilité avec l'ancien code
  const totalItems = computed(() => collection.pagination.value?.total || 0);
  const totalPages = computed(() => collection.pagination.value?.totalPages || 1);

  return {
    // Données
    documents: collection.items,
    document: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    filterValue: state.filterValue,
    itemsPerPage: state.itemsPerPage,

    // État spécifique aux documents
    yearFilter, // Pour journal officiel

    // Méthodes (depuis useCollectionState)
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

    // Alias pour compatibilité avec ancien code
    setSelectedFilter: state.setFilterValue,
    documentType: computed(() => options.type || ''),
    filterType: state.filterValue,
    setTotalItems: () => {}, // Deprecated - géré automatiquement
    setType: (type: string) => {
      // Note: changer le type nécessite une nouvelle instance du composable
      console.warn('setType is deprecated - create a new useDocuments instance with the new type');
    },
  };
};
