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
  date: string; // Format: YYYY-MM-DD
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
  enableComparison?: boolean; // Activer la comparaison par défaut
}

export const useBudget = (options: UseBudgetOptions = {}) => {
  // Fetch de la liste des années et versions disponibles
  const { data: yearsData } = useFetch<BudgetYearsData>('/api/budget/years', {
    key: 'budget-years',
    default: () => ({ years: [], latest: null }),
    server: true,
  });

  // Initialiser avec des valeurs stables pour éviter hydration mismatch
  const year = ref(options.year || 2026);
  const version = ref<number | undefined>(options.version);

  // La comparaison est toujours activée, avec l'année N-1 par défaut
  const compareYear = ref<number | undefined>(undefined);
  const compareVersion = ref<number | undefined>(undefined);

  // Computed pour les années disponibles
  const availableYears = computed(() => yearsData.value?.years || []);

  // Computed pour les versions disponibles de l'année sélectionnée
  const availableVersions = computed(() => {
    const yearData = availableYears.value.find((y) => y.year === year.value);
    return yearData?.versions || [];
  });

  // Watcher pour initialiser avec latest quand yearsData est chargé
  // IMPORTANT: Ne pas utiliser immediate: true pour éviter hydration mismatch
  watch(
    () => yearsData.value?.latest,
    (latest) => {
      if (latest && !options.year && !options.version) {
        // Seulement mettre à jour si pas encore défini
        if (year.value === 2026 || !year.value) {
          year.value = latest.year;
        }
        if (!version.value) {
          version.value = latest.versionId;
        }
      }
    },
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
  const { data, pending, error, refresh } = useFetch<BudgetGlobalData>('/api/budget/global', {
    key: computed(() => `budget-global-${year.value}-${version.value || 'latest'}`),
    query: queryParams,
    watch: [year, version], // Watch automatique réactivé car on gère l'ordre différemment
    server: true,
    lazy: false, // Force le fetch immédiat côté serveur
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
  });

  // Fetch des données de comparaison (toujours activé)
  const comparisonQueryParams = computed(() => {
    const params: Record<string, any> = {
      currentYear: year.value,
      currentVersion: version.value,
    };

    if (compareYear.value) {
      params.compareYear = compareYear.value;
    }

    if (compareVersion.value) {
      params.compareVersion = compareVersion.value;
    }

    return params;
  });

  const { data: comparisonData } = useFetch('/api/budget/compare', {
    key: computed(
      () =>
        `budget-compare-${year.value}-${version.value || 'latest'}-vs-${compareYear.value || year.value - 1}-${compareVersion.value || 'auto'}`,
    ),
    query: comparisonQueryParams,
    watch: [year, version, compareYear, compareVersion],
    server: true,
    lazy: false, // Force le fetch immédiat côté serveur
    default: () => ({
      current: null,
      compare: null,
      hasComparison: false,
    }),
  });

  // Fonction utilitaire pour calculer le pourcentage de variation
  const calculateVariation = (current: number, previous: number): string => {
    if (previous === 0) return 'N/A';
    const variation = ((current - previous) / previous) * 100;
    const sign = variation > 0 ? '+' : '';
    return `${sign}${variation.toFixed(1)}%`;
  };

  // Fonction utilitaire pour déterminer la couleur du badge
  // Pour le déficit, une baisse (négatif) est positive, donc on inverse les couleurs
  const getVariationColor = (
    variation: string,
    indicatorCode: string,
  ): 'green' | 'red' | 'gray' => {
    if (variation === 'N/A' || variation === '0%' || variation === '+0.0%') return 'gray';

    const isPositive = variation.startsWith('+');
    const isDeficit = indicatorCode === 'deficit_total' || indicatorCode === 'deficit_pct_gdp';

    // Pour le déficit, on inverse : baisse = vert, hausse = rouge
    if (isDeficit) {
      return isPositive ? 'red' : 'green';
    }

    // Pour les autres indicateurs : hausse = vert, baisse = rouge
    return isPositive ? 'green' : 'red';
  };

  // Computed pour les indicateurs clés formatés (pour affichage)
  const formattedKeyIndicators = computed(() => {
    if (!data.value?.keyIndicators) return [];

    // Map des couleurs par code d'indicateur (comme dans 2025.vue)
    const colorMap: Record<string, string> = {
      budget_total: '#2B7A0B',
      revenue_total: '#1A73E8',
      expense_total: '#C62828',
      deficit_total: '#E64A19',
      deficit_pct_gdp: '#E64A19',
      gdp_total: '#5E35B1',
      growth_rate: '#00897B',
    };

    return data.value.keyIndicators.map((indicator) => {
      let variation = 'N/A';
      let variationColor: 'green' | 'red' | 'gray' = 'gray';
      let compareValue = null;

      // Calculer la variation si on a des données de comparaison
      if (comparisonData.value?.hasComparison && comparisonData.value.compare) {
        const compareIndicator = comparisonData.value.compare.keyIndicators.find(
          (item: any) => item.code === indicator.code,
        );
        if (compareIndicator) {
          variation = calculateVariation(indicator.value, compareIndicator.value);
          variationColor = getVariationColor(variation, indicator.code);
          compareValue = compareIndicator.value;
        }
      }

      // Pour les indicateurs en %, afficher la valeur de l'année de comparaison au lieu du % de variation
      let displayValue = Math.round(indicator.value).toString();
      let displayVariation = variation;

      // Si l'unité est en pourcentage, on affiche la valeur comparative directement
      if (
        indicator.unit !== 'mds_fcfa' &&
        compareValue !== null &&
        comparisonData.value?.hasComparison
      ) {
        displayVariation = `${compareValue.toFixed(1)}% en ${comparisonData.value.compareYear}`;
        // Pour le déficit en %, ne pas afficher de couleur (gris par défaut)
        variationColor = 'gray';
      }

      return {
        name: indicator.label,
        value: displayValue,
        unit: indicator.unit === 'mds_fcfa' ? 'Millards' : '%',
        color: colorMap[indicator.code] || '#60A5FA',
        variation_percentage: displayVariation,
        variation_color: variationColor,
        showVariationBadge: true,
      };
    });
  });

  // Computed pour les données de recettes (format graphique)
  const revenueChartData = computed(() => {
    if (!data.value?.revenues) return [];

    // Couleurs fixes pour les recettes (palette verte)
    const colors = ['#2E7D32', '#43A047', '#66BB6A', '#81C784', '#A5D6A7'];

    return data.value.revenues.map((item, index) => {
      let variation = 'N/A';
      let variationColor: 'green' | 'red' | 'gray' = 'gray';

      // Calculer la variation si on a des données de comparaison
      if (comparisonData.value?.hasComparison && comparisonData.value.compare) {
        const compareItem = comparisonData.value.compare.revenues.find(
          (r: any) => r.code === item.code,
        );
        if (compareItem) {
          variation = calculateVariation(item.value, compareItem.value);
          variationColor = getVariationColor(variation, item.code);
        }
      }

      return {
        label: item.label,
        value: item.value,
        color: colors[index % colors.length],
        variation_percentage: variation,
        variation_color: variationColor,
      };
    });
  });

  // Computed pour le total des recettes avec variation
  const revenueTotalWithVariation = computed(() => {
    const total = revenueChartData.value.reduce((sum, item) => sum + item.value, 0);
    let variation = 'N/A';
    let variationColor: 'green' | 'red' | 'gray' = 'gray';

    if (comparisonData.value?.hasComparison && comparisonData.value.compare) {
      const compareTotal = comparisonData.value.compare.revenues.reduce(
        (sum: number, item: any) => sum + item.value,
        0,
      );
      if (compareTotal > 0) {
        variation = calculateVariation(total, compareTotal);
        variationColor = getVariationColor(variation, 'revenue_total');
      }
    }

    return {
      total,
      variation_percentage: variation,
      variation_color: variationColor,
    };
  });

  // Computed pour les données de dépenses (format graphique)
  const expenseChartData = computed(() => {
    if (!data.value?.expenses) return [];

    // Couleurs fixes pour les dépenses (palette indigo)
    const colors = ['#3F51B5', '#5C6BC0', '#7986CB', '#9FA8DA', '#C5CAE9'];

    return data.value.expenses.map((item, index) => {
      let variation = 'N/A';
      let variationColor: 'green' | 'red' | 'gray' = 'gray';

      // Calculer la variation si on a des données de comparaison
      if (comparisonData.value?.hasComparison && comparisonData.value.compare) {
        const compareItem = comparisonData.value.compare.expenses.find(
          (e: any) => e.code === item.code,
        );
        if (compareItem) {
          variation = calculateVariation(item.value, compareItem.value);
          variationColor = getVariationColor(variation, item.code);
        }
      }

      return {
        label: item.label,
        value: item.value,
        color: colors[index % colors.length],
        variation_percentage: variation,
        variation_color: variationColor,
      };
    });
  });

  // Computed pour le total des dépenses avec variation
  const expenseTotalWithVariation = computed(() => {
    const total = expenseChartData.value.reduce((sum, item) => sum + item.value, 0);
    let variation = 'N/A';
    let variationColor: 'green' | 'red' | 'gray' = 'gray';

    if (comparisonData.value?.hasComparison && comparisonData.value.compare) {
      const compareTotal = comparisonData.value.compare.expenses.reduce(
        (sum: number, item: any) => sum + item.value,
        0,
      );
      if (compareTotal > 0) {
        variation = calculateVariation(total, compareTotal);
        variationColor = getVariationColor(variation, 'expense_total');
      }
    }

    return {
      total,
      variation_percentage: variation,
      variation_color: variationColor,
    };
  });

  // Computed pour les opérations de trésorerie (financement)
  const treasuryOperations = computed(() => {
    if (!data.value?.financing)
      return {
        total: 0,
        components: [],
        variation_percentage: 'N/A',
        variation_color: 'gray' as const,
      };

    // Filtrer pour ne garder que les composantes (exclure le total s'il existe)
    const components = data.value.financing.filter((item) => item.code !== 'financing_need_total');

    // Calculer le total à partir des composantes
    const total = components.reduce((sum, item) => sum + item.value, 0);

    // Calculer la variation du total
    let totalVariation = 'N/A';
    let totalVariationColor: 'green' | 'red' | 'gray' = 'gray';

    if (comparisonData.value?.hasComparison && comparisonData.value.compare) {
      const compareComponents = comparisonData.value.compare.financing.filter(
        (f: any) => f.code !== 'financing_need_total',
      );
      const compareTotal = compareComponents.reduce(
        (sum: number, item: any) => sum + item.value,
        0,
      );
      if (compareTotal > 0) {
        totalVariation = calculateVariation(total, compareTotal);
        totalVariationColor = getVariationColor(totalVariation, 'financing_need_total');
      }
    }

    return {
      total,
      variation_percentage: totalVariation,
      variation_color: totalVariationColor,
      components: components.map((item) => {
        let variation = 'N/A';
        let variationColor: 'green' | 'red' | 'gray' = 'gray';

        // Calculer la variation si on a des données de comparaison
        if (comparisonData.value?.hasComparison && comparisonData.value.compare) {
          const compareComponents = comparisonData.value.compare.financing.filter(
            (f: any) => f.code !== 'financing_need_total',
          );
          const compareItem = compareComponents.find((f: any) => f.code === item.code);
          if (compareItem) {
            variation = calculateVariation(item.value, compareItem.value);
            variationColor = getVariationColor(variation, item.code);
          }
        }

        return {
          label: item.label,
          value: item.value,
          percentage: total > 0 ? (item.value / total) * 100 : 0,
          color: item.color || '#5924b2',
          variation_percentage: variation,
          variation_color: variationColor,
        };
      }),
    };
  });

  // Computed pour la dette publique
  const publicDebt = computed(() => {
    if (!data.value?.debt)
      return {
        total: 0,
        components: [],
        variation_percentage: 'N/A',
        variation_color: 'gray' as const,
      };

    // Filtrer pour ne garder que les composantes (intérêts et principal)
    // debt_service_total est le total, pas une composante
    const components = data.value.debt.filter((item) => item.code !== 'debt_service_total');

    // Chercher le total
    const totalItem = data.value.debt.find((item) => item.code === 'debt_service_total');
    const total = totalItem
      ? totalItem.value
      : components.reduce((sum, item) => sum + item.value, 0);

    // Calculer la variation du total
    let totalVariation = 'N/A';
    let totalVariationColor: 'green' | 'red' | 'gray' = 'gray';

    if (comparisonData.value?.hasComparison && comparisonData.value.compare) {
      const compareTotalItem = comparisonData.value.compare.debt.find(
        (d: any) => d.code === 'debt_service_total',
      );
      const compareComponents = comparisonData.value.compare.debt.filter(
        (d: any) => d.code !== 'debt_service_total',
      );
      const compareTotal = compareTotalItem
        ? compareTotalItem.value
        : compareComponents.reduce((sum: number, item: any) => sum + item.value, 0);

      if (compareTotal > 0) {
        totalVariation = calculateVariation(total, compareTotal);
        totalVariationColor = getVariationColor(totalVariation, 'debt_service_total');
      }
    }

    return {
      total,
      variation_percentage: totalVariation,
      variation_color: totalVariationColor,
      components: components.map((item) => {
        let variation = 'N/A';
        let variationColor: 'green' | 'red' | 'gray' = 'gray';

        // Calculer la variation si on a des données de comparaison
        if (comparisonData.value?.hasComparison && comparisonData.value.compare) {
          const compareComponents = comparisonData.value.compare.debt.filter(
            (d: any) => d.code !== 'debt_service_total',
          );
          const compareItem = compareComponents.find((d: any) => d.code === item.code);
          if (compareItem) {
            variation = calculateVariation(item.value, compareItem.value);
            variationColor = getVariationColor(variation, item.code);
          }
        }

        return {
          label: item.label,
          value: item.value,
          percentage: total > 0 ? (item.value / total) * 100 : 0,
          color: '#f97316', // Couleur orange fixe
          variation_percentage: variation,
          variation_color: variationColor,
        };
      }),
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
    const versionObj = availableVersions.value.find((v) => v.id === version.value);
    return versionObj?.label || '';
  });

  // Méthode pour gérer la comparaison
  const setCompareYear = (newYear: number | undefined, newVersion?: number | undefined) => {
    compareYear.value = newYear;
    if (newVersion !== undefined) {
      compareVersion.value = newVersion;
    }
  };

  // Fetch de l'évolution multi-années (recettes, dépenses, financement, dette)
  const { data: evolutionData } = useFetch('/api/budget/evolution', {
    key: 'budget-evolution',
    server: true,
    default: () => ({
      revenueEvolution: [],
      expenseEvolution: [],
      financingEvolution: [],
      debtEvolution: [],
    }),
  });

  const revenueEvolution = computed(() => evolutionData.value?.revenueEvolution || []);
  const expenseEvolution = computed(() => evolutionData.value?.expenseEvolution || []);
  const financingEvolution = computed(() => evolutionData.value?.financingEvolution || []);
  const debtEvolution = computed(() => evolutionData.value?.debtEvolution || []);

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

    // États de comparaison
    compareYear,
    compareVersion,
    hasComparison: computed(() => comparisonData.value?.hasComparison || false),
    comparisonYearLabel: computed(() => {
      if (!comparisonData.value?.hasComparison) return '';
      return `${comparisonData.value.compareYear || year.value - 1}`;
    }),

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
    revenueTotalWithVariation,
    expenseChartData,
    expenseTotalWithVariation,
    treasuryOperations,
    publicDebt,

    // Évolutions multi-années
    revenueEvolution,
    expenseEvolution,
    financingEvolution,
    debtEvolution,

    // Méthodes
    setYear,
    setVersion,
    setCompareYear,
    refresh,
  };
};
