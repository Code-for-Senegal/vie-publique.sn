import type { AssemblyOfficeMember } from "~/types/assembly";

export interface AssemblyOfficeOptions {
  /** Tri par défaut */
  sort?: string;

  /** Synchroniser avec l'URL */
  syncUrl?: boolean;
}

/**
 * Composable pour gérer le bureau de l'assemblée nationale
 * Utilise useCmsCollection pour le fetch (pas de pagination, liste limitée)
 *
 * @example
 * const { office, loading } = useAssemblyOffice();
 */
export const useAssemblyOffice = (options: AssemblyOfficeOptions = {}) => {
  // Le bureau n'a pas besoin de pagination ni de filtres complexes
  // C'est une liste limitée et fixe
  const { data, pending, error, refresh } = useFetch("/api/assembly/office", {
    key: "assembly-office",
    query: {
      sortBy: options.sort || "rank",
    },
  });

  // Computed pour extraire les données
  const office = computed(() => (data.value as any)?.office || []);
  const totalMembers = computed(() => (data.value as any)?.totalMembers || 0);

  return {
    // Données
    office,
    totalMembers,
    loading: pending,
    error,
    refresh,

    // Méthodes de compatibilité avec l'ancien code (deprecated)
    fetchAssemblyOffice: refresh,
    resetOffice: () => {
      // Pas besoin de reset, useFetch gère déjà l'état
    },
  };
};
