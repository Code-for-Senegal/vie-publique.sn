/**
 * Composable pour récupérer les années disponibles avec le nombre de documents
 * Les années sont filtrées par type si un type est fourni
 */
export function useAvailableYears(type?: Ref<string> | string) {
  const typeValue = computed(() => (isRef(type) ? type.value : type));

  const queryParams = computed(() => {
    const params: Record<string, string> = {};
    if (typeValue.value && typeValue.value !== 'all') {
      params.type = typeValue.value;
    }
    return params;
  });

  const { data, pending } = useFetch<{ years: { year: number; count: number }[] }>(
    '/api/documents/years',
    {
      query: queryParams,
      watch: [queryParams],
    },
  );

  return {
    years: computed(() => data.value?.years || []),
    loading: pending,
  };
}
