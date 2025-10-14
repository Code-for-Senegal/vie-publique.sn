// composables/useRegionsData.ts
import type {
  Department,
  TransformedRegion,
  DirectusResponse,
  MapError,
} from "~/types/election-map";

export const useRegionsData = () => {
  const regions: Ref<TransformedRegion[]> = ref([]);
  const loading = ref(false);
  const error = ref<MapError | null>(null);

  const transformRegionData = (data: Department[]): TransformedRegion[] => {
    return data.map((item) => ({
      id: item.id,
      region: item.region,
      departement: item.departement,
      coordinates: item.Position.coordinates[0].map((coord) => [
        coord[1],
        coord[0],
      ]),
      type: item.Position.type,
    }));
  };

  const handleError = (e: unknown): MapError => {
    if (e instanceof Error) {
      return {
        code: "FETCH_ERROR",
        message: e.message,
        details: e.cause,
      };
    }
    return {
      code: "UNKNOWN_ERROR",
      message: "Une erreur inconnue est survenue",
      details: e,
    };
  };

  const fetchRegions = async (): Promise<void> => {
    loading.value = true;
    error.value = null;

    try {
      // ✅ Utilisation de l'API serveur Nuxt
      const data = await $fetch<DirectusResponse<Department>>('/api/carte');
      regions.value = transformRegionData(data.data);
    } catch (e) {
      error.value = handleError(e);
      console.error("Erreur lors du chargement des régions:", error.value);
    } finally {
      loading.value = false;
    }
  };

  return {
    regions,
    loading,
    error,
    fetchRegions,
  };
};
