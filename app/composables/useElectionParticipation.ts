// composables/useElectionParticipation.ts
import type { DepartmentData } from "~/types/election-participation";

/**
 * Composable pour gérer les données de participation aux élections
 * Architecture SSR : les appels passent par le serveur Nuxt
 *
 * @example
 * const { departments, loading, error, refresh } = useElectionParticipation();
 */
export const useElectionParticipation = () => {
  // Utilisation de useFetch pour le SSR
  const { data, pending, error, refresh } = useFetch<DepartmentData[]>(
    "/api/elections/participation",
    {
      // SSR activé par défaut
      // Cache de 5 minutes géré par le serveur
    }
  );

  return {
    departments: computed(() => data.value || []),
    loading: pending,
    error,
    refresh,
    lastUpdate: computed(() => new Date().toLocaleTimeString()),
  };
};
