// composables/useNews.ts
// export const useNews = (category?: string, featured?: boolean) => {
export const useNews = (options?: {
  category?: string;
  featured?: boolean;
}) => {
  const news = ref([]);
  const article = ref<any>(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchNews = async () => {
    loading.value = true;
    error.value = null;

    console.log("fetchNews " + useRuntimeConfig().public.cmsApiUrl);

    const sort = `sort=-date_published`;

    let filters = `filter[status]=published`;

    // Ajouter le filtre de catégorie si fourni
    if (options?.category) {
      filters += `&filter[category][slug][_eq]=${options.category}`;
    }

    // Ajouter le filtre featured si demandé
    if (options?.featured) {
      filters += `&filter[featured]=true`;
    }

    const fields =
      "id,title,slug,date_published,cover_image,tags,featured,category.slug,category.name";
    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/news?fields=${fields}&${sort}&${filters}`,
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
      news.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      news.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchNewsById = async (id: string) => {
    loading.value = true;
    error.value = null;

    const fields =
      "id,title,slug,content,date_published,cover_image,tags,document.file";

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/news/${id}?fields=${fields}`,
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
      article.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      article.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const resetNews = () => {
    article.value = [];
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchNews();
  });

  return {
    news,
    loading,
    error,
    fetchNews,
    article,
    fetchNewsById,
    resetNews,
  };
};
