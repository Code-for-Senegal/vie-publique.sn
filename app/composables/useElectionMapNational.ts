import type {
  PollingStation,
  DepartmentStats,
} from "~/types/election-map-national";

/**
 * Composable pour gérer les données de la carte électorale nationale
 * Architecture SSR : les appels passent par le serveur Nuxt
 *
 * @example
 * const { fetchDepartmentsStats, fetchDepartmentDetails, getDepartmentStats } = useElectionData();
 */
export function useElectionData() {
  // Récupération de la liste des départements avec statistiques
  const fetchDepartmentsStats = () => {
    return useFetch<DepartmentStats[]>("/api/elections/map/national", {
      key: "departments-stats",
      query: {
        groupBy: "department",
      },
      transform: (response: any) => response.data,
      // SSR activé par défaut avec useFetch
    });
  };

  // Récupération des détails d'un département spécifique
  const fetchDepartmentDetails = (department: string) => {
    return useFetch<PollingStation[]>("/api/elections/map/national", {
      key: `department-${department}`,
      query: {
        department,
      },
      transform: (response: any) => response.data,
      // SSR activé par défaut avec useFetch
    });
  };

  // Stats en temps réel pour un département
  const getDepartmentStats = (department: string) => {
    return useFetch<DepartmentStats>("/api/elections/map/national", {
      key: `department-stats-${department}`,
      query: {
        department,
        groupBy: "department",
      },
      transform: (response: any) => response.data[0], // Retourne directement les stats du département
      // SSR activé par défaut avec useFetch
    });
  };

  return {
    fetchDepartmentsStats,
    fetchDepartmentDetails,
    getDepartmentStats,
  };
}
