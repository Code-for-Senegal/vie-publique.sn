import type { Contributor } from '~/types/contributor';

/**
 * Interface pour la réponse de l'API contributors
 */
interface ContributorsApiResponse {
  data: Contributor[];
  total: number;
}

/**
 * Composable pour gérer les contributeurs
 *
 * @example
 * ```vue
 * const { contributors, loading, error, refresh } = useContributors();
 * ```
 */
export const useContributors = () => {
  /**
   * Récupération des contributeurs via l'endpoint serveur
   * Utilise useFetch pour le SSR et le cache automatique
   */
  const {
    data: response,
    pending: loading,
    error,
    refresh,
  } = useFetch<ContributorsApiResponse>('/api/contributors', {
    // Cache la réponse côté client
    key: 'contributors-list',
    // Active le SSR pour un meilleur référencement
    server: true,
    // Pas de re-fetch automatique, utiliser refresh() si nécessaire
    lazy: false,
  });

  /**
   * Liste des contributeurs
   * Computed pour avoir une réactivité propre
   */
  const contributors = computed(() => response.value?.data || []);

  /**
   * Nombre total de contributeurs
   */
  const total = computed(() => response.value?.total || 0);

  return {
    // Données
    contributors,
    total,

    // États
    loading,
    error,

    // Méthodes
    refresh,
  };
};
