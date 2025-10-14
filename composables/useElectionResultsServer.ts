// composables/useElectionResultsServer.ts
import type { DepartmentResult } from "~/types/election-result";

/**
 * Composable pour gérer les résultats électoraux
 * Architecture SSR : les appels passent par le serveur Nuxt
 *
 * @example
 * const { results, loading, error, refresh } = useElectionResultsServer();
 */
export const useElectionResultsServer = () => {
  // Utilisation de useFetch pour le SSR
  const { data, pending, error, refresh } = useFetch<DepartmentResult[]>(
    "/api/elections/results/departments",
    {
      // SSR activé par défaut
      // Cache de 30 secondes géré par le serveur
    }
  );

  return {
    results: computed(() => data.value || []),
    loading: pending,
    error,
    refresh,
    lastUpdate: computed(() => Date.now()),

    // Méthode de compatibilité avec l'ancien code
    fetchResults: refresh,
  };
};

// ===== MÉTHODE DÉPRÉCIÉE (pour compatibilité ascendante) =====

/**
 * @deprecated Utilisez useElectionResultsServer() à la place
 */
export const useElectionResults = () => {
  console.warn(
    "useElectionResults() avec fetch client est déprécié. Utilisez useElectionResultsServer() à la place."
  );

  const { results, loading, error, refresh } = useElectionResultsServer();

  return {
    results,
    loading,
    error,
    lastUpdate: computed(() => Date.now()),
    fetchResults: refresh,
  };
};
