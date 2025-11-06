export interface BudgetGlossaryTerm {
  id: number;
  slug: string;
  term: string;
  category: string;
  aliases?: string[] | null;
  definition_short: string;
  definition_long?: string | null;
  unit?: string | null;
}

export interface BudgetGlossaryResponse {
  terms: BudgetGlossaryTerm[];
  total: number;
}

export const useBudgetGlossary = () => {
  // Fetch des données avec useFetch (SSR-friendly)
  const {
    data: glossaryData,
    pending,
    error,
    refresh,
  } = useFetch<BudgetGlossaryResponse>('/api/budget/glossary', {
    key: 'budget-glossary-all',
    server: true,
    lazy: false,
  });

  // Tous les termes
  const allTerms = computed(() => glossaryData.value?.terms || []);

  // Total
  const total = computed(() => glossaryData.value?.total || 0);

  // Liste des catégories uniques
  const categories = computed(() => {
    const cats = new Set<string>();
    allTerms.value.forEach((term) => {
      if (term.category) cats.add(term.category);
    });
    return ['Toutes', ...Array.from(cats).sort()];
  });

  return {
    // Données
    allTerms,
    total,
    categories,
    glossaryData,

    // États
    loading: pending,
    error,

    // Méthodes
    refresh,
  };
};
