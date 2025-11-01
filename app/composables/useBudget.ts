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
    server: true,
  });

  // Initialiser avec la version la plus récente ou les options passées
  const initialYear = options.year || yearsData.value?.latest?.year || 2026;
  const initialVersion = options.version || yearsData.value?.latest?.versionId;

  const year = ref(initialYear);
  const version = ref(initialVersion);

  // Computed pour les années disponibles
  const availableYears = computed(() => yearsData.value?.years || []);

  // Computed pour les versions disponibles de l'année sélectionnée
  const availableVersions = computed(() => {
    const yearData = availableYears.value.find((y) => y.year === year.value);
    return yearData?.versions || [];
  });

  // Watcher pour initialiser avec latest quand yearsData est chargé
  watch(
    () => yearsData.value?.latest,
    (latest) => {
      if (latest && !options.year && !options.version && !year.value) {
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
  // On utilise watch: true avec un computed key qui change uniquement quand year ET version sont définis
  const { data, pending, error, refresh } = useFetch<BudgetGlobalData>(
    "/api/budget/global",
    {
      key: computed(() => `budget-global-${year.value}-${version.value || "latest"}`),
      query: queryParams,
      watch: [year, version], // Watch automatique réactivé car on gère l'ordre différemment
      server: true,
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

    // Map des couleurs par code d'indicateur (comme dans 2025.vue)
    const colorMap: Record<string, string> = {
      budget_total: "#2B7A0B",
      revenue_total: "#1A73E8",
      expense_total: "#C62828",
      deficit_total: "#E64A19",
      deficit_pct_gdp: "#E64A19",
      gdp_total: "#5E35B1",
      growth_rate: "#00897B",
    };

    return data.value.keyIndicators.map((indicator) => ({
      name: indicator.label,
      value: Math.round(indicator.value).toString(), // Convertir en string sans décimale
      unit: indicator.unit === "mds_fcfa" ? "Mrd FCFA" : "%",
      color: colorMap[indicator.code] || "#60A5FA",
      variation_percentage: "0", // À calculer si on compare avec N-1
    }));
  });

  // Computed pour les données de recettes (format graphique)
  const revenueChartData = computed(() => {
    if (!data.value?.revenues) return [];

    // Couleurs fixes pour les recettes (palette verte)
    const colors = ["#2E7D32", "#43A047", "#66BB6A", "#81C784", "#A5D6A7"];

    return data.value.revenues.map((item, index) => ({
      label: item.label,
      value: item.value,
      color: colors[index % colors.length],
    }));
  });

  // Computed pour les données de dépenses (format graphique)
  const expenseChartData = computed(() => {
    if (!data.value?.expenses) return [];

    // Couleurs fixes pour les dépenses (palette indigo)
    const colors = ["#3F51B5", "#5C6BC0", "#7986CB", "#9FA8DA", "#C5CAE9"];

    return data.value.expenses.map((item, index) => ({
      label: item.label,
      value: item.value,
      color: colors[index % colors.length],
    }));
  });

  // Computed pour les opérations de trésorerie (financement)
  const treasuryOperations = computed(() => {
    if (!data.value?.financing) return { total: 0, components: [] };

    // Filtrer pour ne garder que les composantes (exclure le total s'il existe)
    const components = data.value.financing.filter(
      (item) => item.code !== "financing_need_total"
    );

    // Calculer le total à partir des composantes
    const total = components.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      components: components.map((item) => ({
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

    // Filtrer pour ne garder que les composantes (intérêts et principal)
    // debt_service_total est le total, pas une composante
    const components = data.value.debt.filter(
      (item) => item.code !== "debt_service_total"
    );

    // Chercher le total
    const totalItem = data.value.debt.find(
      (item) => item.code === "debt_service_total"
    );
    const total = totalItem ? totalItem.value : components.reduce((sum, item) => sum + item.value, 0);

    return {
      total,
      components: components.map((item) => ({
        label: item.label,
        value: item.value,
        percentage: total > 0 ? (item.value / total) * 100 : 0,
        color: "#f97316", // Couleur orange fixe
      })),
    };
  });

  // Méthode pour changer l'année (sélectionne automatiquement la version prioritaire)
  const setYear = (newYear: number) => {
    const yearData = availableYears.value.find((y) => y.year === newYear);

    if (yearData && yearData.versions.length > 0) {
      // Priorité de sélection : LFR > LFI > PLF > autre
      const priorityOrder = ['LFR', 'LFI', 'PLF'];
      let selectedVersion = yearData.versions[0]; // Par défaut la première

      for (const label of priorityOrder) {
        const found = yearData.versions.find((v) => v.label === label);
        if (found) {
          selectedVersion = found;
          break;
        }
      }

      // Changer l'année ET la version en même temps pour éviter le double-fetch
      year.value = newYear;
      version.value = selectedVersion.id;
    } else {
      year.value = newYear;
      version.value = undefined;
    }
  };

  // Méthode pour changer la version
  const setVersion = (newVersion: number | undefined) => {
    version.value = newVersion;
  };

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
    availableYears,
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
