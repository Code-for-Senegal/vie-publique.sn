// composables/useElectionMapData.ts
import type {
  PollingStation,
  DepartmentStats,
} from "~/types/election-map-national";

interface GeoData {
  departement: string;
  region: string;
  voters: number;
  offices: number;
  places: number;
  municipality: number;
  population: number;
  id: number;
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
  coordinates: [number, number][];
  stats?: DepartmentStats | null;
}

export function useElectionMapData() {
  // État global pour le cache des données
  const geoData = useState<GeoData[]>("geo-data", () => []);
  const isGeoDataLoaded = useState<boolean>("geo-data-loaded", () => false);

  // Charger les données géographiques depuis l'API serveur Nuxt
  const loadGeoData = async () => {
    if (isGeoDataLoaded.value) return geoData.value;

    try {
      // Appel via l'API serveur Nuxt (sécurisé, avec cache serveur)
      const response = await $fetch<{ data: GeoData[] }>('/api/carte');
      
      // Stocker les données dans le state
      geoData.value = response.data || response || [];
      isGeoDataLoaded.value = true;
      return geoData.value;
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
      await loadGeoData();
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
      coordinates: item.Position.coordinates[0].map((coord) => [
        coord[1],
        coord[0],
      ]), // Inverser lat/lng pour Leaflet
    }));
  };

  // Obtenir les statistiques des départements
  const getDepartmentStats = (department?: string) => {
    // ✅ Utilisation de l'endpoint serveur Nuxt (sécurisé, avec cache serveur)
    const url = "/api/elections/map/department-stats";
    const params = department ? { department } : {};

    return useFetch<{ data: DepartmentStats[] } | DepartmentStats>(url, {
      key: department ? `department-stats-${department}` : "departments-stats",
      params,
      transform: (response) => {
        // Si département spécifique, on retourne directement l'objet
        if (department && response && !Array.isArray(response)) {
          return response;
        }
        // Sinon on retourne le tableau
        return Array.isArray(response) ? response : response.data;
      },
      server: true,
    });
  };

  // Obtenir les données complètes de la carte
  const getMapData = async () => {
    const [geoDataResult, { data: stats }] = await Promise.all([
      getGeoData(),
      getDepartmentStats(),
    ]);

    const transformedGeoData = transformCoordinates(geoDataResult);

    return transformedGeoData.map((geo) => ({
      ...geo,
      stats: stats.value?.find((s) => s.department === geo.departement) || null,
    }));
  };

  // Cache des couleurs
  const colorCache = new Map();

  // Calculer la couleur d'une région
  const getRegionColor = (
    regionId: number,
    baseHue: number = 150,
    saturation: number = 0.5,
  ) => {
    const cacheKey = `${regionId}-${baseHue}-${saturation}`;

    if (colorCache.has(cacheKey)) {
      return colorCache.get(cacheKey);
    }

    const totalRegions = geoData.value.length || 46;
    const lightness = 0.35 + (0.3 * (regionId % totalRegions)) / totalRegions;
    const color = hslToHex(baseHue, saturation, lightness);

    colorCache.set(cacheKey, color);
    return color;
  };

  // Fonction pour obtenir les détails d'un département
  const getDepartmentDetails = (department: string) => {
    // ✅ Utilisation de l'endpoint serveur Nuxt (sécurisé, avec cache serveur)
    const url = `/api/elections/map/department-details/${encodeURIComponent(department)}`;

    return useFetch<{ data: PollingStation[] }>(url, {
      key: `department-details-${department}`,
      transform: (response) => response.data,
      server: true,
    });
  };

  return {
    getGeoData,
    getDepartmentStats,
    getMapData,
    getRegionColor,
    getDepartmentDetails,
  };
}

// Utilitaire pour convertir HSL en Hex
function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) [r, g, b] = [c, x, 0];
  else if (60 <= h && h < 120) [r, g, b] = [x, c, 0];
  else if (120 <= h && h < 180) [r, g, b] = [0, c, x];
  else if (180 <= h && h < 240) [r, g, b] = [0, x, c];
  else if (240 <= h && h < 300) [r, g, b] = [x, 0, c];
  else if (300 <= h && h < 360) [r, g, b] = [c, 0, x];

  const toHex = (n: number): string => {
    const hex = Math.round((n + m) * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
