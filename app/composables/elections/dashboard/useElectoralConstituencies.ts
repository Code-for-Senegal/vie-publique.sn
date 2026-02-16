export interface Constituency {
  id: string | number;
  name: string;
  type: string;
  communes_count?: number;
  coalitions_count?: number;
  nationale_type?: string;
  seats?: number;
}

export const useElectoralConstituencies = (params: {
  year: Ref<number>;
  type: Ref<string>;
  search?: Ref<string>;
}) => {
  const { year, type, search } = params;

  // Calculer une clé unique basée sur les paramètres
  const queryKey = computed(() =>
    `constituencies-${year.value}-${type.value}-${search?.value || 'no-search'}`
  );

  const { data: constituencies, pending: loading, error } = useFetch<Constituency[]>(
    '/api/elections/dashboard/constituencies',
    {
      key: queryKey,
      query: {
        year,
        type,
        search
      },
      watch: [year, type, search],
      server: false,
      lazy: true
    }
  );

  return {
    constituencies: computed(() => constituencies.value || []),
    loading,
    error
  };
};
