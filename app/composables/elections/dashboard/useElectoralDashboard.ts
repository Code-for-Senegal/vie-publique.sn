export interface ElectionConfig {
  years: { label: string; value: number }[];
  types: { label: string; value: string }[];
  elections: any[];
}

export const useElectoralDashboard = () => {
  const selectedYear = useState<number>('election-selected-year');
  const selectedType = useState<string>('election-selected-type');
  const activeTab = useState<string>('election-active-tab', () => 'candidats');
  const selectedConstituencyId = useState<string | null>('election-selected-constituency-id', () => null);
  const selectedCoalitionId = useState<string | null>('election-selected-coalition-id', () => null);
  const selectedFilterConstituencyId = useState<string | null>('election-selected-filter-constituency-id', () => null);
  const searchQuery = useState<string>('election-search-query', () => '');
  const legislativeViewType = useState<string>('election-legislative-view-type', () => 'list');

  const { data: config, pending: loadingConfig, error: configError } = useFetch<ElectionConfig>('/api/elections/dashboard/config', {
      key: 'election-dashboard-config',
      server: true
  });

  // Initialiser avec la dernière élection "completed" par défaut
  watch(config, (newConfig) => {
    if (newConfig && newConfig.elections && newConfig.elections.length > 0) {
      // Si pas encore de sélection, prendre la dernière élection "completed"
      if (!selectedYear.value || !selectedType.value) {
        const completedElections = newConfig.elections.filter(e => e.status === 'completed');
        const defaultElection = completedElections.length > 0
          ? completedElections[0] // Déjà trié par année desc dans config.get.ts
          : newConfig.elections[0];

        if (defaultElection) {
          selectedYear.value = defaultElection.year;
          selectedType.value = defaultElection.type;
        }
      } else {
        // Vérifier que la sélection actuelle est valide
        if (!newConfig.years.some(y => y.value === selectedYear.value)) {
          selectedYear.value = newConfig.years[0].value;
        }
        if (!newConfig.types.some(t => t.value === selectedType.value)) {
          selectedType.value = newConfig.types[0].value;
        }
      }
    }
  }, { immediate: true });

  // Basculer automatiquement sur la dernière année disponible si le type change et qu'aucune élection n'existe pour l'année actuelle
  watch(selectedType, (newType) => {
    if (config.value?.elections) {
      const currentYear = selectedYear.value;
      const exists = config.value.elections.some(e => e.type === newType && e.year === currentYear);
      
      if (!exists) {
        const latestForType = config.value.elections
          .filter(e => e.type === newType)
          .sort((a, b) => b.year - a.year)[0];
        
        if (latestForType) {
          selectedYear.value = latestForType.year;
        }
      }
    }
  });

  const selectConstituency = (id: string) => {
    selectedConstituencyId.value = id;
  };

  const clearConstituency = () => {
    selectedConstituencyId.value = null;
    selectedCoalitionId.value = null;
    selectedFilterConstituencyId.value = null;
  };

  const selectCoalition = (id: string) => {
    selectedCoalitionId.value = id;
  };

  const clearCoalition = () => {
    selectedCoalitionId.value = null;
  };

  const currentElection = computed(() => {
    if (!config.value?.elections) return null;
    return config.value.elections.find(e => e.year === selectedYear.value && e.type === selectedType.value) || null;
  });

  // Sync avec les query params (uniquement sur la page dashboard)
  if (process.client) {
    const route = useRoute();
    const router = useRouter();
    const isDashboardPage = computed(() => route.path.includes('/elections-senegal/dashboard'));

    // Initialiser depuis les query params si on est sur le dashboard
    watch(isDashboardPage, (isDashboard) => {
      if (isDashboard) {
        if (route.query.year) {
          const yearFromQuery = parseInt(route.query.year as string);
          if (!isNaN(yearFromQuery)) selectedYear.value = yearFromQuery;
        }
        if (route.query.type) selectedType.value = route.query.type as string;
        if (route.query.tab) activeTab.value = route.query.tab as string;
        if (route.query.coalition) selectedCoalitionId.value = route.query.coalition as string;
        if (route.query.constituency) selectedConstituencyId.value = route.query.constituency as string;
        if (route.query.q) searchQuery.value = route.query.q as string;
        if (route.query.view) legislativeViewType.value = route.query.view as string;
      }
    }, { immediate: true });

    // Mettre à jour l'URL quand les filtres changent (uniquement sur le dashboard)
    watch([selectedYear, selectedType, activeTab, searchQuery, selectedCoalitionId, selectedConstituencyId, legislativeViewType], ([year, type, tab, search, coal, consti, view]) => {
      if (!isDashboardPage.value) return;

      const query: any = { ...route.query };
      if (year) query.year = String(year);
      if (type) query.type = type;
      if (tab) query.tab = tab;
      if (view && type === 'legislative') query.view = view;
      else delete query.view;
      
      if (coal) query.coalition = coal;
      else delete query.coalition;

      if (consti) query.constituency = consti;
      else delete query.constituency;

      if (search) {
        query.q = search;
      } else {
        delete query.q;
      }

      router.replace({ query });
    });
  }

  return {
    selectedYear,
    selectedType,
    activeTab,
    selectedConstituencyId,
    selectedCoalitionId,
    selectedFilterConstituencyId,
    searchQuery,
    legislativeViewType,
    config,
    currentElection,
    loadingConfig,
    configError,
    selectConstituency,
    clearConstituency,
    selectCoalition,
    clearCoalition
  };
};
