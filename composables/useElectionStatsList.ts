import type { ElectionStatsList } from "~/types/election-stats-profession";

/**
 * Composable pour récupérer les statistiques des listes électorales
 * Architecture SSR : les appels passent par le serveur Nuxt
 *
 * @example
 * const { data: lists, pending, error } = useElectionStatsList();
 */
export const useElectionStatsList = () => {
  console.debug("useElectionStatsList");

  return useAsyncData(
    `useElectionStatsList`,
    () => $fetch<{ data: ElectionStatsList[] }>('/api/elections/stats/lists'),
    {
      transform: (response) => response.data,
      server: true,
      lazy: false,
    },
  );
};
