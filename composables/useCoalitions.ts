import type { Coalition } from "~/types/coalition";

/**
 * Composable pour récupérer les coalitions électorales
 * Architecture SSR : les appels passent par le serveur Nuxt
 *
 * @param coalitionId - ID de la coalition pour récupération unitaire
 * @param ranking - Inclure les données de classement (voix, pourcentage, sièges)
 * @example
 * // Liste des coalitions
 * const { data: coalitions } = useCoalitions();
 *
 * // Liste avec classement
 * const { data: coalitionsRanked } = useCoalitions(null, true);
 *
 * // Détails d'une coalition
 * const { data: coalition } = useCoalitions('coalition-id');
 */
export const useCoalitions = (
  coalitionId?: string | null,
  ranking?: boolean,
) => {
  console.debug("useCoalitions");

  // Détermine l'URL en fonction de la présence d'un `coalitionId`
  const apiUrl = coalitionId
    ? `/api/elections/coalitions/${coalitionId}`
    : `/api/elections/coalitions`;

  return useAsyncData(
    `coalitions${coalitionId ? `-${coalitionId}` : ""}${ranking ? "-ranking" : ""}`,
    () =>
      $fetch<{ data: Coalition[] | Coalition }>(apiUrl, {
        query: ranking && !coalitionId ? { ranking: "true" } : {},
      }),
    {
      transform: (response) => response.data,
      server: true,
      lazy: false,
    },
  );
};
