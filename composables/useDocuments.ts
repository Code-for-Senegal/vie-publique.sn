import type { Document } from "~/types/document";

export interface DocumentsOptions {
  id?: string;
  type?: string;
  filterType?: string;
  sort?: string;
  limit?: number;
}

export const useDocuments = (options: DocumentsOptions = {}) => {
  const route = useRoute();
  const router = useRouter();

  // États réactifs pour les paramètres
  const currentPage = ref(1);
  const searchQuery = ref("");
  const sortBy = ref(options.sort || "-publish_date");
  const documentType = ref(options.type || "");
  const filterType = ref(options.filterType || "all");
  const itemsPerPage = ref(options.limit || 10);

  // Récupération des paramètres depuis l'URL au montage (seulement pour les collections)
  onMounted(() => {
    if (!options.id) {
      const query = route.query;

      if (query.page) {
        const page = parseInt(query.page as string);
        if (!isNaN(page)) currentPage.value = page;
      }
      if (query.q) {
        searchQuery.value = query.q as string;
      }
      if (query.sort) {
        sortBy.value = query.sort as string;
      }
      if (query.type) {
        documentType.value = query.type as string;
      }
      if (query.organisme) {
        filterType.value = query.organisme as string;
      }
      if (query.year) {
        filterType.value = query.year as string;
      }
    }
  });

  // Construction des filtres spécifiques aux documents
  const filters = computed(() => {
    if (options.id) return {};

    const filters: any = {};

    if (documentType.value) {
      filters.type = documentType.value;
    }

    if (filterType.value && filterType.value !== "all") {
      if (documentType.value === "official_journal") {
        filters.filterType = filterType.value;
      } else if (documentType.value === "audit_report") {
        filters.filterType = filterType.value;
      } else if (!documentType.value) {
        filters.type = filterType.value;
      }
    }

    return filters;
  });

  // Mise à jour de l'URL (seulement pour les collections)
  const updateURL = useDebounceFn(() => {
    if (options.id) return;

    const query: any = {};

    if (currentPage.value > 1) query.page = currentPage.value.toString();
    if (searchQuery.value) query.q = searchQuery.value;
    if (sortBy.value !== "-publish_date") query.sort = sortBy.value;

    if (documentType.value === "audit_report" && filterType.value !== "all") {
      query.organisme = filterType.value;
    } else if (
      documentType.value === "official_journal" &&
      filterType.value !== "all"
    ) {
      query.year = filterType.value;
    } else if (!documentType.value && filterType.value !== "all") {
      query.type = filterType.value;
    }

    router.replace({ query });
  }, 300);

  // Watchers pour la synchronisation URL (seulement pour les collections)
  if (!options.id) {
    watch([currentPage, searchQuery, sortBy, filterType], () => {
      updateURL();
    });
  }

  // Utilisation du composable générique
  const collection = useCmsCollection<Document>({
    collection: "documents", // Collection spécifique
    id: options.id,
    filters,
    sort: sortBy,
    limit: itemsPerPage,
    page: currentPage,
    search: searchQuery,
  });

  // Computed pour la compatibilité
  const totalItems = computed(() => collection.pagination.value?.total || 0);
  const totalPages = computed(
    () => collection.pagination.value?.totalPages || 1,
  );

  return {
    // Données
    documents: collection.items,
    document: collection.item, // Pour les détails
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États réactifs (seulement pour les collections)
    currentPage: options.id ? ref(1) : currentPage,
    searchQuery: options.id ? ref("") : searchQuery,
    sortBy: options.id ? ref("-publish_date") : sortBy,
    documentType: options.id ? ref("") : documentType,
    filterType: options.id ? ref("all") : filterType,
    itemsPerPage: options.id ? ref(10) : itemsPerPage,

    // Computed pour la compatibilité
    totalItems,
    totalPages,

    // Méthodes (seulement pour les collections)
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
    setSelectedFilter: options.id
      ? () => {}
      : (filter: string) => {
          filterType.value = filter;
          currentPage.value = 1;
        },
    setSortBy: options.id
      ? () => {}
      : (sort: string) => {
          sortBy.value = sort;
        },
    setType: options.id
      ? () => {}
      : (type: string) => {
          documentType.value = type;
          filterType.value = "all";
          currentPage.value = 1;
        },
    setTotalItems: () => {},
    resetFilters: options.id
      ? () => {}
      : () => {
          currentPage.value = 1;
          searchQuery.value = "";
          sortBy.value = "-publish_date";
          filterType.value = "all";
        },

    hasActiveFilters: options.id
      ? computed(() => false)
      : computed(() => {
          return (
            searchQuery.value !== "" ||
            filterType.value !== "all" ||
            sortBy.value !== "-publish_date" ||
            documentType.value !== ""
          );
        }),
  };
};
