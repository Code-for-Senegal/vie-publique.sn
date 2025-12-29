export interface Constituency {
  id: string | number;
  name: string;
  type: string;
  communes_count?: number;
  coalitions_count?: number;
}

export const useElectoralConstituencies = (params: {
  year: Ref<number>;
  type: Ref<string>;
}) => {
  const { year, type } = params;

  // Calculer une clé unique basée sur les paramètres
  const queryKey = computed(() =>
    `constituencies-${year.value}-${type.value}`
  );

  const { data: constituencies, pending: loading, error } = useFetch<Constituency[]>(
    '/api/elections/dashboard/constituencies',
    {
      key: queryKey,
      query: {
        year,
        type
      },
      watch: [year, type],
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
