import type { ElectionStatsList } from "~~/types/election-stats-profession";

interface UseStatsListOptions {
    year?: number | Ref<number>;
    type?: string | Ref<string>;
}

/**
 * Composable pour récupérer les statistiques des listes électorales pour le Dashboard
 * Architecture SSR : les appels passent par le serveur Nuxt
 */
export const useElectoralStatsList = (options: UseStatsListOptions = {}) => {
  console.debug("useElectoralStatsList");
  
  const year = isRef(options.year) ? options.year : ref(options.year);
  const type = isRef(options.type) ? options.type : ref(options.type);
  
  const query = computed(() => {
    const params: Record<string, any> = {};
    if (year.value) params.year = year.value;
    if (type.value) params.type = type.value;
    return params;
  });

  return useAsyncData(
    `useElectoralStatsList-${year.value || 'all'}-${type.value || 'all'}`,
    () => $fetch<{ data: ElectionStatsList[] }>('/api/elections/dashboard/stats/lists', {
        query: query.value
    }),
    {
      transform: (response) => response.data,
      server: true,
      lazy: false,
      watch: [year, type]
    },
  );
};
