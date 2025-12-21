import type { VpDocument } from '~/types/vp_document';

export const useVpDocuments = () => {
  const {
    data: documentsData,
    pending: loading,
    error,
    refresh,
  } = useFetch<{ data: VpDocument[]; total: number }>('/api/vp-documents', {
    key: 'vp-documents',
    transform: (response) => ({
      data: response.data,
      total: response.total,
    }),
  });

  const documents = computed(() => documentsData.value?.data || []);
  const count = computed(() => documentsData.value?.total || 0);

  return {
    documents,
    count,
    loading,
    error,
    refresh,
  };
};
