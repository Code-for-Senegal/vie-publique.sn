// composables/useDocuments.ts
export const useDocuments = (options?: { type?: string }) => {
  interface Document {
    id: string;
    title: string;
    slug: string;
    publish_date: string;
    cover_image: string;
    file?: {
      id: string;
      type: string;
      filesize: string;
      filename_download: string;
    };
  }

  const documents = ref<Document[]>([]);
  const document = ref<Document | null>(null);
  const loading = ref(true);
  const error = ref<string | null>(null);

  const docCache = useCookie(`docs-${options?.type || "all"}`, { maxAge: 300 });

  const fetchDocuments = async () => {
    loading.value = true;
    error.value = null;

    try {
      console.log("docCache.value before");
      // if (docCache.value) {
      //   console.log("docCache.value if");
      //   try {
      //     const cachedData = JSON.parse(docCache.value);
      //     console.log("cachedData");
      //     if (Array.isArray(cachedData) && cachedData.length > 0) {
      //       documents.value = cachedData;
      //       loading.value = false;
      //       return;
      //     }
      //   } catch {
      //     docCache.value = null;
      //   }
      // }

      const sort = `sort=-publish_date`;

      let filters = `filter[status]=published`;

      if (options?.type) {
        filters += `&filter[type]=${options.type}`;
      }

      const fields =
        "id,title,slug,publish_date,cover_image,file.id,file.type,file.filesize,file.filename_download";

      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/documents?fields=${fields}&${sort}&${filters}`,
        {
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dataResponse = await response.json();
      documents.value = dataResponse.data;
      // if (Array.isArray(dataResponse.data) && dataResponse.data.length > 0) {
      //   docCache.value = JSON.stringify(dataResponse.data);
      // }
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Erreur lors du chargement";
      documents.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchDocumentById = async (id: string) => {
    loading.value = true;
    error.value = null;
    const singleDocCache = useCookie(`doc-${id}`, { maxAge: 300 });

    try {
      // if (singleDocCache.value && JSON.parse(singleDocCache.value)?.id) {
      //   document.value = JSON.parse(singleDocCache.value);
      //   loading.value = false;
      //   return;
      // }

      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/documents/${id}`,
        {
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data } = await response.json();
      document.value = data;
      // if (data?.id) {
      //   singleDocCache.value = JSON.stringify(data);
      // }
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement du document officiel";
      document.value = null;
    } finally {
      loading.value = false;
    }
  };

  if (import.meta.client) {
    fetchDocuments();
  }

  return {
    documents,
    document,
    loading,
    error,
    fetchDocuments,
    fetchDocumentById,
  };
};
