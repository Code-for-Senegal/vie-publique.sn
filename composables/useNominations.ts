// composables/useNominations.ts
import type { GovernmentMember } from "~/types/government-member";

export const useNominations = () => {
  const nominations = ref<GovernmentMember[]>([]);
  const loading = ref(true);
  const error = ref(null);

  const fetchNominations = async () => {
    loading.value = true;
    error.value = null;

    const fields =
      "id,status,name,sexe,type,role,organisation,nominationDate,endDate,formation,predecessor,description,photo,rating";

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/positions?fields=${fields}&filter[status][_eq]=published&limit=1000`,
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

      // Transform the data to match the GovernmentMember type
      nominations.value = dataResponse.data.map((item: any) => ({
        sexe: item.sexe,
        name: item.name,
        type: item.type,
        role: item.role,
        nominationDate: item.nominationDate,
        endDate: item.endDate,
        photo: item.photo
          ? `${config.public.cmsApiUrl}/assets/${item.photo}`
          : null,
        formation: item.formation,
        predecessor: item.predecessor,
        rating: item.rating,
        portrait: null, // Add if you have this field in Directus
        organisation: item.organisation,
      }));
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des nominations";
      nominations.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const resetNominations = () => {
    nominations.value = [];
    loading.value = false;
    error.value = null;
  };

  return {
    nominations,
    loading,
    error,
    fetchNominations,
    resetNominations,
  };
};
