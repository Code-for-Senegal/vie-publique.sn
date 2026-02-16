import type { ElectionStatsProfession } from "~~/types/election-stats-profession";

interface UseProfessionsOptions {
  coalitionId?: string | Ref<string | undefined>;
  year?: number | Ref<number>;
  type?: string | Ref<string>;
}

/**
 * Composable pour récupérer les statistiques des professions des candidats pour le Dashboard
 * Architecture SSR : les appels passent par le serveur Nuxt
 */
export const useElectoralProfessions = (options: UseProfessionsOptions = {}) => {
  console.debug("useElectoralProfessions");

  const coalitionId = isRef(options.coalitionId) ? options.coalitionId : ref(options.coalitionId);
  const year = isRef(options.year) ? options.year : ref(options.year);
  const type = isRef(options.type) ? options.type : ref(options.type);

  const query = computed(() => {
    const params: Record<string, any> = {};
    if (coalitionId.value) params.coalition = coalitionId.value;
    if (year.value) params.year = year.value;
    if (type.value) params.type = type.value;
    return params;
  });

  return useAsyncData(
    `candidatesProfessionsDashboard${coalitionId.value ? `-${coalitionId.value}` : ""}-${year.value || 'all'}-${type.value || 'all'}`,
    () =>
      $fetch<{ data: ElectionStatsProfession[] }>('/api/elections/dashboard/stats/professions', {
        query: query.value,
      }),
    {
      transform: (response) => response.data,
      server: true,
      lazy: false,
      watch: [coalitionId, year, type]
    },
  );
};
