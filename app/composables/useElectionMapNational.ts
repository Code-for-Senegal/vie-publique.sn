import type { Ref } from 'vue';
import type {
  PollingStation,
  DepartmentStats,
} from "~~/types/election-map-national";

interface UseElectionDataOptions {
  electionId?: Ref<string | number | null> | string | number | null;
}

/**
 * Composable pour gérer les données de la carte électorale nationale
 * Architecture SSR : les appels passent par le serveur Nuxt
 *
 * @param options - Options du composable incluant l'ID de l'élection
 * @example
 * const { fetchDepartmentsStats, fetchDepartmentDetails, getDepartmentStats } = useElectionData({ electionId: ref(1) });
 */
export function useElectionData(options: UseElectionDataOptions = {}) {
  const { electionId } = options;

  // Computed pour obtenir la valeur de l'election ID
  const currentElectionId = computed(() => {
    if (!electionId) return null;
    const value = isRef(electionId) ? electionId.value : electionId;
    if (value === null || value === undefined) return null;
    return typeof value === 'string' ? value : String(value);
  });

  // Récupération de la liste des départements avec statistiques
  const fetchDepartmentsStats = () => {
    const queryParams = computed(() => {
      const params: Record<string, string> = { groupBy: "department" };
      if (currentElectionId.value) {
        params.election = currentElectionId.value;
      }
      return params;
    });

    return useFetch<DepartmentStats[]>("/api/elections/map/national", {
      key: computed(() => `departments-stats-${currentElectionId.value || 'all'}`),
      query: queryParams,
      transform: (response: any) => response.data,
      watch: [currentElectionId],
    });
  };

  // Récupération des détails d'un département spécifique
  const fetchDepartmentDetails = (department: string) => {
    const queryParams = computed(() => {
      const params: Record<string, string> = { department };
      if (currentElectionId.value) {
        params.election = currentElectionId.value;
      }
      return params;
    });

    return useFetch<PollingStation[]>("/api/elections/map/national", {
      key: computed(() => `department-${department}-${currentElectionId.value || 'all'}`),
      query: queryParams,
      transform: (response: any) => response.data,
      watch: [currentElectionId],
    });
  };

  // Stats en temps réel pour un département
  const getDepartmentStats = (department: string) => {
    const queryParams = computed(() => {
      const params: Record<string, string> = { department, groupBy: "department" };
      if (currentElectionId.value) {
        params.election = currentElectionId.value;
      }
      return params;
    });

    return useFetch<DepartmentStats>("/api/elections/map/national", {
      key: computed(() => `department-stats-${department}-${currentElectionId.value || 'all'}`),
      query: queryParams,
      transform: (response: any) => response.data[0],
      watch: [currentElectionId],
    });
  };

  return {
    fetchDepartmentsStats,
    fetchDepartmentDetails,
    getDepartmentStats,
  };
}
