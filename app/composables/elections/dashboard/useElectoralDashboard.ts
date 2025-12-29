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

  // Sync avec les query params
  if (process.client) {
    const route = useRoute();
    const router = useRouter();

    // Mettre à jour l'URL quand les filtres changent
    watch([selectedYear, selectedType], ([year, type]) => {
      if (year && type) {
        router.replace({
          query: { ...route.query, year: String(year), type }
        });
      }
    });

    // Initialiser depuis les query params si disponibles
    onMounted(() => {
      if (route.query.year) {
        const yearFromQuery = parseInt(route.query.year as string);
        if (!isNaN(yearFromQuery)) {
          selectedYear.value = yearFromQuery;
        }
      }
      if (route.query.type) {
        selectedType.value = route.query.type as string;
      }
    });
  }

  return {
    selectedYear,
    selectedType,
    activeTab,
    selectedConstituencyId,
    selectedCoalitionId,
    selectedFilterConstituencyId,
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
