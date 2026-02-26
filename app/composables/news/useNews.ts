export interface NewsArticle {
  id: string;
  title: string;
  slug?: string;
  date_published: string;
  date_updated?: string;
  cover_image?: string;
  featured?: boolean;
  content?: string;
  tags?: string[];
  category?: {
    name: string;
    slug?: string;
  };
  document?: {
    file?: string;
  };
}

export interface NewsOptions {
  /** ID de l'article pour récupération unitaire */
  id?: string | Ref<string>; // Support reactive ID

  /** Filtrer uniquement les articles featured */
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
 * Composable pour gérer les actualités/news
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { articles, loading, selectedCategory, setSelectedCategory } = useNews();
 *
 * // Articles featured uniquement
 * const { articles, loading } = useNews({ featured: true, limit: 6 });
 *
 * // Détail d'un article
 * const { article, loading } = useNews({ id: '123' });
 */
export const useNews = (options: NewsOptions = {}) => {
  // Pour un article unique, pas besoin de state UI
  if (unref(options.id)) {
    const collection = useCmsCollection<NewsArticle>({
      collection: 'news',
      id: options.id as string | Ref<string>,
    });

    return {
      // Données
      article: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité
      articles: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(''),
      sortBy: ref(options.sort || '-date_published'),
      selectedCategory: ref('Toutes'),
      itemsPerPage: ref(options.limit || 9),
      pagination: computed(() => undefined),
      totalItems: computed(() => 0),
      totalPages: computed(() => 0),
      hasActiveFilters: computed(() => false),
      categories: computed(() => []),
      featuredNews: computed(() => []),
      paginatedNews: computed(() => []),

      // Méthodes vides pour compatibilité
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
    defaultItemsPerPage: options.limit || 9,
    defaultFilter: options.category || 'Toutes',
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'search',
      filter: 'category',
      page: 'page',
      sort: 'sort',
    },
  });

  // Alias pour compatibilité avec le code existant
  const selectedCategory = state.filterValue;

  // Construction des filtres spécifiques aux news
  const filters = computed(() => {
    const filters: Record<string, any> = {};

    // Filtre par catégorie
    const category = selectedCategory.value;
    if (category && category !== 'Toutes') {
      filters.category = category;
    }

    // Filtre featured
    if (options.featured) {
      filters.featured = 'true';
    }

    return filters;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<NewsArticle>({
    collection: 'news',
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.searchQuery,
  });

  // Computed pour TOUTES les catégories disponibles
  const categories = computed(() => {
    const allCategories = [
      { name: 'Toutes' },
      { name: 'Conseil des ministres' },
      { name: 'Conseil interministériel' },
      { name: 'Discours' },
      { name: 'Assemblée nationale' },
      { name: 'Article' },
      { name: 'Budget' },
    ];

    return allCategories;
  });

  // Computed pour les articles featured
  const featuredNews = computed(() => {
    return collection.items.value
      .filter((article) => article.featured)
      .sort((a, b) => new Date(b.date_published).getTime() - new Date(a.date_published).getTime())
      .slice(0, 6);
  });

  // Computed pour compatibilité avec l'ancien code
  const totalItems = computed(() => {
    const total = collection.pagination.value?.total;
    return typeof total === 'number' ? total : 0;
  });

  const totalPages = computed(() => {
    const totalPages = collection.pagination.value?.totalPages;
    return typeof totalPages === 'number' ? totalPages : 1;
  });

  return {
    // Données
    articles: collection.items,
    article: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    selectedCategory, // Alias de filterValue
    itemsPerPage: state.itemsPerPage,

    // Méthodes (depuis useCollectionState)
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setSelectedCategory: state.setFilterValue, // Alias pour setFilterValue
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: state.resetFilters,

    // Computed supplémentaires
    categories,
    featuredNews,
    totalItems,
    totalPages,
    hasActiveFilters: state.hasActiveFilters,

    // Computed pour les articles paginés (alias)
    paginatedNews: collection.items,
  };
};
