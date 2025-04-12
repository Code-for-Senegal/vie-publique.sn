// composables/useLegislature.ts
import legislatureLocal from '@/assets/data/parliament/legislature.json';

export const useLegislature = () => {
  const legislature = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const fetchLegislature = async () => {
    loading.value = true;
    error.value = null;

    try {
      if (process.env.NODE_ENV !== 'production') {
        legislature.value = legislatureLocal;
        return;
      }
      const config = useRuntimeConfig();
      const response = await fetch(
        "https://cms.vie-publique.sn/items/election_candidates?fields=id,gender,first_name,last_name,profession,birthplace,birthdate,photo,electoral_list.coalition.name,electoral_list.type,electoral_list.constituency.name,electoral_list.name,electoral_list.coalition.color&filter[is_elected]=true&limit=200",
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
      legislature.value = dataResponse.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Une erreur est survenue";
      legislature.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const reset = () => {
    deputies.value = [];
    legislature.value = [];
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchLegislature();
  });

  return {
    loading,
    error,
    fetchLegislature,
    reset,
    legislature,
  };
};
