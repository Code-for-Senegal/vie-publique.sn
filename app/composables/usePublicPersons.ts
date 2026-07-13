import type { PublicPerson } from '~/types/public-person';

export interface PublicPersonsOptions {
  sort?: string;
  limit?: number;
  syncUrl?: boolean;
}

/**
 * Composable pour gérer la liste des personnalités publiques
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * const { persons, loading, searchQuery, filterCategory, filterGender } = usePublicPersons();
 */
export const usePublicPersons = (options: PublicPersonsOptions = {}) => {
  const route = useRoute();

  // Filtres spécifiques
  const filterCategory = ref<string>('all');
  const filterGender = ref<string>('all');

  // État UI avec sync URL
  const state = useCollectionState({
    defaultSort: options.sort || '-current_appointment.appointment_date',
    defaultItemsPerPage: options.limit || 25,
    defaultFilter: 'all',
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'q',
      filter: 'category',
      page: 'page',
      sort: 'sort',
    },
    additionalFilters: {
      gender: filterGender,
    },
  });

  // Lecture des filtres depuis l'URL au montage
  onMounted(() => {
    if (route.query.category) {
      filterCategory.value = route.query.category as string;
    }
    if (route.query.gender) {
      filterGender.value = route.query.gender as string;
    }
  });

  // Sync filtre catégorie avec URL
  watch(filterCategory, () => {
    const query: any = { ...route.query };
    if (filterCategory.value !== 'all') {
      query.category = filterCategory.value;
    } else {
      delete query.category;
    }
    useRouter().replace({ query });
  });

  // Construction des filtres pour l'API
  const filters = computed(() => {
    const f: Record<string, any> = {};
    if (filterCategory.value && filterCategory.value !== 'all') {
      f.filterCategory = filterCategory.value;
    }
    if (filterGender.value && filterGender.value !== 'all') {
      f.filterGender = filterGender.value;
    }
    return f;
  });

  // Fetch via composable générique
  const collection = useCmsCollection<PublicPerson>({
    collection: 'public-persons',
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.apiSearchQuery,
  });

  const totalItems = computed(() => collection.pagination.value?.total || 0);
  const totalPages = computed(() => collection.pagination.value?.totalPages || 1);

  const setFilterCategory = (category: string) => {
    filterCategory.value = category;
    state.currentPage.value = 1;
  };

  const setFilterGender = (gender: string) => {
    filterGender.value = gender;
    state.currentPage.value = 1;
  };

  // Stats globales
  const { data: stats } = useFetch('/api/public-persons/stats', {
    key: 'public-persons-stats',
  });

  const totalsByCategory = computed(() => {
    return stats.value?.totalsByCategory || {};
  });

  const totalsByGender = computed(() => {
    return stats.value?.totalsByGender || { maleCount: 0, femaleCount: 0 };
  });

  return {
    // Données
    persons: collection.items,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // États
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    itemsPerPage: state.itemsPerPage,
    filterCategory,
    filterGender,

    // Méthodes
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setItemsPerPage: state.setItemsPerPage,
    setFilterCategory,
    setFilterGender,
    resetFilters: () => {
      state.resetFilters();
      filterCategory.value = 'all';
      filterGender.value = 'all';
    },

    // Computed
    totalItems,
    totalPages,
    totalsByCategory,
    totalsByGender,
    hasActiveFilters: computed(
      () =>
        state.hasActiveFilters.value ||
        filterCategory.value !== 'all' ||
        filterGender.value !== 'all',
    ),
  };
};
