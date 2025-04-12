// composables/useDeputev2.ts
export const useDeputev2 = () => {
  const deputies = ref([]);
  const deputy = ref<any>(null);
  const deputiesCommissions = ref([]);
  const loading = ref(true);
  const error = ref(null);

  const fetchElectedDeputies = async (groupId?: string | null) => {
    loading.value = true;
    error.value = null;
    const config = useRuntimeConfig();
    const fields =
      "fields=id,biography,gender,first_name,last_name,profession,birthplace,birthdate,photo,electoral_list.coalition.name,electoral_list.type,electoral_list.constituency.name,electoral_list.name,electoral_list.coalition.color,group.name,group.color&filter[status]=active&limit=200";
    const apiUrl = groupId
      ? `${config.public.cmsApiUrl}/items/assembly_deputy/?${fields}&filter[group]=${groupId}`
      : `${config.public.cmsApiUrl}/items/assembly_deputy/?${fields}`;

    try {
      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${config.public.cmsApiKey}`,
        },
      });

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

  const fetchElectedDeputyById = async (id: string) => {
    loading.value = true;
    error.value = null;

    const fields =
      "fields=id,gender,biography,facebook,twitter,bio,first_name,last_name,profession,birthplace,birthdate,photo,electoral_list.coalition.name,electoral_list.type,electoral_list.constituency.name,electoral_list.name,electoral_list.coalition.color,group.name,group.color&filter[status]=active&limit=200";

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `https://cms.vie-publique.sn/items/assembly_deputy/${id}?${fields}`,
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
      deputy.value = dataResponse.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Une erreur est survenue";
      deputy.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchElectedDeputyCommissions = async (idDeputy: string) => {
    loading.value = true;
    error.value = null;

    const fields = `fields=assembly_commission_id.id,assembly_commission_id.name,assembly_deputy_id&filter[assembly_deputy_id]=${idDeputy}`;

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `https://cms.vie-publique.sn/items/assembly_commission_assembly_deputy?${fields}`,
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
      deputiesCommissions.value = dataResponse.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Une erreur est survenue";
      deputiesCommissions.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const reset = () => {
    deputies.value = [];
    deputy.value = null;
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchElectedDeputies();
  });

  return {
    deputies,
    deputy,
    deputiesCommissions,
    loading,
    error,
    fetchElectedDeputyById,
    fetchElectedDeputies,
    fetchElectedDeputyCommissions,
    reset,
  };
};
