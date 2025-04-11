// composables/usePvs.ts
export const usePvs = (initialSource: "national" | "etranger" = "national") => {
  const pvs = ref([]);
  const loading = ref(true);
  const error = ref(null);
  const currentSource = ref(initialSource);

  const fetchPvs = async (source: "national" | "etranger" = "national") => {
    loading.value = true;
    error.value = null;
    currentSource.value = source;

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.sunuElectionApiUrl}/pvs/${source}`,
        {
          headers: {
            "api-key": config.public.sunuElectionApiKey,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      pvs.value = data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Une erreur est survenue";
      pvs.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const reset = () => {
    pvs.value = [];
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchPvs(initialSource);
  });

  return {
    pvs,
    loading,
    error,
    fetchPvs,
    currentSource,
    reset,
  };
};
