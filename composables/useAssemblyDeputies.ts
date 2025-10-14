// composables/useAssemblyDeputies.ts
import type { AssemblyDeputy, AssemblyDeputyCommission } from "~/types/assembly";

interface AssemblyDeputiesOptions {
  id?: string;
  groupId?: string;
  status?: string;
  limit?: number;
}

/**
 * Composable pour gérer les députés de l'Assemblée Nationale
 * Suit l'architecture SSR avec appels API via le serveur Nuxt
 */
export const useAssemblyDeputies = (options: AssemblyDeputiesOptions = {}) => {
  // Mode détail : récupérer un député spécifique
  if (options.id) {
    const collection = useCmsCollection<AssemblyDeputy>({
      collection: "assembly/deputies",
      id: options.id,
    });

    return {
      deputy: collection.item,
      loading: collection.loading,
      error: collection.error,
      refresh: collection.refresh,
    };
  }

  // Mode liste : récupérer la liste des députés avec filtres et pagination
  const state = useCollectionState({
    defaultSort: "last_name",
    defaultItemsPerPage: options.limit || 200,
    syncUrl: true,
    urlParamsMapping: {
      search: "q",
      filter: "groupId",
      page: "page",
    },
  });

  // Filtres spécifiques
  const groupId = computed(() => options.groupId || state.filterValue.value);
  const status = computed(() => options.status || "active");

  const collection = useCmsCollection<AssemblyDeputy>({
    collection: "assembly/deputies",
    filters: computed(() => ({
      groupId: groupId.value || undefined,
      status: status.value,
    })),
    sort: state.sortBy,
    limit: state.itemsPerPage,
    page: state.currentPage,
    search: state.searchQuery,
  });

  return {
    // Données
    deputies: collection.items,
    loading: collection.loading,
    error: collection.error,

    // Pagination
    currentPage: state.currentPage,
    itemsPerPage: state.itemsPerPage,
    totalItems: computed(() => collection.pagination.value?.total || 0),
    totalPages: computed(() => collection.pagination.value?.totalPages || 0),

    // Recherche et filtres
    searchQuery: state.searchQuery,
    filterValue: state.filterValue,
    sortBy: state.sortBy,

    // Actions
    setCurrentPage: state.setCurrentPage,
    setItemsPerPage: state.setItemsPerPage,
    setSearchQuery: state.setSearchQuery,
    setFilterValue: state.setFilterValue,
    setSortBy: state.setSortBy,
    resetFilters: state.resetFilters,
    refresh: collection.refresh,
  };
};

/**
 * Composable pour récupérer les commissions d'un député
 * @param deputyId - ID du député
 */
export const useAssemblyDeputyCommissions = (deputyId: string) => {
  const { data, pending, error, refresh } = useFetch<{
    commissions: AssemblyDeputyCommission[];
  }>(`/api/assembly/deputies/${deputyId}/commissions`);

  return {
    commissions: computed(() => data.value?.commissions || []),
    loading: pending,
    error,
    refresh,
  };
};

// ===== MÉTHODES DÉPRÉCIÉES (pour compatibilité ascendante) =====
// Ces méthodes sont conservées pour éviter de casser le code existant
// mais elles seront supprimées dans une version future

/**
 * @deprecated Utilisez useAssemblyDeputies() à la place
 * Cette méthode est conservée pour compatibilité ascendante
 */
export const fetchElectedDeputies = async (groupId?: string | null) => {
  console.warn(
    "fetchElectedDeputies() est déprécié. Utilisez useAssemblyDeputies() à la place."
  );
  // Cette fonction ne fait rien, les données sont chargées automatiquement via SSR
};

/**
 * @deprecated Utilisez useAssemblyDeputies({ id }) à la place
 * Cette méthode est conservée pour compatibilité ascendante
 */
export const fetchElectedDeputyById = async (id: string) => {
  console.warn(
    "fetchElectedDeputyById() est déprécié. Utilisez useAssemblyDeputies({ id }) à la place."
  );
  // Cette fonction ne fait rien, les données sont chargées automatiquement via SSR
};

/**
 * @deprecated Utilisez useAssemblyDeputyCommissions(deputyId) à la place
 * Cette méthode est conservée pour compatibilité ascendante
 */
export const fetchElectedDeputyCommissions = async (idDeputy: string) => {
  console.warn(
    "fetchElectedDeputyCommissions() est déprécié. Utilisez useAssemblyDeputyCommissions() à la place."
  );
  // Cette fonction ne fait rien, les données sont chargées automatiquement via SSR
};
