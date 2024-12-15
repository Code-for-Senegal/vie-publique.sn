// composables/useElectionElectedCandidates.ts
export const useAssemblyCommissions = () => {
  const commissions = ref([]);
  const commission = ref<any>(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchAssemblyCommissions = async () => {
    loading.value = true;
    error.value = null;

    // const fields = "";

    console.log(
      "fetchAssemblyCommissions " + useRuntimeConfig().public.cmsApiUrl,
    );

    const fields =
      "id,name,description,type,president,members,president.id,president.first_name,president.last_name";
    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/assembly_commission?fields=${fields}`,
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
      commissions.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      commissions.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchAssemblyCommissionById = async (id: string) => {
    loading.value = true;
    error.value = null;

    const fields =
      "id,name,description,type,president.id,president.first_name,president.last_name,president.photo,members.assembly_deputy_id.id,members.assembly_deputy_id.gender,vice_president.id,vice_president.photo,vice_president.first_name,vice_president.last_name,members.assembly_deputy_id.first_name,members.assembly_deputy_id.last_name,members.assembly_deputy_id.profession,members.assembly_deputy_id.birthplace,members.assembly_deputy_id.birthdate,members.assembly_deputy_id.photo,group.name,group.color, 1st_vice_president.id,1st_vice_president.photo,1st_vice_president.first_name,1st_vice_president.last_name";

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/assembly_commission/${id}?fields=${fields}`,
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
      commission.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      commission.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const resetCommissions = () => {
    commissions.value = [];
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchAssemblyCommissions();
  });

  return {
    commissions,
    loading,
    error,
    fetchAssemblyCommissions,
    commission,
    fetchAssemblyCommissionById,
    resetCommissions,
  };
};
