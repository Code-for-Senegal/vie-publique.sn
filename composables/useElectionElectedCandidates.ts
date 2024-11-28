// composables/useElectionElectedCandidates.ts
export const useElectionElectedCandidates = () => {
  const deputies = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const fetchElectedDeputies = async () => {
    loading.value = true;
    error.value = null;

    try {
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
      deputies.value = dataResponse.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Une erreur est survenue";
      deputies.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const reset = () => {
    deputies.value = [];
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchElectedDeputies();
  });

  return {
    deputies,
    loading,
    error,
    fetchElectedDeputies,
    reset,
  };
};
