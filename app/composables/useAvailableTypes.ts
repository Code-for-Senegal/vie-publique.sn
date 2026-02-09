/**
 * Composable pour récupérer les types de documents disponibles avec le nombre de documents
 */
export function useAvailableTypes() {
  const { data, pending, error } = useFetch<{
    types: { type: string; count: number }[];
  }>('/api/documents/types', {
    lazy: true,
  });

  return {
    types: computed(() => data.value?.types || []),
    loading: pending,
    error,
  };
}
