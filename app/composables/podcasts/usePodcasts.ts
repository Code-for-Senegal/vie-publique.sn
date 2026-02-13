import type { PodcastEpisode, PodcastCategory } from '~/types/podcast';

export interface PodcastsOptions {
  /** ID du podcast pour récupération unitaire */
  id?: string | Ref<string>;

  /** Filtrer uniquement les podcasts featured */
  featured?: boolean;

  /** Catégorie spécifique */
  category?: string;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer les podcasts
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { podcasts, loading, selectedCategory, setSelectedCategory } = usePodcasts();
 *
 * // Podcasts featured uniquement
 * const { podcasts, loading } = usePodcasts({ featured: true, limit: 6 });
 *
 * // Détail d'un podcast
 * const { podcast, loading } = usePodcasts({ id: '123' });
 */
export const usePodcasts = (options: PodcastsOptions = {}) => {
  // Pour un podcast unique, pas besoin de state UI
  if (unref(options.id)) {
    const collection = useCmsCollection<PodcastEpisode>({
      collection: 'podcasts',
      id: options.id as string | Ref<string>,
    });

    return {
      podcast: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      podcasts: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(''),
      sortBy: ref(options.sort || '-date_published'),
      selectedCategory: ref('Toutes'),
      itemsPerPage: ref(options.limit || 12),
      pagination: computed(() => undefined),
      totalItems: computed(() => 0),
      totalPages: computed(() => 0),
      hasActiveFilters: computed(() => false),
      featuredPodcasts: computed(() => [] as PodcastEpisode[]),
      categories: computed(() => [] as PodcastCategory[]),

      setCurrentPage: () => {},
      setSearchQuery: () => {},
      setSortBy: () => {},
      setSelectedCategory: () => {},
      setItemsPerPage: () => {},
      resetFilters: () => {},
    };
  }

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || '-date_published',
    defaultItemsPerPage: options.limit || 12,
    defaultFilter: options.category || 'Toutes',
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'search',
      filter: 'category',
      page: 'page',
      sort: 'sort',
    },
  });

  const selectedCategory = state.filterValue;

  // Construction des filtres spécifiques aux podcasts
  const filters = computed(() => {
    const f: Record<string, any> = {};

    const category = selectedCategory.value;
    if (category && category !== 'Toutes') {
      f.category = category;
    }

    if (options.featured) {
      f.featured = 'true';
    }

    return f;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<PodcastEpisode>({
    collection: 'podcasts',
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.searchQuery,
  });

  // Récupération des catégories depuis l'API
  const { data: categoriesData } = useFetch('/api/podcasts/categories', {
    key: 'podcast-categories',
  });

  const categories = computed<PodcastCategory[]>(() => {
    if (!categoriesData.value?.data) return [];
    return categoriesData.value.data as PodcastCategory[];
  });

  // Fetch séparé pour les podcasts featured (épisodes récents)
  const { data: featuredData } = useFetch('/api/podcasts', {
    key: 'podcasts-featured',
    query: { featured: 'true', limit: 6, sortBy: '-date_published' },
  });

  const featuredPodcasts = computed<PodcastEpisode[]>(() => {
    if (!featuredData.value?.data) return [];
    return featuredData.value.data as PodcastEpisode[];
  });

  const totalItems = computed(() => {
    const total = collection.pagination.value?.total;
    return typeof total === 'number' ? total : 0;
  });

  const totalPages = computed(() => {
    const tp = collection.pagination.value?.totalPages;
    return typeof tp === 'number' ? tp : 1;
  });

  return {
    podcasts: collection.items,
    podcast: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    selectedCategory,
    itemsPerPage: state.itemsPerPage,

    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setSelectedCategory: state.setFilterValue,
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: state.resetFilters,

    featuredPodcasts,
    categories,
    totalItems,
    totalPages,
    hasActiveFilters: state.hasActiveFilters,
  };
};
