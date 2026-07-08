/**
 * Composable pour gérer les données de la diaspora par pays
 * Suit le pattern: component -> composable -> server -> Directus
 */

export interface DiasporaLocation {
  id: number;
  diplomatic_representation: string;
  country: string;
  locality: string;
  polling_place: string;
  office_number: number;
  voters: string;
}

export interface CountryStats {
  country: string;
  count: {
    office_number: number;
    polling_place: number;
  };
  sum: {
    voters: number;
  };
  countDistinct: {
    locality: number;
    polling_place: number;
  };
}

interface DiasporaCountryOptions {
  country: string;
  search?: Ref<string>;
  page?: Ref<number>;
  limit?: number;
  electionId?: Ref<string | undefined> | string | undefined;
}

/**
 * Composable pour récupérer les données d'un pays de la diaspora
 *
 * @example
 * ```vue
 * const { stats, locations, pending, totalPages } = useDiasporaCountry({
 *   country: 'France',
 *   search: searchQuery,
 *   page: currentPage,
 *   electionId: electionIdRef,
 * });
 * ```
 */
export const useDiasporaCountry = (options: DiasporaCountryOptions) => {
  const { country, search, page, limit = 1000, electionId } = options;

  // Computed pour obtenir la valeur de l'election ID
  const currentElectionId = computed(() => {
    if (!electionId) return undefined;
    const value = isRef(electionId) ? electionId.value : electionId;
    return value || undefined;
  });

  // Query params pour les statistiques
  const statsQueryParams = computed(() => {
    const params: Record<string, string> = {};
    if (currentElectionId.value) {
      params.election = currentElectionId.value;
    }
    return params;
  });

  // Query params pour les détails
  const detailsQueryParams = computed(() => {
    const params: Record<string, string | number> = {
      search: search?.value || "",
      page: page?.value || 1,
      limit,
    };
    if (currentElectionId.value) {
      params.election = currentElectionId.value;
    }
    return params;
  });

  // ✅ Récupération des statistiques du pays via l'endpoint serveur
  const {
    data: statsData,
    pending: statsPending,
    error: statsError,
    refresh: refreshStats,
  } = useFetch<{ data: CountryStats }>(
    `/api/elections/diaspora/country-stats/${encodeURIComponent(country)}`,
    {
      key: computed(() => `diaspora-stats-${country}-${currentElectionId.value || 'all'}`),
      query: statsQueryParams,
      server: true,
      watch: [currentElectionId],
    },
  );

  // ✅ Récupération des détails (bureaux de vote) via l'endpoint serveur
  const {
    data: locationsData,
    pending: locationsPending,
    error: locationsError,
    refresh: refreshLocations,
  } = useFetch<{
    data: DiasporaLocation[];
    meta: { total_count: number; page: number; limit: number; total_pages: number };
  }>(`/api/elections/diaspora/country-details/${encodeURIComponent(country)}`, {
    key: computed(() => `diaspora-details-${country}-${currentElectionId.value || 'all'}`),
    query: detailsQueryParams,
    server: true,
    watch: search && page ? [search, page, currentElectionId] : [currentElectionId],
  });

  // Computed pour les stats formatées
  const stats = computed(() => {
    const data = statsData.value?.data;
    return data
      ? {
          localities: data.countDistinct.locality,
          pollingPlaces: data.countDistinct.polling_place,
          offices: data.count.office_number,
          voters: data.sum.voters,
        }
      : null;
  });

  // Computed pour les locations
  const locations = computed(() => locationsData.value?.data || []);

  // Computed pour le nombre total de pages
  const totalPages = computed(
    () => locationsData.value?.meta?.total_pages || 0,
  );

  // Computed pour le total d'électeurs
  const totalCount = computed(
    () => locationsData.value?.meta?.total_count || 0,
  );

  // État de chargement global
  const pending = computed(
    () => statsPending.value || locationsPending.value,
  );

  // Erreurs
  const error = computed(() => statsError.value || locationsError.value);

  // Fonction pour rafraîchir toutes les données
  const refresh = async () => {
    await Promise.all([refreshStats(), refreshLocations()]);
  };

  return {
    // Données
    stats,
    locations,
    totalPages,
    totalCount,

    // États
    pending,
    error,

    // Méthodes
    refresh,
  };
};
