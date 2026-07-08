// composables/useElectionMapDataResult.ts
import type { DepartmentStats } from "~~/types/election-map-national";

interface GeoData {
  id: number;
  coalition_gagnante?: {
    name: string;
    color: string;
    logo: string;
  };
  constituencie?: {
    name: string;
    region: string;
    type: string;
    nationale_type: string;
    population: number;
  };
  election?: {
    type: string;
    year: number;
  };
  winning_list?: {
    is_substitute: boolean;
    candidates: {
      first_name: string;
      last_name: string;
      position: number;
    }[];
  };
  voters?: number;
  // Position is at the root of the 'carte' collection item
  Position?: {
    type: string;
    coordinates: number[][][];
  };
  // Fallback for legacy fields
  departement?: string;
  region?: string;
}

interface TransformedRegion {
  id: number;
  departement: string;
  region: string;
  winnerName: string;
  winnerColor: string;
  winnerLogo: string;
  headOfList: string;
  voters: number;
  coordinates: [number, number][];
  stats?: DepartmentStats | null;
  type: "Polygon";
}

export interface TableResultItem {
  id: number;
  commune: string;
  coalition: string;
  coalitionColor: string;
  headOfList: string;
  votes: number;
  departement?: string;
  region?: string;
}

export function useElectionMapDataResult() {
  const config = useRuntimeConfig();

  // État global pour le cache des données
  const geoData = useState<GeoData[]>("geo-data-result", () => []);
  const loading = useState<boolean>("geo-data-result-loading", () => false);
  const isGeoDataLoaded = useState<boolean>(
    "geo-data-result-loaded",
    () => false,
  );

  // Charger les données géographiques depuis l'API serveur Nuxt
  const loadGeoDataWithWinner = async () => {
    if (isGeoDataLoaded.value) return geoData.value;
    if (loading.value) return []; // Avoid concurrent fetches

    loading.value = true;
    try {
      const response = await $fetch<{ data: GeoData[] }>('/api/carte/result');
      const data = (response?.data || response) as GeoData[];
      geoData.value = Array.isArray(data) ? data : [];
      isGeoDataLoaded.value = true;
      return geoData.value;
    } catch (error) {
      console.error(
        "Erreur lors du chargement des données de résultats:",
        error,
      );
      return [];
    } finally {
      loading.value = false;
    }
  };

  // Obtenir les données géographiques
  const getGeoData = async () => {
    if (!isGeoDataLoaded.value) {
      await loadGeoDataWithWinner();
    }
    return geoData.value;
  };

  const getFilteredData = (geoData: GeoData[], electionType: string, electionYear: number) => {
      return geoData.filter((item) => {
         const constData = item.constituencie;
         if (!constData) return false;

         // 1. FILTER BY ELECTION CONTEXT
         if (!item.election) return false;
         if (item.election.type !== electionType || item.election.year !== electionYear) {
             return false;
         }

         // 2. FILTER BY CONSTITUENCY TYPE
         if (electionType === 'locale') {
             return constData.type === 'national' && constData.nationale_type === 'commune';
         } else {
             return constData.type === 'national' && constData.nationale_type === 'departement';
         }
      });
  }

  // Transformer les coordonnées pour Leaflet
  const transformCoordinates = (geoData: GeoData[], electionType: string, electionYear: number): TransformedRegion[] => {
    return getFilteredData(geoData, electionType, electionYear)
      .map((item) => {
        const constData = item.constituencie!;

        // Handle GeoJSON structure
        const coordsRaw = item.Position?.coordinates?.[0] || [];
        const coordinates: [number, number][] = Array.isArray(coordsRaw)
            ? coordsRaw.map((coord: any) => [coord[1], coord[0]]) // Flip to [lat, lng]
            : [];

        // Find Head of List
        let headOfList = "";
        if (item.winning_list && !item.winning_list.is_substitute && item.winning_list.candidates) {
            const head = item.winning_list.candidates.find(c => c.position === 1);
            if (head) {
                headOfList = `${head.first_name} ${head.last_name}`;
            }
        }

        return {
          id: item.id,
          departement: constData.name || item.departement || "Inconnu",
          region: constData.region || item.region || "",
          winnerName: item.coalition_gagnante?.name || "",
          winnerColor: item.coalition_gagnante?.color || "#cccccc",
          winnerLogo: item.coalition_gagnante?.logo || "",
          headOfList,
          voters: item.voters || 0,
          coordinates: coordinates,
          type: "Polygon" as const,
        };
      })
      .filter(item => item.coordinates.length > 0);
  };

  // Transform data for Table
  const transformTableData = (geoData: GeoData[], electionType: string, electionYear: number): TableResultItem[] => {
      return getFilteredData(geoData, electionType, electionYear)
        .map((item) => {
            const constData = item.constituencie;

            // Find Head of List
            let headOfList = "Non défini";
            if (item.winning_list && !item.winning_list.is_substitute && item.winning_list.candidates) {
                const head = item.winning_list.candidates.find(c => c.position === 1);
                if (head) {
                    headOfList = `${head.first_name} ${head.last_name}`;
                }
            }

            return {
                id: item.id,
                commune: constData?.name || "Inconnu",
                coalition: item.coalition_gagnante?.name || "Sans coalition",
                coalitionColor: item.coalition_gagnante?.color || "#cccccc",
                headOfList: headOfList,
                votes: item.voters || 0,
                departement: item.departement || "",
                region: constData?.region || item.region || "",
            };
        });
  }

  // Obtenir les données complètes de la carte
  const getMapDataResult = async (electionType: string = 'legislative', electionYear: number) => {
    await getGeoData();
    return transformCoordinates(geoData.value, electionType, electionYear);
  };

  // Get Table Data
  const getTableDataResult = async (electionType: string = 'legislative', electionYear: number) => {
      await getGeoData();
      return transformTableData(geoData.value, electionType, electionYear);
  }

  return {
    getGeoData,
    getMapDataResult,
    getTableDataResult,
    loading: computed(() => loading.value),
    isLoaded: computed(() => isGeoDataLoaded.value)
  };
}
