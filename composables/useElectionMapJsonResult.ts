// composables/useElectionMapDataResult.ts
import type { DepartmentStats } from "~/types/election-map-national";

interface GeoData {
  departement: string;
  region: string;
  voters: number;
  offices: number;
  places: number;
  municipality: number;
  population: number;
  id: number;
  coalition_gagnante: {
    name: string;
    color: string;
    logo: string;
  };
  Position: {
    type: string;
    coordinates: number[][][];
  };
}

interface TransformedRegion {
  id: number;
  departement: string;
  region: string;
  voters: number;
  offices: number;
  places: number;
  municipality: number;
  population: number;
  winnerName: string;
  winnerColor: string;
  winnerLogo: string;
  coordinates: [number, number][];
  stats?: DepartmentStats | null;
}

export function useElectionMapDataResult() {
  const config = useRuntimeConfig();

  // État global pour le cache des données (avec un nom unique pour éviter les conflits)
  const geoData = useState<GeoData[]>("geo-data-result", () => []);
  const isGeoDataLoaded = useState<boolean>(
    "geo-data-result-loaded",
    () => false,
  );

  // Charger les données géographiques depuis l'API serveur Nuxt
  const loadGeoDataWithWinner = async () => {
    if (isGeoDataLoaded.value) return geoData.value;

    try {
      // Appel via l'API serveur Nuxt (sécurisé, avec cache serveur)
      // L'API serveur gère les fields et l'authentification
      const response = await $fetch<{ data: GeoData[] }>('/api/carte/result');

      // Stocker les données dans le state
      geoData.value = response.data || response || [];
      isGeoDataLoaded.value = true;
      return geoData.value;
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données de résultats:",
        error,
      );
      return [];
    }
  };

  // Obtenir les données géographiques
  const getGeoData = async () => {
    if (!isGeoDataLoaded.value) {
      await loadGeoDataWithWinner();
    }
    return geoData.value;
  };

  // Transformer les coordonnées pour Leaflet
  const transformCoordinates = (geoData: GeoData[]): TransformedRegion[] => {
    return geoData.map((item) => ({
      id: item.id,
      departement: item.departement,
      region: item.region,
      voters: item.voters,
      offices: item.offices,
      places: item.places,
      municipality: item.municipality,
      population: item.population,
      winnerName: item.coalition_gagnante.name,
      winnerColor: item.coalition_gagnante.color,
      winnerLogo: item.coalition_gagnante.logo,
      coordinates: item.Position.coordinates[0].map((coord) => [
        coord[1],
        coord[0],
      ]), // Inverser lat/lng pour Leaflet
    }));
  };

  // Obtenir les données complètes de la carte
  const getMapDataResult = async () => {
    const [geoDataResult] = await Promise.all([getGeoData()]);

    const transformedGeoData = transformCoordinates(geoDataResult);

    return transformedGeoData.map((geo) => ({
      ...geo,
    }));
  };

  return {
    getGeoData,
    getMapDataResult,
  };
}
