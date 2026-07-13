import type { Media } from '~/types/media';

export interface MediasOptions {
  /** ID du média pour récupération unitaire */
  id?: string | Ref<string>;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer les médias
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { medias, loading, searchQuery, filterType } = useMedias();
 *
 * // Détail d'un média
 * const { media, loading } = useMedias({ id: '123' });
 */
export const useMedias = (options: MediasOptions = {}) => {
  const route = useRoute();

  // Pour un média unique, pas besoin de state UI
  if (unref(options.id)) {
    const collection = useCmsCollection<Media>({
      collection: 'medias',
      id: options.id as string | Ref<string>,
    });

    return {
      // Données
      media: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité
      medias: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(''),
      sortBy: ref(options.sort || '-id'),
      filterType: ref('all'),
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
      setItemsPerPage: () => {},
      resetFilters: () => {},
    };
  }

  // Gestion des filtres spécifiques aux médias
  const filterType = ref<string>('all'); // Type de média (TV, Radio, etc.)

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || '-id',
    defaultItemsPerPage: options.limit || 25,
    defaultFilter: 'all',
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'q', // ?q=rts
      filter: 'type', // ?type=television
      page: 'page',
      sort: 'sort',
    },
  });

  // Lecture des filtres depuis l'URL
  onMounted(() => {
    if (route.query.type) {
      filterType.value = route.query.type as string;
    }
  });

  // Synchronisation du filtre type avec l'URL
  watch(filterType, () => {
    const query: any = { ...route.query };
    if (filterType.value !== 'all') {
      query.type = filterType.value;
    } else {
      delete query.type;
    }
    useRouter().replace({ query });
  });

  // Construction des filtres spécifiques aux médias
  const filters = computed(() => {
    const filters: Record<string, any> = {};

    // Filtre par type de média
    if (filterType.value && filterType.value !== 'all') {
      filters.filterType = filterType.value;
    }

    return filters;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<Media>({
    collection: 'medias',
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.apiSearchQuery,
  });

  // Computed pour compatibilité avec l'ancien code
  const totalItems = computed(() => collection.pagination.value?.total || 0);
  const totalPages = computed(() => collection.pagination.value?.totalPages || 1);

  // Méthodes spécifiques aux médias
  const setFilterType = (type: string) => {
    filterType.value = type;
    // Reset à la page 1 lors d'un changement de filtre
    state.currentPage.value = 1;
  };

  // Récupération des statistiques globales (tous les totaux)
  const { data: stats } = useFetch('/api/medias/stats', {
    key: 'medias-stats',
  });

  // Computed pour les totaux par type (depuis l'API stats)
  const totalsByType = computed(() => {
    return stats.value?.totalsByType || {};
  });

  return {
    // Données
    medias: collection.items,
    media: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    itemsPerPage: state.itemsPerPage,

    // États spécifiques aux médias
    filterType,

    // Méthodes (depuis useCollectionState)
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: () => {
      state.resetFilters();
      filterType.value = 'all';
    },

    // Méthodes spécifiques
    setFilterType,

    // Computed
    totalItems,
    totalPages,
    totalsByType,
    hasActiveFilters: computed(() => state.hasActiveFilters.value || filterType.value !== 'all'),
  };
};
