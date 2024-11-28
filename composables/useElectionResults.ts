// composables/useElectionResults.ts
import type { DepartmentResult } from "~/types/election-result";

export const useElectionResults = () => {
  // State
  const results = ref<DepartmentResult[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastUpdate = ref(Date.now());

  // Cache control
  const cacheTime = 30 * 1000; // 30 seconds
  const lastFetchTime = ref(0);

  // Fetch results
  const fetchResults = async (force = false) => {
    // Check cache unless force refresh
    if (!force && Date.now() - lastFetchTime.value < cacheTime) {
      return;
    }

    loading.value = true;
    error.value = null;

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        config.public.sunuElectionApiUrl + "/results/departments",
        {
          headers: {
            "api-key": config.public.sunuElectionApiKey,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch results");
      }

      const data = await response.json();
      results.value = data;
      lastUpdate.value = Date.now();
      lastFetchTime.value = Date.now();
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Une erreur est survenue";
    } finally {
      loading.value = false;
    }
  };

  // Initial fetch
  if (process.client) {
    onMounted(() => {
      fetchResults();
    });
  }

  return {
    results: readonly(results),
    loading: readonly(loading),
    error: readonly(error),
    lastUpdate: readonly(lastUpdate),
    fetchResults,
  };
};
