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
    server: true, // S'assurer que le fetch se fait bien côté serveur
  });

  // Initialiser avec la version la plus récente ou les options passées
  // Utiliser directement yearsData.value qui sera disponible en SSR
  const initialYear = options.year || yearsData.value?.latest?.year || 2026;
  const initialVersion = options.version || yearsData.value?.latest?.versionId;

  const year = ref(initialYear);
  const version = ref(initialVersion);

  // Watcher pour mettre à jour automatiquement quand yearsData est chargé (client-side)
  watch(
    () => yearsData.value?.latest,
    (latest) => {
      if (latest && !options.year && !options.version) {
        // Ne mettre à jour que si les valeurs n'ont pas été initialisées correctement
        if (!year.value || year.value === 2026) {
          year.value = latest.year;
        }
        if (!version.value) {
          version.value = latest.versionId;
        }
      }
    },
    { immediate: true }
  );

  // Computed pour les versions disponibles de l'année sélectionnée (défini ici pour être utilisé dans le watcher)
  const availableVersions = computed(() => {
    console.log(`[useBudget availableVersions] Recherche versions pour année:`, year.value);
    console.log(`[useBudget availableVersions] yearsData.value?.years:`, yearsData.value?.years);
    const yearData = yearsData.value?.years?.find((y) => y.year === year.value);
    console.log(`[useBudget availableVersions] yearData trouvé:`, yearData);
    const versions = yearData?.versions || [];
    console.log(`[useBudget availableVersions] Versions retournées:`, versions);
    return versions;
  });

  // Watcher pour mettre à jour la version quand l'année change
  watch(year, (newYear, oldYear) => {
    console.log(`[useBudget] Année changée: ${oldYear} → ${newYear}`);
    console.log(`[useBudget] Versions disponibles:`, availableVersions.value);

    // Si l'année change, sélectionner automatiquement la première version disponible
    if (newYear !== oldYear && availableVersions.value.length > 0) {
      const newVersionId = availableVersions.value[0].id;
      console.log(`[useBudget] Changement auto version → ${newVersionId}`);
      version.value = newVersionId;
    }
  });

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
      watch: false, // Désactiver le watch automatique pour éviter le double-fetch
      server: true, // S'assurer que le fetch se fait bien côté serveur
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

  // Watcher manuel pour refresh uniquement quand on ne change PAS d'année
  watch([year, version], ([newYear, newVersion], [oldYear, oldVersion]) => {
    console.log(`[useBudget watch] Triggered - year: ${oldYear}→${newYear}, version: ${oldVersion}→${newVersion}, isChangingYear: ${isChangingYear.value}`);

    if (!isChangingYear.value) {
      console.log(`[useBudget watch] Refresh data - year=${newYear}, version=${newVersion}`);
      refresh();
    } else {
      console.log(`[useBudget watch] Skipped refresh (isChangingYear=true)`);
    }
  });

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
      value: indicator.value.toFixed(1), // Convertir en string avec 1 décimale
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

  // Flag pour éviter les double-fetch pendant le changement d'année
  const isChangingYear = ref(false);

  // Méthode pour changer l'année
  const setYear = (newYear: number) => {
    console.log(`[useBudget setYear] Changement année: ${year.value} → ${newYear}`);

    // Marquer qu'on est en train de changer d'année pour éviter le double-fetch
    isChangingYear.value = true;
    year.value = newYear;

    // Attendre le prochain tick pour que availableVersions soit mis à jour
    nextTick(() => {
      console.log(`[useBudget setYear] Versions disponibles après changement:`, availableVersions.value);

      // Sélectionner automatiquement la première version disponible
      if (availableVersions.value.length > 0) {
        const newVersionId = availableVersions.value[0].id;
        console.log(`[useBudget setYear] Auto-sélection version → ${newVersionId}`);
        version.value = newVersionId;
      } else {
        console.warn(`[useBudget setYear] Aucune version disponible pour l'année ${newYear}`);
        version.value = undefined;
      }

      // Démarquer après la mise à jour de la version et appeler refresh manuellement
      nextTick(() => {
        isChangingYear.value = false;
        console.log(`[useBudget setYear] Appel manuel refresh() - year=${year.value}, version=${version.value}`);
        refresh();
      });
    });
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
