import type { Document } from "~/types/document.ts";

interface UseDocumentsOptions {
  type?: string;
  page?: Ref<number> | number;
  limit?: Ref<number> | number;
  search?: Ref<string> | string;
  sortBy?: Ref<string> | string;
  filterType?: Ref<string> | string;
}

export const useDocuments = (options?: UseDocumentsOptions) => {
  // Construction des query params
  const query = computed(() => {
    const params: Record<string, any> = {};

    // Ajout du type dans les query params
    if (options?.type) {
      params.type = options.type;
    }

    if (options?.page) {
      params.page = unref(options.page);
    }

    if (options?.limit) {
      params.limit = unref(options.limit);
    }

    if (options?.search) {
      const searchValue = unref(options.search);
      if (searchValue && searchValue.trim() !== "") {
        params.search = searchValue.trim();
      }
    }

    if (options?.sortBy) {
      const sortValue = unref(options.sortBy);
      if (sortValue) {
        params.sortBy = sortValue;
      }
    }

    if (options?.filterType) {
      const filterValue = unref(options.filterType);
      if (filterValue !== undefined && filterValue !== null) {
        params.filterType = filterValue;
      }
    }

    return params;
  });

  const { data, pending, error, refresh } = useFetch("/api/documents", {
    query,
    transform: (response: any) => {
      return {
        documents: response.documents as Document[],
        pagination: {
          ...response.pagination,
          total: Number(response.pagination?.total || 0),
          totalPages: Number(response.pagination?.totalPages || 0),
        },
        totalDocuments: Number(response.totalDocuments || 0),
      };
    },
    getCachedData(key) {
      return useNuxtData(key).data.value;
    },
    watch: [query],
  });

  const documents = computed(() => data.value?.documents || []);
  const pagination = computed(() => data.value?.pagination);
  const totalDocuments = computed(() => data.value?.totalDocuments || 0);
  const loading = computed(() => pending.value);

  // Pour le détail d'un document
  const document = ref<Document | null>(null);
  const documentLoading = ref(false);
  const documentError = ref<string | null>(null);

  const fetchDocumentById = async (id: string) => {
    documentLoading.value = true;
    documentError.value = null;

    try {
      const response = await $fetch<{ document: Document }>(
        `/api/documents/${id}`,
      );
      document.value = response.document;
    } catch (err: any) {
      console.error("Erreur lors de la récupération du document:", err);
      documentError.value =
        err.message || "Erreur lors du chargement du document";
      document.value = null;
    } finally {
      documentLoading.value = false;
    }
  };

  return {
    // Pour la liste
    documents,
    loading,
    error,
    refresh,
    pagination,
    totalDocuments,
    // Pour le détail
    document,
    documentLoading,
    documentError,
    fetchDocumentById,
  };
};
