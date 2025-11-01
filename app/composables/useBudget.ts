export interface BudgetMetric {
  code: string;
  label: string;
  value: number;
  unit: string;
  color?: string;
  note?: string;
}

export interface BudgetDocument {
  id: string;
  slug: string;
  title: string;
  file?: string;
  cover_image?: string;
}

export interface BudgetGlobalData {
  year: number;
  versionId: number;
  documents: BudgetDocument[];
  keyIndicators: BudgetMetric[];
  revenues: BudgetMetric[];
  expenses: BudgetMetric[];
  financing: BudgetMetric[];
  debt: BudgetMetric[];
  allMetrics: BudgetMetric[];
}

export interface BudgetYear {
  year: number;
  yearId: number;
  versions: BudgetVersion[];
}

export interface BudgetVersion {
  id: number;
  label: string;
}

export interface BudgetYearsData {
  years: BudgetYear[];
  latest: {
    year: number;
    versionId: number;
    versionLabel: string;
  } | null;
}

export interface UseBudgetOptions {
  year?: number;
  version?: number;
}

export const useBudget = (options: UseBudgetOptions = {}) => {
  // Fetch de la liste des années et versions disponibles
  const { data: yearsData } = useFetch<BudgetYearsData>("/api/budget/years", {
    key: "budget-years",
    default: () => ({ years: [], latest: null }),
  });

  // Initialiser avec la version la plus récente ou les options passées
  const year = ref(
    options.year || (yearsData.value?.latest?.year ?? 2026)
  );
  const version = ref(
    options.version || (yearsData.value?.latest?.versionId ?? undefined)
  );

  // Watcher pour mettre à jour automatiquement quand yearsData est chargé
  watch(
    () => yearsData.value?.latest,
    (latest) => {
      if (latest && !options.year && !options.version) {
        year.value = latest.year;
        version.value = latest.versionId;
      }
    },
    { immediate: true }
  );

  // Construction des query params
  const queryParams = computed(() => {
    const params: Record<string, any> = {
      year: year.value,
    };
    if (version.value) {
      params.version = version.value;
    }
    return params;
  });

  // Fetch des données via server API route
  const { data, pending, error, refresh } = useFetch<BudgetGlobalData>(
    "/api/budget/global",
    {
      key: computed(() => `budget-global-${year.value}-${version.value || "latest"}`),
      query: queryParams,
      default: () => ({
        year: year.value,
        versionId: 0,
        documents: [],
        keyIndicators: [],
        revenues: [],
        expenses: [],
        financing: [],
        debt: [],
        allMetrics: [],
      }),
    }
  );

  // Computed pour les indicateurs clés formatés (pour affichage)
  const formattedKeyIndicators = computed(() => {
    if (!data.value?.keyIndicators) return [];

    return data.value.keyIndicators.map((indicator) => ({
      name: indicator.label,
      value: indicator.value,
      unit: indicator.unit === "mds_fcfa" ? "Mrd FCFA" : "%",
      color: indicator.color || "#60A5FA",
      variation_percentage: 0, // À calculer si on compare avec N-1
    }));
  });

  // Computed pour les données de recettes (format graphique)
  const revenueChartData = computed(() => {
    if (!data.value?.revenues) return [];

    return data.value.revenues.map((item) => ({
      label: item.label,
      value: item.value,
      color: item.color || "#60A5FA",
    }));
  });

  // Computed pour les données de dépenses (format graphique)
  const expenseChartData = computed(() => {
    if (!data.value?.expenses) return [];

    return data.value.expenses.map((item) => ({
      label: item.label,
      value: item.value,
      color: item.color || "#34D399",
    }));
  });

  // Computed pour les opérations de trésorerie (financement)
  const treasuryOperations = computed(() => {
    if (!data.value?.financing) return { total: 0, components: [] };

    const total = data.value.financing.reduce(
      (sum, item) => sum + item.value,
      0
    );

    return {
      total,
      components: data.value.financing.map((item) => ({
        label: item.label,
        value: item.value,
        percentage: total > 0 ? (item.value / total) * 100 : 0,
        color: item.color || "#5924b2",
      })),
    };
  });

  // Computed pour la dette publique
  const publicDebt = computed(() => {
    if (!data.value?.debt) return { total: 0, components: [] };

    const total = data.value.debt.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      components: data.value.debt.map((item) => ({
        label: item.label,
        value: item.value,
        percentage: total > 0 ? (item.value / total) * 100 : 0,
        color: item.color || "#f97316",
      })),
    };
  });

  // Méthode pour changer l'année
  const setYear = (newYear: number) => {
    year.value = newYear;
  };

  // Méthode pour changer la version
  const setVersion = (newVersion: number | undefined) => {
    version.value = newVersion;
  };

  // Computed pour les versions disponibles de l'année sélectionnée
  const availableVersions = computed(() => {
    const yearData = yearsData.value?.years?.find((y) => y.year === year.value);
    return yearData?.versions || [];
  });

  // Computed pour le label de la version actuelle
  const currentVersionLabel = computed(() => {
    const versionObj = availableVersions.value.find(
      (v) => v.id === version.value
    );
    return versionObj?.label || "";
  });

  return {
    // État
    year,
    version,
    loading: pending,
    error,

    // Listes disponibles
    availableYears: computed(() => yearsData.value?.years || []),
    availableVersions,
    currentVersionLabel,

    // Données brutes
    budgetData: data,
    documents: computed(() => data.value?.documents || []),
    keyIndicators: computed(() => data.value?.keyIndicators || []),
    revenues: computed(() => data.value?.revenues || []),
    expenses: computed(() => data.value?.expenses || []),
    financing: computed(() => data.value?.financing || []),
    debt: computed(() => data.value?.debt || []),
    allMetrics: computed(() => data.value?.allMetrics || []),

    // Données formatées pour affichage
    formattedKeyIndicators,
    revenueChartData,
    expenseChartData,
    treasuryOperations,
    publicDebt,

    // Méthodes
    setYear,
    setVersion,
    refresh,
  };
};
