import type {
  PublicProjectFilters,
  PublicProjectStats,
  PublicProjectListResponse,
  PublicProjectDetailResponse,
} from '~~/types/public-project';

export interface UsePublicProjectsOptions {
  defaultYear?: number;
  defaultVersion?: number;
}

export const usePublicProjects = (options: UsePublicProjectsOptions = {}) => {
  // ─── État réactif des filtres ─────────────────────────────────────
  // Initialiser l'année avec une valeur par défaut stable (comme useBudget)
  const year = ref(options.defaultYear || 2026);
  const version = ref<number | undefined>(options.defaultVersion);
  const search = ref('');
  const sectorId = ref<number | undefined>();
  const policyId = ref<number | undefined>();
  const ministryId = ref<number | undefined>();
  const region = ref<string | undefined>();
  const isPres = ref<'all' | 'true' | 'false'>('all');
  const currentPage = ref(1);
  const sortBy = ref('-budget_total_amount');
  const itemsPerPage = ref(25);

  // ─── Fetch des valeurs de filtres (une seule fois) ────────────────
  const { data: filtersData } = useFetch<PublicProjectFilters>('/api/public-projects/filters', {
    key: 'public-projects-filters',
    server: true,
    default: () => ({
      sectors: [],
      policies: [],
      years: [],
      versions: [],
      ministries: [],
      regions: [],
    }),
  });

  // Initialiser l'année avec la plus récente quand les filtres sont chargés
  // IMPORTANT: Ne pas utiliser immediate: true pour éviter hydration mismatch (même pattern que useBudget)
  watch(
    () => filtersData.value?.years,
    (years) => {
      if (years && years.length > 0 && year.value === 2026 && !options.defaultYear) {
        year.value = years[0].year;
      }
    },
  );

  // ─── Computed : versions disponibles pour l'année sélectionnée ────
  const availableVersionsForYear = computed(() => {
    if (!filtersData.value || !year.value) return [];
    const yearItem = filtersData.value.years.find((y) => y.year === year.value);
    if (!yearItem) return [];
    return filtersData.value.versions.filter((v) => v.yearId === yearItem.yearId);
  });

  // ─── Fetch des KPI stats ──────────────────────────────────────────
  const statsQuery = computed(() => {
    const params: Record<string, any> = {};
    if (year.value) params.year = year.value;
    if (version.value) params.version = version.value;
    return params;
  });

  const { data: stats } = useFetch<PublicProjectStats>('/api/public-projects/stats', {
    key: computed(() => `pp-stats-${year.value}-${version.value || 'all'}`),
    query: statsQuery,
    watch: [year, version],
    server: true,
    lazy: false,
    default: () => ({
      totalProjects: 0,
      totalPres: 0,
      totalPriority: 0,
      totalMinistries: 0,
      totalSectors: 0,
      totalAE: null,
      totalCP: null,
      year: null,
      versionLabel: null,
    }),
  });

  // ─── Query filtres partagé (sans pagination) ─────────────────────
  const filterQuery = computed(() => {
    const params: Record<string, any> = {};
    if (search.value) params.search = search.value;
    if (sectorId.value) params.sector = sectorId.value;
    if (policyId.value) params.policy = policyId.value;
    if (ministryId.value) params.ministry = ministryId.value;
    if (region.value) params.region = region.value;
    if (year.value) params.year = year.value;
    if (version.value) params.version = version.value;
    if (isPres.value !== 'all') params.isPres = isPres.value;
    return params;
  });

  // ─── Fetch de la liste paginée (pour le tableau) ────────────────
  const listQuery = computed(() => ({
    ...filterQuery.value,
    page: currentPage.value,
    limit: itemsPerPage.value,
    sortBy: sortBy.value,
  }));

  const {
    data: projectsData,
    pending: loading,
    error,
    refresh,
  } = useFetch<PublicProjectListResponse>('/api/public-projects', {
    key: computed(
      () =>
        `pp-list-${year.value}-${currentPage.value}-${sortBy.value}-${search.value || ''}-${sectorId.value || ''}-${ministryId.value || ''}-${isPres.value}`,
    ),
    query: listQuery,
    watch: [listQuery],
    server: true,
    lazy: false,
    default: () => ({
      projects: [],
      pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
    }),
  });

  // ─── Fetch de TOUS les projets filtrés (pour graphiques et carte) ─
  const allQuery = computed(() => ({
    ...filterQuery.value,
    limit: -1,
    sortBy: '-budget_total_amount',
  }));

  const { data: allProjectsData } = useFetch<PublicProjectListResponse>('/api/public-projects', {
    key: computed(
      () =>
        `pp-all-${year.value}-${search.value || ''}-${sectorId.value || ''}-${policyId.value || ''}-${ministryId.value || ''}-${region.value || ''}-${isPres.value}`,
    ),
    query: allQuery,
    watch: [allQuery],
    server: true,
    lazy: false,
    default: () => ({
      projects: [],
      pagination: { page: 1, limit: -1, total: 0, totalPages: 1 },
    }),
  });

  // ─── Computed accesseurs ──────────────────────────────────────────
  const projects = computed(() => projectsData.value?.projects || []);
  const allProjects = computed(() => allProjectsData.value?.projects || []);
  const pagination = computed(
    () => projectsData.value?.pagination || { page: 1, limit: 25, total: 0, totalPages: 0 },
  );

  const availableYears = computed(() => filtersData.value?.years || []);
  const availableSectors = computed(() => filtersData.value?.sectors || []);
  const availablePolicies = computed(() => filtersData.value?.policies || []);
  const availableMinistries = computed(() => filtersData.value?.ministries || []);
  const availableRegions = computed(() => filtersData.value?.regions || []);

  const hasActiveFilters = computed(() => {
    return !!(
      search.value ||
      sectorId.value ||
      policyId.value ||
      ministryId.value ||
      region.value ||
      isPres.value !== 'all'
    );
  });

  // ─── Méthodes ─────────────────────────────────────────────────────
  const setYear = (newYear: number | undefined) => {
    year.value = newYear;
    version.value = undefined;
    currentPage.value = 1;
  };

  const setVersion = (newVersion: number | undefined) => {
    version.value = newVersion;
    currentPage.value = 1;
  };

  const setSearch = (newSearch: string) => {
    search.value = newSearch;
    currentPage.value = 1;
  };

  const setSector = (id: number | undefined) => {
    sectorId.value = id;
    currentPage.value = 1;
  };

  const setPolicy = (id: number | undefined) => {
    policyId.value = id;
    currentPage.value = 1;
  };

  const setMinistry = (id: number | undefined) => {
    ministryId.value = id;
    currentPage.value = 1;
  };

  const setRegion = (r: string | undefined) => {
    region.value = r;
    currentPage.value = 1;
  };

  const setIsPres = (value: 'all' | 'true' | 'false') => {
    isPres.value = value;
    currentPage.value = 1;
  };

  const setPage = (page: number) => {
    currentPage.value = page;
  };

  const setSortBy = (sort: string) => {
    sortBy.value = sort;
    currentPage.value = 1;
  };

  const resetFilters = () => {
    search.value = '';
    sectorId.value = undefined;
    policyId.value = undefined;
    ministryId.value = undefined;
    region.value = undefined;
    isPres.value = 'all';
    currentPage.value = 1;
  };

  return {
    // État des filtres
    year,
    version,
    search,
    sectorId,
    policyId,
    ministryId,
    region,
    isPres,
    currentPage,
    sortBy,
    itemsPerPage,

    // Valeurs de filtres disponibles
    availableYears,
    availableVersionsForYear,
    availableSectors,
    availablePolicies,
    availableMinistries,
    availableRegions,

    // Données
    stats,
    projects,
    allProjects,
    pagination,
    loading,
    error,

    // Computed
    hasActiveFilters,

    // Méthodes
    setYear,
    setVersion,
    setSearch,
    setSector,
    setPolicy,
    setMinistry,
    setRegion,
    setIsPres,
    setPage,
    setSortBy,
    resetFilters,
    refresh,
  };
};

// ─── Composable pour la page détail ─────────────────────────────────
export const usePublicProjectDetail = (slug: string) => {
  const {
    data: detailData,
    pending: loading,
    error,
  } = useFetch<PublicProjectDetailResponse>(`/api/public-projects/${slug}`, {
    key: `pp-detail-${slug}`,
    server: true,
    lazy: false,
  });

  const project = computed(() => detailData.value?.project || null);
  const budgetYears = computed(() => detailData.value?.budgetYears || []);

  return {
    project,
    budgetYears,
    loading,
    error,
  };
};
