import type { Candidate } from "~/types/candidate";

interface ElectoralList {
  name: string;
  type: "national" | "departmental" | "diaspora";
  is_substitute: boolean;
  candidates: Candidate[];
  constituency: { name: string } | null;
}

/**
 * Composable pour récupérer les listes électorales d'une coalition
 * Architecture SSR : les appels passent par le serveur Nuxt
 *
 * @param coalitionId - ID de la coalition
 * @example
 * const { data: lists, pending, error } = useElectoralLists('coalition-id');
 */
export const useElectoralLists = (coalitionId: string) => {
  return useAsyncData(
    `electoral-lists-${coalitionId}`,
    () => $fetch<{ data: ElectoralList[] }>(`/api/elections/lists/${coalitionId}`),
    {
      transform: (response) => response.data,
      server: true, // Exécution côté serveur pour le rendu initial
      lazy: false, // Exécution immédiate
    },
  );
};
