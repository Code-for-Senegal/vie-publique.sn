import { useConseilMinistresStore } from "~/stores/conseilMinistres";

interface ConseilMinistres {
  id: string;
  title?: string;
  content?: string;
  date_published?: string;
  slug?: string;
  cover_image?: string;
}

export function useConseilMinistres() {
  const store = useConseilMinistresStore();
  const config = useRuntimeConfig();

  const news = ref<ConseilMinistres[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Fonction pour charger les documents
  const fetchNews = async () => {
    try {
      loading.value = true;
      store.setLoading(true);
      error.value = null;

      // Construire les paramètres de requête
      const params = new URLSearchParams({
        "filter[status]": "published",
        "filter[category][slug][_eq]": "conseil-des-ministres",
        page: store.currentPage.toString(),
        limit: store.itemsPerPage.toString(),
        sort: "-date_published",
      });

      // Ajouter la recherche si présente
      if (store.searchQuery) {
        params.append("search", store.searchQuery);
      }

      // Récupérer le nombre total de documents
      const totalResponse = await fetch(
        `${config.public.cmsApiUrl}/items/news?aggregate[countDistinct]=id&filter[status]=published&filter[category][slug][_eq]=conseil-des-ministres${
          store.searchQuery ? `&search=${store.searchQuery}` : ""
        }`,
        {
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
          },
        },
      );

      if (!totalResponse.ok) {
        throw new Error(
          "Erreur lors de la récupération du nombre total de communiqués",
        );
      }

      const totalData = await totalResponse.json();
      store.setTotalItems(parseInt(totalData.data[0].countDistinct.id));

      // Récupérer les documents paginés
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/news?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des communiqués");
      }

      const data = await response.json();
      news.value = data.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Une erreur est survenue";
      news.value = [];
    } finally {
      loading.value = false;
      store.setLoading(false);
    }
  };

  // Fonction pour mettre à jour la recherche
  const updateSearch = async (query: string) => {
    store.setSearchQuery(query);
    await fetchNews();
  };

  // Fonction pour mettre à jour la page
  const updatePage = async (page: number) => {
    store.setCurrentPage(page);
    await fetchNews();
  };

  // Charger les données au montage
  onMounted(() => {
    fetchNews();
  });

  return {
    news,
    loading,
    error,
    updateSearch,
    updatePage,
  };
}
