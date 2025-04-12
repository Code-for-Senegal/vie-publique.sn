// composables/useElectionElectedCandidates.ts
export const useAssemblyVotes = () => {
  const votes = ref([]);
  const vote = ref<any>(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchAssemblyVotes = async () => {
    loading.value = true;
    error.value = null;

    // const fields = "";

    const votesSort = `sort=-date`;

    console.log("fetchAssemblyVotes " + useRuntimeConfig().public.cmsApiUrl);

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/assembly_vote?${votesSort}`,
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
      votes.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      votes.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchAssemblyVoteById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/assembly_vote/${id}`,
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
      vote.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      vote.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const resetVotes = () => {
    votes.value = [];
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchAssemblyVotes();
  });

  return {
    votes,
    loading,
    error,
    fetchAssemblyVotes,
    vote,
    fetchAssemblyVoteById,
    resetVotes,
  };
};
