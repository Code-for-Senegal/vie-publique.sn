import type { ElectionStatsProfession } from "~/types/election-stats-profession";

/**
 * Composable pour récupérer les statistiques des professions des candidats
 * Architecture SSR : les appels passent par le serveur Nuxt
 *
 * @param coalitionId - ID de la coalition pour filtrer (optionnel)
 * @example
 * const { data: professions, pending, error } = useElectionProfessions();
 * const { data: professionsByCoalition } = useElectionProfessions('coalition-id');
 */
export const useElectionProfessions = (coalitionId?: string) => {
  console.debug("useElectionProfessions");

  return useAsyncData(
    `candidatesProfessions${coalitionId ? `-${coalitionId}` : ""}`,
    () =>
      $fetch<{ data: ElectionStatsProfession[] }>('/api/elections/stats/professions', {
        query: coalitionId ? { coalition: coalitionId } : {},
      }),
    {
      transform: (response) => response.data,
      server: true,
      lazy: false,
    },
  );
};
