export const useCollection = () => {
  const fetchDocuments = async (options: {
    type?: string;
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    filterType?: string;
  }) => {
    return await $fetch("/api/documents", {
      query: {
        ...options,
        // Nettoyage des valeurs undefined/empty
        ...(options.filterType ? { filterType: options.filterType } : {}),
      },
    });
  };

  const fetchDocumentById = async (id: string) => {
    const response = await $fetch<{ document: any }>(`/api/documents/${id}`);
    return response.document;
  };

  return {
    fetchDocuments,
    fetchDocumentById,
  };
};
