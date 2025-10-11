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
  id?: string;
  featured?: boolean;
  category?: string;
  sort?: string;
  limit?: number;
}

export const useNews = (options: NewsOptions = {}) => {
  const route = useRoute();
  const router = useRouter();

  // États réactifs pour les paramètres
  const currentPage = ref(1);
  const searchQuery = ref("");
  const sortBy = ref(options.sort || "-date_published");
  const selectedCategory = ref(options.category || "Toutes");
  const itemsPerPage = ref(options.limit || 9);

  // Récupération des paramètres depuis l'URL au montage
  onMounted(() => {
    if (!options.id) {
      const query = route.query;

      if (query.page) {
        const page = parseInt(query.page as string);
        if (!isNaN(page)) currentPage.value = page;
      }
      if (query.search) {
        searchQuery.value = query.search as string;
      }
      if (query.sort) {
        sortBy.value = query.sort as string;
      }
      if (query.category) {
        selectedCategory.value = query.category as string;
      }
    }
  });

  const filters = computed(() => {
    if (options.id) return {};

    const filters: any = {};

    if (selectedCategory.value && selectedCategory.value !== "Toutes") {
      filters.category = selectedCategory.value;
    }

    if (options.featured) {
      filters.featured = "true";
    }

    return filters;
  });

  // Mise à jour de l'URL
  const updateURL = useDebounceFn(() => {
    if (options.id) return;

    const query: any = {};

    if (currentPage.value > 1) query.page = currentPage.value.toString();
    if (searchQuery.value) query.search = searchQuery.value;
    if (sortBy.value !== "-date_published") query.sort = sortBy.value;
    if (selectedCategory.value !== "Toutes")
      query.category = selectedCategory.value;

    router.replace({ query });
  }, 300);

  // Watchers pour la synchronisation URL
  if (!options.id) {
    watch([currentPage, searchQuery, sortBy, selectedCategory], () => {
      updateURL();
    });
  }

  // Utilisation du composable générique
  const collection = useCmsCollection<NewsArticle>({
    collection: "news",
    id: options.id,
    filters,
    sort: sortBy,
    limit: itemsPerPage,
    page: currentPage,
    search: searchQuery,
  });

  // Computed pour TOUTES les catégories disponibles
  const categories = computed(() => {
    const allCategories = [
      { name: "Toutes" },
      { name: "Conseil des ministres" },
      { name: "Conseil interministériel" },
      { name: "Assemblée nationale" },
      { name: "Article" },
      { name: "Podcasts" },
    ];

    return allCategories;
  });

  // Computed pour les articles featured
  const featuredNews = computed(() => {
    return collection.items.value
      .filter((article) => article.featured)
      .sort(
        (a, b) =>
          new Date(b.date_published).getTime() -
          new Date(a.date_published).getTime(),
      )
      .slice(0, 6);
  });

  // Computed pour la compatibilité
  const totalItems = computed(() => {
    const total = collection.pagination.value?.total;
    return typeof total === "number" ? total : 0;
  });
  const totalPages = computed(() => {
    const totalPages = collection.pagination.value?.totalPages;
    return typeof totalPages === "number" ? totalPages : 1;
  });

  return {
    // Données
    articles: collection.items,
    article: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs
    currentPage: options.id ? ref(1) : currentPage,
    searchQuery: options.id ? ref("") : searchQuery,
    sortBy: options.id ? ref("-date_published") : sortBy,
    selectedCategory: options.id ? ref("Toutes") : selectedCategory,
    itemsPerPage: options.id ? ref(9) : itemsPerPage,

    // Computed supplémentaires
    categories,
    featuredNews,
    totalItems,
    totalPages,

    // Méthodes
    setCurrentPage: options.id
      ? () => {}
      : (page: number) => {
          currentPage.value = page;
        },
    setSearchQuery: options.id
      ? () => {}
      : (search: string) => {
          searchQuery.value = search;
          currentPage.value = 1;
        },
    setSelectedCategory: options.id
      ? () => {}
      : (category: string) => {
          selectedCategory.value = category;
          currentPage.value = 1;
        },
    setSortBy: options.id
      ? () => {}
      : (sort: string) => {
          sortBy.value = sort;
        },
    resetFilters: options.id
      ? () => {}
      : () => {
          currentPage.value = 1;
          searchQuery.value = "";
          sortBy.value = "-date_published";
          selectedCategory.value = "Toutes";
        },

    hasActiveFilters: options.id
      ? computed(() => false)
      : computed(() => {
          return (
            searchQuery.value !== "" ||
            selectedCategory.value !== "Toutes" ||
            sortBy.value !== "-date_published"
          );
        }),

    // Computed pour les articles paginés
    paginatedNews: computed(() => collection.items.value),
  };
};
