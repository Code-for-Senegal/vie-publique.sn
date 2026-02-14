import type { AssemblyQuestion } from '~~/types/assembly';

export interface TopDeputy {
  id: string;
  first_name: string;
  last_name: string;
  photo: string | null;
  questionsCount: number;
}

export interface AssemblyQuestionsOptions {
  /** ID de la question pour récupération unitaire */
  id?: string | Ref<string>;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;

  /** Inclure les statistiques des députés les plus actifs */
  includeStats?: boolean;

  /** Nombre de députés à retourner dans le top */
  topDeputiesLimit?: number;
}

/**
 * Composable pour gérer les questions parlementaires
 * Utilise useCmsCollection pour le fetch et useCollectionState pour l'état UI
 *
 * @example
 * // Liste avec filtres
 * const { questions, loading, searchQuery, filterStatus } = useAssemblyQuestions();
 *
 * // Détail d'une question
 * const { question, loading } = useAssemblyQuestions({ id: '123' });
 */
export const useAssemblyQuestions = (options: AssemblyQuestionsOptions = {}) => {
  // Pour une question unique, pas besoin de state UI
  if (unref(options.id)) {
    const collection = useCmsCollection<AssemblyQuestion>({
      collection: 'assembly/questions',
      id: options.id as string | Ref<string>,
    });

    return {
      // Données
      question: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,

      // États vides pour compatibilité avec l'ancien code
      questions: computed(() => []),
      topDeputies: computed(() => []),
      topDeputiesLoading: computed(() => false),
      currentPage: ref(1),
      searchQuery: ref(''),
      sortBy: ref(options.sort || '-question_date'),
      filterStatus: ref('published'),
      itemsPerPage: ref(options.limit || 50),
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
      fetchAssemblyQuestions: () => {},
      fetchAssemblyQuestionById: async () => {},
      resetCommissions: () => {},
    };
  }

  // Gestion des filtres spécifiques aux questions
  const filterStatus = ref<string>('published'); // Status de la question (draft, published, answered)

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || '-question_date',
    defaultItemsPerPage: options.limit || 50,
    defaultFilter: 'published',
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'q',
      filter: 'status',
      page: 'page',
      sort: 'sort',
    },
  });

  // Construction des filtres spécifiques aux questions
  const filters = computed(() => {
    const filters: Record<string, any> = {};

    // Filtre par statut
    if (filterStatus.value && filterStatus.value !== 'all') {
      filters.filterStatus = filterStatus.value;
    }

    return filters;
  });

  // Utilisation du composable générique pour le fetch
  const collection = useCmsCollection<AssemblyQuestion>({
    collection: 'assembly/questions',
    filters,
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.searchQuery,
  });

  // Récupération des statistiques des députés les plus actifs (optionnel)
  // Note: useFetch doit toujours être appelé (pas conditionnellement) pour respecter les règles des hooks
  const statsQuery = computed(() => ({
    includeStats: options.includeStats ? 'true' : 'false',
    topDeputiesLimit: options.topDeputiesLimit || 4,
    limit: 1, // On ne veut que les stats, pas les questions
  }));

  const {
    data: statsData,
    status: statsStatus,
  } = useFetch('/api/assembly/questions', {
    key: 'assembly-questions-top-deputies',
    query: statsQuery,
    immediate: !!options.includeStats, // Ne fetch que si includeStats est true
  });

  const topDeputies = computed<TopDeputy[]>(() => statsData.value?.topDeputies || []);
  const topDeputiesLoading = computed(() => statsStatus.value === 'pending');

  // Computed pour compatibilité avec l'ancien code
  const totalItems = computed(() => collection.pagination.value?.total || 0);
  const totalPages = computed(() => collection.pagination.value?.totalPages || 1);

  // Méthodes spécifiques aux questions
  const setFilterStatus = (status: string) => {
    filterStatus.value = status;
    // Reset à la page 1 lors d'un changement de filtre
    state.currentPage.value = 1;
  };

  return {
    // Données
    questions: collection.items,
    question: collection.item,
    loading: collection.loading,
    pagination: collection.pagination,
    error: collection.error,
    refresh: collection.refresh,

    // Statistiques des députés les plus actifs
    topDeputies,
    topDeputiesLoading,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    itemsPerPage: state.itemsPerPage,

    // États spécifiques aux questions
    filterStatus,

    // Méthodes (depuis useCollectionState)
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: () => {
      state.resetFilters();
      filterStatus.value = 'published';
    },

    // Méthodes spécifiques
    setFilterStatus,

    // Computed
    totalItems,
    totalPages,
    hasActiveFilters: computed(
      () => state.hasActiveFilters.value || filterStatus.value !== 'published',
    ),

    // Méthodes de compatibilité avec l'ancien code (deprecated)
    fetchAssemblyQuestions: collection.refresh,
    fetchAssemblyQuestionById: async () => collection.refresh(),
    resetCommissions: () => {
      state.resetFilters();
      filterStatus.value = 'published';
    },
  };
};
