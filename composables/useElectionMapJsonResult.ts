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
  // État global pour le cache des données
  const geoData = useState<GeoData[]>("geo-data", () => []);
  const isGeoDataLoaded = useState<boolean>("geo-data-loaded", () => false);

  // Charger les données géographiques
  const loadGeoDataWithWinner = async () => {
    if (isGeoDataLoaded.value) return geoData.value;

    try {
      // Import dynamique du fichier JSON
      const data = await import(
        "~/assets/data/elections/carte-result-jsonminifier.json"
      );
      geoData.value = data.default;
      isGeoDataLoaded.value = true;
      return data.default;
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données géographiques:",
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
