/**
 * Composable pour récupérer les années disponibles avec le nombre de documents
 * Les années sont filtrées par type et/ou famille si fournis
 */
export function useAvailableYears(type?: Ref<string> | string, family?: Ref<string> | string) {
  const typeValue = computed(() => (isRef(type) ? type.value : type));
  const familyValue = computed(() => (isRef(family) ? family.value : family));

  const queryParams = computed(() => {
    const params: Record<string, string> = {};
    if (typeValue.value && typeValue.value !== 'all') {
      params.type = typeValue.value;
    }
    if (familyValue.value && familyValue.value !== 'all') {
      params.family = familyValue.value;
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
