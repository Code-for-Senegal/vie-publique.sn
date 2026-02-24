/**
 * Composable pour récupérer les types de documents disponibles avec le nombre de documents
 * Les types sont filtrés par famille si une famille est fournie
 */
export function useAvailableTypes(family?: Ref<string> | string) {
  const familyValue = computed(() => (isRef(family) ? family.value : family));

  const queryParams = computed(() => {
    const params: Record<string, string> = {};
    if (familyValue.value && familyValue.value !== 'all') {
      params.family = familyValue.value;
    }
    return params;
  });

  const { data, pending, error } = useFetch<{
    types: { type: string; count: number }[];
  }>('/api/documents/types', {
    query: queryParams,
    watch: [queryParams],
    lazy: true,
  });

  return {
    types: computed(() => data.value?.types || []),
    loading: pending,
    error,
  };
}
