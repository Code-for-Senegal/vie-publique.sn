/**
 * Composable générique pour gérer l'état UI des collections (pagination, recherche, filtres, tri)
 * Centralise la logique commune entre useDocuments, useNews, useMedias, etc.
 *
 * @example
 * const state = useCollectionState({
 *   defaultSort: '-publish_date',
 *   defaultItemsPerPage: 10,
 *   syncUrl: true,
 *   urlParamsMapping: {
 *     search: 'q',
 *     filter: 'type'
 *   }
 * });
 */

export interface CollectionStateOptions {
  /** Tri par défaut (ex: '-publish_date', '-date_created') */
  defaultSort?: string;

  /** Nombre d'items par page par défaut */
  defaultItemsPerPage?: number;

  /** Valeur par défaut du filtre principal */
  defaultFilter?: string;

  /** Synchroniser l'état avec les query params de l'URL */
  syncUrl?: boolean;

  /** Mapping personnalisé des paramètres URL (ex: { search: 'q', filter: 'type' }) */
  urlParamsMapping?: {
    search?: string;
    filter?: string;
    page?: string;
    sort?: string;
  };

  /** Filtres additionnels spécifiques (ex: category, type, status) */
  additionalFilters?: Record<string, any>;
}

export interface CollectionState {
  // États réactifs
  currentPage: Ref<number>;
  searchQuery: Ref<string>;
  sortBy: Ref<string>;
  filterValue: Ref<string>;
  itemsPerPage: Ref<number>;

  // Méthodes
  setCurrentPage: (page: number) => void;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setFilterValue: (filter: string) => void;
  setItemsPerPage: (items: number) => void;
  resetFilters: () => void;

  // Computed
  hasActiveFilters: ComputedRef<boolean>;
}

