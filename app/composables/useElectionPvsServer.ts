// composables/useElectionPvsServer.ts

interface PvsOptions {
  /** Source des PVs: 'national' ou 'etranger' */
  source?: "national" | "etranger";
}

/**
 * Composable pour gérer les procès-verbaux (PVs) électoraux
 * Architecture SSR : les appels passent par le serveur Nuxt
 *
 * @example
 * const { pvs, loading, error, currentSource, switchSource } = useElectionPvsServer();
 */
export const useElectionPvsServer = (options: PvsOptions = {}) => {
  const currentSource = ref<"national" | "etranger">(
    options.source || "national"
  );

  // Construction de l'URL basée sur la source
  const apiUrl = computed(
    () => `/api/elections/pvs/${currentSource.value}`
  );

  // Utilisation de useFetch pour le SSR
  const { data, pending, error, refresh } = useFetch<any[]>(apiUrl, {
    // SSR activé par défaut
    // Le fetch est automatiquement relancé quand l'URL change
    watch: [apiUrl],
  });

  // Méthode pour changer de source
  const switchSource = async (source: "national" | "etranger") => {
    currentSource.value = source;
    // Le watch sur apiUrl va automatiquement relancer le fetch
  };

  return {
    pvs: computed(() => data.value || []),
    loading: pending,
    error,
    currentSource: readonly(currentSource),
    refresh,

    // Méthodes
    switchSource,
    fetchPvs: switchSource, // Alias pour compatibilité
    reset: () => {
      currentSource.value = "national";
    },
  };
};

// ===== MÉTHODE DÉPRÉCIÉE (pour compatibilité ascendante) =====

/**
 * @deprecated Utilisez useElectionPvsServer() à la place
 */
export const usePvs = (initialSource: "national" | "etranger" = "national") => {
  console.warn(
    "usePvs() avec fetch client est déprécié. Utilisez useElectionPvsServer() à la place."
  );

  const { pvs, loading, error, currentSource, switchSource, reset } =
    useElectionPvsServer({ source: initialSource });

  return {
    pvs,
    loading,
    error,
    currentSource,
    fetchPvs: switchSource,
    reset,
  };
};

/**
 * @deprecated Utilisez useElectionPvsServer() à la place
 */
export const useElectionPvs = (
  initialSource: "national" | "etranger" = "national"
) => {
  console.warn(
    "useElectionPvs() avec fetch client est déprécié. Utilisez useElectionPvsServer() à la place."
  );

  return useElectionPvsServer({ source: initialSource });
};
