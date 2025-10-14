import type { Partner } from "~/types/partner";

/**
 * Interface pour la réponse de l'API partners
 */
interface PartnersApiResponse {
  data: Partner[];
  total: number;
}

/**
 * Composable pour gérer les partenaires
 *
 * @example
 * ```vue
 * const { partners, loading, error, refresh } = usePartners();
 * ```
 */
export const usePartners = () => {
  /**
   * Récupération des partenaires via l'endpoint serveur
   * Utilise useFetch pour le SSR et le cache automatique
   */
  const {
    data: response,
    pending: loading,
    error,
    refresh,
  } = useFetch<PartnersApiResponse>("/api/partners", {
    // Cache la réponse côté client
    key: "partners-list",
    // Active le SSR pour un meilleur référencement
    server: true,
    // Pas de re-fetch automatique, utiliser refresh() si nécessaire
    lazy: false,
  });

  /**
   * Liste des partenaires
   * Computed pour avoir une réactivité propre
   */
  const partners = computed(() => response.value?.data || []);

  /**
   * Nombre total de partenaires
   */
  const total = computed(() => response.value?.total || 0);

  return {
    // Données
    partners,
    total,

    // États
    loading,
    error,

    // Méthodes
    refresh,
  };
};
