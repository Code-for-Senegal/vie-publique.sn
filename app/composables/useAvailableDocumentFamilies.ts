/**
 * Composable pour récupérer les familles de documents disponibles avec le nombre de documents
 */
export function useAvailableDocumentFamilies() {
  const { data, pending, error } = useFetch<{
    families: { family: string; count: number }[];
  }>('/api/documents/families', {
    lazy: true,
  });

  return {
    families: computed(() => data.value?.families || []),
    loading: pending,
    error,
  };
}
