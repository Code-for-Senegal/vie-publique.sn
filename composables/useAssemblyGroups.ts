// composables/useElectionElectedCandidates.ts
export const useAssemblyGroups = () => {
  const groups = ref([]);
  const groupById = ref<any>(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchAssemblyGroups = async () => {
    loading.value = true;
    error.value = null;

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        "https://cms.vie-publique.sn/items/assembly_group?limit=2000&fields=id,name,status,creation_date,logo,color,members,president.photo,president.first_name,president.last_name&filter[status]=active&deep[members][_filter][status]=active&deep[members][_limit]=165",
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
      groups.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      groups.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchAssemblyGroupById = async (id: string) => {
    loading.value = true;
    error.value = null;

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `https://cms.vie-publique.sn/items/assembly_group/${id}?fields=id,name,status,creation_date,logo,description,color,president.photo,president.first_name,president.last_name,vice_president.photo,vice_president.first_name,vice_president.last_name,members.first_name,members.last_name,members.photo&filter[status]=active&limit=2000`,
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
      groupById.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      groupById.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const reset = () => {
    groups.value = [];
    groupById.value = null;
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchAssemblyGroups();
  });

  return {
    groups,
    loading,
    error,
    fetchAssemblyGroups,
    groupById,
    fetchAssemblyGroupById,
    reset,
  };
};