export const useCollectionState = (
  options: CollectionStateOptions = {}
): CollectionState => {
  const route = useRoute();
  const router = useRouter();

  // Destructuration des options avec valeurs par défaut
  const {
    defaultSort = "-publish_date",
    defaultItemsPerPage = 10,
    defaultFilter = "all",
    syncUrl = true,
    urlParamsMapping = {},
    additionalFilters = {},
  } = options;

  // Mapping par défaut des paramètres URL
  const urlMapping = {
    search: urlParamsMapping.search || "search",
    filter: urlParamsMapping.filter || "filter",
    page: urlParamsMapping.page || "page",
    sort: urlParamsMapping.sort || "sort",
  };

  // Lecture des query params de façon SYNCHRONE (SSR + client).
  // ⚠️ NE PAS faire ceci dans onMounted : onMounted ne s'exécute pas côté
  // serveur, donc le SSR ignorerait ?page=N et rendrait toujours la page 1
  // (contenu serveur identique pour toutes les pages → bug pagination + SEO).
  const query = route.query;

  // Page
  let initialPage = 1;
  if (syncUrl && query[urlMapping.page]) {
    const page = parseInt(query[urlMapping.page] as string);
    if (!isNaN(page) && page > 0) {
      initialPage = page;
    }
  }

  // États réactifs (initialisés depuis l'URL pour un SSR correct)
  const currentPage = ref(initialPage);
  const searchQuery = ref(
    syncUrl && query[urlMapping.search] ? (query[urlMapping.search] as string) : "",
  );
  const sortBy = ref(
    syncUrl && query[urlMapping.sort] ? (query[urlMapping.sort] as string) : defaultSort,
  );
  const filterValue = ref(
    syncUrl && query[urlMapping.filter] ? (query[urlMapping.filter] as string) : defaultFilter,
  );
  const itemsPerPage = ref(defaultItemsPerPage);

  // Filtres additionnels (ex: category, type)
  if (syncUrl) {
    Object.keys(additionalFilters).forEach((key) => {
      if (query[key]) {
        additionalFilters[key].value = query[key];
      }
    });
  }

  // Mise à jour de l'URL quand l'état change
  // On merge avec route.query pour préserver les params gérés par d'autres watchers (year, family, etc.)
  const updateURL = useDebounceFn(() => {
    if (!syncUrl) return;

    const query: Record<string, string> = { ...(route.query as Record<string, string>) };

    // Page (ne pas ajouter si page 1)
    if (currentPage.value > 1) {
      query[urlMapping.page] = currentPage.value.toString();
    } else {
      delete query[urlMapping.page];
    }

    // Recherche
    if (searchQuery.value && searchQuery.value.trim() !== "") {
      query[urlMapping.search] = searchQuery.value.trim();
    } else {
      delete query[urlMapping.search];
    }

    // Tri (ne pas ajouter si tri par défaut)
    if (sortBy.value !== defaultSort) {
      query[urlMapping.sort] = sortBy.value;
    } else {
      delete query[urlMapping.sort];
    }

    // Filtre principal (ne pas ajouter si valeur par défaut)
    if (filterValue.value && filterValue.value !== defaultFilter) {
      query[urlMapping.filter] = filterValue.value;
    } else {
      delete query[urlMapping.filter];
    }

    // Filtres additionnels
    Object.keys(additionalFilters).forEach((key) => {
      const value = additionalFilters[key].value;
      if (
        value !== undefined &&
        value !== null &&
        value !== "" &&
        value !== "all"
      ) {
        query[key] = value;
      } else {
        delete query[key];
      }
    });

    // Remplacer l'URL sans recharger la page
    router.replace({ query });
  }, 300);

  // Watchers pour synchroniser l'URL
  if (syncUrl) {
    watch(
      [currentPage, searchQuery, sortBy, filterValue],
      () => {
        updateURL();
      },
      { deep: true }
    );

    // Watcher pour les filtres additionnels
    Object.values(additionalFilters).forEach((filter: any) => {
      if (isRef(filter)) {
        watch(filter, updateURL);
      }
    });
  }

  // Méthodes
  const setCurrentPage = (page: number) => {
    if (page > 0) {
      currentPage.value = page;
    }
  };

  const setSearchQuery = (query: string) => {
    searchQuery.value = query;
    // Reset à la page 1 lors d'une nouvelle recherche
    currentPage.value = 1;
  };

  const setSortBy = (sort: string) => {
    sortBy.value = sort;
    // Reset à la page 1 lors d'un changement de tri
    currentPage.value = 1;
  };

  const setFilterValue = (filter: string) => {
    filterValue.value = filter;
    // Reset à la page 1 lors d'un changement de filtre
    currentPage.value = 1;
  };

  const setItemsPerPage = (items: number) => {
    if (items > 0) {
      itemsPerPage.value = items;
      // Reset à la page 1 lors d'un changement du nombre d'items
      currentPage.value = 1;
    }
  };

  const resetFilters = () => {
    currentPage.value = 1;
    searchQuery.value = "";
    sortBy.value = defaultSort;
    filterValue.value = defaultFilter;

    // Reset des filtres additionnels
    Object.keys(additionalFilters).forEach((key) => {
      if (isRef(additionalFilters[key])) {
        additionalFilters[key].value =
          options.additionalFilters?.[key] || "all";
      }
    });
  };

  // Computed pour vérifier si des filtres sont actifs
  const hasActiveFilters = computed(() => {
    const hasSearch = searchQuery.value !== "";
    const hasFilter = filterValue.value !== defaultFilter;
    const hasSort = sortBy.value !== defaultSort;

    // Vérifier les filtres additionnels
    const hasAdditionalFilters = Object.values(additionalFilters).some(
      (filter: any) => {
        if (isRef(filter)) {
          const value = filter.value;
          return value !== "" && value !== "all" && value !== undefined;
        }
        return false;
      }
    );

    return hasSearch || hasFilter || hasSort || hasAdditionalFilters;
  });

  return {
    // États réactifs
    currentPage,
    searchQuery,
    sortBy,
    filterValue,
    itemsPerPage,

    // Méthodes
    setCurrentPage,
    setSearchQuery,
    setSortBy,
    setFilterValue,
    setItemsPerPage,
    resetFilters,

    // Computed
    hasActiveFilters,
  };
};
