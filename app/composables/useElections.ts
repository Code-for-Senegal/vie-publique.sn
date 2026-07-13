// composables/useElections.ts
import type { ElectionCandidate } from '~/types/election';

interface ElectionCandidatesOptions {
  /** ID du candidat pour récupération unitaire */
  id?: string;

  /** Filtrer par coalition */
  coalition?: string;

  /** Filtrer par genre */
  gender?: string;

  /** Tri par défaut */
  sort?: string;

  /** Nombre d'items par page */
  limit?: number;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer les candidats élus aux élections
 * Suit l'architecture SSR avec appels API via le serveur Nuxt
 *
 * @example
 * // Liste des candidats élus avec filtres
 * const { candidates, loading, searchQuery, filterCoalition } = useElections();
 *
 * // Détail d'un candidat
 * const { candidate, loading } = useElections({ id: '123' });
 */
export const useElections = (options: ElectionCandidatesOptions = {}) => {
  // Mode détail : récupérer un candidat spécifique
  if (options.id) {
    const { data, pending, error, refresh } = useFetch<{
      candidate: ElectionCandidate;
    }>(`/api/elections/candidates/${options.id}`);

    return {
      // Données
      candidate: computed(() => data.value?.candidate || null),
      loading: pending,
      error,
      refresh,

      // États vides pour compatibilité avec l'ancien code
      candidates: computed(() => []),
      currentPage: ref(1),
      searchQuery: ref(''),
      sortBy: ref(options.sort || 'last_name'),
      filterCoalition: ref(''),
      filterGender: ref(''),
      itemsPerPage: ref(options.limit || 200),
      totalItems: computed(() => 0),
      totalPages: computed(() => 0),
      hasActiveFilters: computed(() => false),

      // Méthodes vides pour compatibilité
      setCurrentPage: () => {},
      setSearchQuery: () => {},
      setSortBy: () => {},
      setFilterCoalition: () => {},
      setFilterGender: () => {},
      setItemsPerPage: () => {},
      resetFilters: () => {},
    };
  }

  // État UI géré par useCollectionState
  const state = useCollectionState({
    defaultSort: options.sort || 'last_name',
    defaultItemsPerPage: options.limit || 200,
    syncUrl: options.syncUrl !== false,
    urlParamsMapping: {
      search: 'q',
      filter: 'coalition',
      page: 'page',
      sort: 'sort',
    },
  });

  // Filtres spécifiques
  const filterCoalition = computed(() => options.coalition || state.filterValue.value);
  const filterGender = ref<string>('');

  // Construction de la query string
  const queryParams = computed(() => {
    const params: Record<string, any> = {
      page: state.currentPage.value,
      limit: state.itemsPerPage.value,
      sort: state.sortBy.value,
    };

    if (filterCoalition.value) {
      params.coalition = filterCoalition.value;
    }

    if (filterGender.value) {
      params.gender = filterGender.value;
    }

    if (state.apiSearchQuery.value) {
      params.search = state.apiSearchQuery.value;
    }

    return params;
  });

  // Utilisation de useFetch pour le fetch SSR
  const { data, pending, error, refresh } = useFetch<{
    candidates: ElectionCandidate[];
    totalCandidates: number;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }>('/api/elections/candidates/elected', {
    query: queryParams,
    // SSR activé par défaut avec useFetch
    // Les données seront chargées côté serveur lors du rendu initial
  });

  // Computed pour compatibilité
  const candidates = computed(() => data.value?.candidates || []);
  const totalItems = computed(() => data.value?.pagination.total || 0);
  const totalPages = computed(() => data.value?.pagination.totalPages || 0);

  // Méthodes spécifiques
  const setFilterCoalition = (coalition: string) => {
    state.setFilterValue(coalition);
    state.currentPage.value = 1;
  };

  const setFilterGender = (gender: string) => {
    filterGender.value = gender;
    state.currentPage.value = 1;
  };

  return {
    // Données
    candidates,
    candidate: computed(() => null),
    loading: pending,
    error,
    refresh,

    // États réactifs (depuis useCollectionState)
    currentPage: state.currentPage,
    searchQuery: state.searchQuery,
    sortBy: state.sortBy,
    itemsPerPage: state.itemsPerPage,

    // Filtres spécifiques
    filterCoalition,
    filterGender,

    // Méthodes (depuis useCollectionState)
    setCurrentPage: state.setCurrentPage,
    setSearchQuery: state.setSearchQuery,
    setSortBy: state.setSortBy,
    setItemsPerPage: state.setItemsPerPage,
    resetFilters: () => {
      state.resetFilters();
      filterGender.value = '';
    },

    // Méthodes spécifiques
    setFilterCoalition,
    setFilterGender,

    // Computed
    totalItems,
    totalPages,
    hasActiveFilters: computed(() => state.hasActiveFilters.value || filterGender.value !== ''),
  };
};

// ===== MÉTHODES DÉPRÉCIÉES (pour compatibilité ascendante) =====

/**
 * @deprecated Utilisez useElections() à la place
 */
export const useElectionElectedCandidates = () => {
  console.warn('useElectionElectedCandidates() est déprécié. Utilisez useElections() à la place.');

  const { candidates, loading, error, refresh } = useElections();

  // Garder les refs pour compatibilité avec l'ancien code
  const deputies = candidates;

  return {
    deputies,
    candidates,
    loading,
    error,
    fetchElectedDeputies: refresh,
    reset: () => {},
  };
};
