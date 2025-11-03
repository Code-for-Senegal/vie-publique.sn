export interface BudgetEntityEvolution {
  year: number;
  amount_cp: number;
  version_label: string;
}

export interface BudgetEntityProgram {
  id: number;
  year: number;
  version: number;
  level: string;
  label: string;
  code: string;
  amount_ae: string;
  amount_cp: string;
  variation_percentage: string;
  variation_color: string;
}

export interface BudgetEntity {
  id: number;
  name: string;
  public_slug: string;
}

export interface BudgetEntityData {
  entity: BudgetEntity;
  level: string;
  evolution: BudgetEntityEvolution[];
  latestYear: BudgetEntityEvolution | null;
  programs: BudgetEntityProgram[];
}

export const useBudgetEntity = (slug: string) => {
  // Fetch des données de l'entité
  const { data: entityData, pending: loading, error } = useFetch<BudgetEntityData>(
    `/api/budget/entity/${slug}`,
    {
      key: `budget-entity-${slug}`,
      server: true,
    },
  );

  // Computed pour les données de l'entité
  const entity = computed(() => entityData.value?.entity || null);
  const level = computed(() => entityData.value?.level || 'ministry');
  const evolution = computed(() => entityData.value?.evolution || []);
  const latestYear = computed(() => entityData.value?.latestYear || null);
  const programs = computed(() => entityData.value?.programs || []);

  // Computed pour le budget total actuel
  const currentBudget = computed(() => {
    return latestYear.value ? latestYear.value.amount_cp : 0;
  });

  // Computed pour la variation du budget total (année N vs N-1)
  const budgetVariation = computed(() => {
    if (evolution.value.length < 2) {
      return {
        percentage: 'N/A',
        color: 'gray',
      };
    }

    const sortedEvolution = [...evolution.value].sort((a, b) => b.year - a.year);
    const currentYear = sortedEvolution[0];
    const previousYear = sortedEvolution[1];

    if (!currentYear || !previousYear || previousYear.amount_cp === 0) {
      return {
        percentage: 'N/A',
        color: 'gray',
      };
    }

    const variation = ((currentYear.amount_cp - previousYear.amount_cp) / previousYear.amount_cp) * 100;
    return {
      percentage: `${variation > 0 ? '+' : ''}${variation.toFixed(1)}%`,
      color: variation > 0 ? 'green' : variation < 0 ? 'red' : 'gray',
    };
  });

  // Computed pour les données du graphique d'évolution
  const evolutionChartData = computed(() => {
    return evolution.value.map((item) => ({
      year: item.year.toString(),
      amount: item.amount_cp,
      label: `${item.year} (${item.version_label})`,
    }));
  });

  // Computed pour les programmes avec calcul du total
  const programsData = computed(() => {
    const total = programs.value.reduce((sum, p) => sum + parseFloat(p.amount_cp || '0'), 0);

    return programs.value.map((program) => ({
      ...program,
      amount_cp_number: parseFloat(program.amount_cp || '0'),
      percentage: total > 0 ? ((parseFloat(program.amount_cp || '0') / total) * 100) : 0,
    }));
  });

  // Computed pour le total des programmes
  const programsTotal = computed(() => {
    return programs.value.reduce((sum, p) => sum + parseFloat(p.amount_cp || '0'), 0);
  });

  // Computed pour formater les données des programmes pour le tableau
  const formattedPrograms = computed(() => {
    return programsData.value.map((program) => ({
      label: program.label,
      value: program.amount_cp_number,
      variation_percentage: program.variation_percentage,
      variation_color: program.variation_color,
    }));
  });

  return {
    // Données brutes
    entity,
    level,
    evolution,
    latestYear,
    programs,
    loading,
    error,

    // Données calculées
    currentBudget,
    budgetVariation,
    evolutionChartData,
    programsData,
    programsTotal,
    formattedPrograms,
  };
};
