// composables/useAssemblyOffice.ts
export const useAssemblyOffice = () => {
  const office = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const fetchAssemblyOffice = async () => {
    loading.value = true;
    error.value = null;

    console.log("fetchAssemblyOffice " + useRuntimeConfig().public.cmsApiUrl);

    const fields =
      "id,role,rank,deputy.id,deputy.gender,vice_president.id,vice_president.photo,vice_president.first_name,vice_president.last_name,deputy.first_name,deputy.last_name,deputy.profession,deputy.birthplace,deputy.birthdate,deputy.photo";

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/assembly_office?fields=${fields}`,
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
      office.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      office.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const resetOffice = () => {
    office.value = [];
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchAssemblyOffice();
  });

  return {
    office,
    loading,
    error,
    fetchAssemblyOffice,
    resetOffice,
  };
};
