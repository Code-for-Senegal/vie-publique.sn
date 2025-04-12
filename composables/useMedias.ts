// composables/useMedias.ts
export const useMedias = () => {
  const medias = ref([]);
  const media = ref<any>(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchMedias = async () => {
    loading.value = true;
    error.value = null;

    console.log("fetchMedias " + useRuntimeConfig().public.cmsApiUrl);

    const sort = `sort=-id`;

    const filters = `filter[status]=compliant`;

    const fields =
      "id,name,type,group.name,logo,facebook,website,instagram,tiktok,twitter,youtube,description";

    const limit = "limit=1000";
    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/media?fields=${fields}&${filters}&${limit}`,
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
      medias.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      medias.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchMediaById = async (id: string) => {
    loading.value = true;
    error.value = null;

    const fields =
      "id,title,slug,content,date_published,cover_image,tags,document.file";

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/medias/${id}?fields=${fields}`,
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
      media.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      media.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const resetMedia = () => {
    media.value = [];
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchMedias();
  });

  return {
    medias,
    loading,
    error,
    fetchMedias,
    media,
    fetchMediaById,
    resetMedia,
  };
};
