<!-- components/MapComponent.vue -->
<template>
  <div class="w-full overflow-hidden" :class="isMobile ? 'h-[400px]' : 'h-[600px]'">
    <!-- Conteneur carte -->
    <div class="relative h-full">
      <!-- Loading spinner -->
      <div
        v-if="loading || pending"
        class="absolute inset-0 z-50 flex items-center justify-center bg-white/80 dark:bg-gray-900/80"
      >
        <div
          class="h-20 w-20 animate-spin rounded-full border-8 border-gray-300 border-t-green-700"
        ></div>
      </div>

      <client-only>
        <LMap
          v-if="!pending"
          :key="leafletMapKey"
          :zoom="zoom"
          :center="center"
          :use-global-leaflet="false"
          :options="mapOptions"
          class="z-0 h-full w-full"
          @ready="handleMapReady"
        >
          <!-- Fond de carte -->
          <LTileLayer
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
            layer-type="base"
            name="CartoDB"
            :options="tileLayerOptions"
          />

          <!-- Masque pour le Sénégal -->
          <LGeoJson
            :geojson="senegalMask"
            :options="{
              style: {
                fillColor: '#F5F7FA',
                color: '#E2E8F0',
                weight: 1,
                opacity: 1,
                fillOpacity: 0.95,
              },
            }"
          />

          <!-- ========== MODE NATIONAL : 1 polygone = 1 département ========== -->
          <template v-if="!isLocalElection">
            <template v-for="region in regions" :key="region.id">
              <LPolygon
                :lat-lngs="region.coordinates"
                :color="getRegionColor(region.id)"
                :weight="1.5"
                :fill="true"
                :fill-opacity="0.7"
                :options="polygonOptions"
                @click="handleNationalDepartmentClick(region)"
              >
                <LTooltip
                  v-if="firstDeptIds.has(region.id)"
                  :options="{
                    permanent: true,
                    direction: 'center',
                    className: 'department-label',
                  }"
                >
                  <span
                    class="text-xs font-semibold"
                    :class="{ 'text-[8px]': isMobile }"
                  >
                    {{ region.departement }}
                  </span>
                </LTooltip>
                <LPopup>
                  <div class="p-2">
                    <h3 class="text-lg font-bold">{{ region.departement }}</h3>
                    <div>Région: {{ region.region }}</div>
                    <div>
                      Communes:
                      <span class="font-bold text-red-700">{{ formatNumber(region.municipality) }}</span>
                    </div>
                    <div class="mb-1">
                      Population:
                      <span class="font-bold text-red-700">{{ formatNumber(region.population) }}</span>
                    </div>
                    <div>
                      Électeurs:
                      <span class="font-bold text-red-700">{{ formatNumber(region.voters) }}</span>
                    </div>
                    <div>
                      Bureaux de vote:
                      <span class="font-bold text-red-700">{{ formatNumber(region.offices) }}</span>
                    </div>
                    <div>
                      Lieux de vote:
                      <span class="font-bold text-red-700">{{ formatNumber(region.places) }}</span>
                    </div>
                  </div>
                  <NuxtLink
                    v-if="region.departement"
                    :to="getDepartmentDetailUrl(region.departement.toUpperCase())"
                    class="text-black-800 mt-0 inline-block rounded-md bg-green-100 p-2 font-bold"
                  >
                    Voir plus
                  </NuxtLink>
                </LPopup>
              </LPolygon>
            </template>
          </template>

          <!-- ========== MODE LOCAL : 1 polygone = 1 département (polygones département) ========== -->
          <template v-else>
            <template v-for="dept in departmentGroups" :key="dept.departement">
              <LPolygon
                :lat-lngs="dept.polygon"
                :color="dept.color"
                :weight="1.5"
                :fill="true"
                :fill-opacity="0.7"
                :options="polygonOptions"
                @click="handleDepartmentClick(dept)"
              >
                <LTooltip
                  :options="{
                    permanent: true,
                    direction: 'center',
                    className: 'department-label',
                  }"
                >
                  <span
                    class="text-xs font-semibold"
                    :class="{ 'text-[8px]': isMobile }"
                  >
                    {{ dept.departement }}
                  </span>
                </LTooltip>
                <LPopup>
                  <div class="p-2">
                    <h3 class="text-lg font-bold">{{ dept.departement }}</h3>
                    <div>Région: {{ dept.region }}</div>
                    <div>
                      Communes:
                      <span class="font-bold text-green-700">{{ dept.municipalityCount }}</span>
                    </div>
                    <div>
                      Électeurs:
                      <span class="font-bold text-green-700">{{ formatNumber(dept.totalVoters) }}</span>
                    </div>
                    <div>
                      Bureaux de vote:
                      <span class="font-bold text-green-700">{{ formatNumber(dept.totalOffices) }}</span>
                    </div>
                    <div class="mb-2">
                      Lieux de vote:
                      <span class="font-bold text-green-700">{{ formatNumber(dept.totalPlaces) }}</span>
                    </div>
                    <NuxtLink
                      :to="getDepartmentDetailUrl(dept.departement)"
                      class="mt-1 inline-block rounded-md bg-green-100 p-2 font-bold text-green-800"
                    >
                      Voir plus
                    </NuxtLink>
                  </div>
                </LPopup>
              </LPolygon>
            </template>
          </template>
        </LMap>
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformedRegion, DepartmentGroup } from "~~/types/election-map";
import { useElectionMapData } from "~/composables/useElectionMapJson";

const route = useRoute();

// Type local pour le rendu des départements en mode local
interface LocalDepartmentView {
  departement: string;
  region: string;
  polygon: [number, number][]; // Coordonnées du polygone département
  municipalities: DepartmentGroup['municipalities'];
  totalVoters: number;
  totalOffices: number;
  totalPlaces: number;
  totalPopulation: number;
  municipalityCount: number;
  color: string;
}

interface Props {
  initialCenter?: [number, number];
  initialZoom?: number;
  loading?: boolean;
  electionId?: string | number | null;
  isLocalElection?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialCenter: () => [14.4974, -14.4524],
  initialZoom: 8,
  loading: false,
  electionId: null,
  isLocalElection: false,
});

const emit = defineEmits<{
  "region-click": [region: TransformedRegion];
  "map-ready": [map: unknown];
  "map-error": [];
  "department-selected": [department: any];
}>();

// État local
const isMobile = ref(false);
const mapInstance = ref<unknown>(null);

const departmentGroups = ref<LocalDepartmentView[]>([]);
// Clé pour forcer le remontage du LMap quand les données changent
const leafletMapKey = ref(0);

// Détection du mobile au montage
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };
  checkMobile();
  window.addEventListener("resize", checkMobile);

  // Nettoyage
  onUnmounted(() => {
    window.removeEventListener("resize", checkMobile);
  });
});

// Convertir electionId en number pour le composable
const electionIdNumber = computed(() => {
  if (props.electionId === null || props.electionId === undefined) return null;
  const parsed = typeof props.electionId === 'string' ? parseInt(props.electionId) : props.electionId;
  return isNaN(parsed) ? null : parsed;
});

// Chargement des données via le composable
const { getMapData, getRegionColor, loadDepartmentPolygons, groupByDepartment } = useElectionMapData(electionIdNumber);
const { data: regions, pending, error } = await useAsyncData(
  () => `map-data-${props.electionId || 'all'}`,
  async () => {
    const data = await getMapData();

    // Pour les élections locales : charger les polygones département + stats des communes
    if (props.isLocalElection) {
      const deptPolygons = await loadDepartmentPolygons();
      const communeGroups = data.length > 0 ? groupByDepartment(data) : [];

      // Base = TOUS les polygones département (pas de gaps)
      // Enrichir avec les stats locales quand disponibles
      const totalDepts = deptPolygons.length || 1;
      departmentGroups.value = deptPolygons.map((poly, index) => {
        // Comparaison normalisée pour matcher les noms entre sources différentes
        const polyKey = poly.departement.trim().toLowerCase();
        const communeGroup = communeGroups.find(g => g.departement.trim().toLowerCase() === polyKey);
        const lightness = 0.35 + (0.3 * index) / totalDepts;

        return {
          departement: poly.departement,
          region: poly.region,
          polygon: poly.coordinates,
          municipalities: communeGroup?.municipalities || [],
          totalVoters: communeGroup?.totalVoters || poly.voters || 0,
          totalOffices: communeGroup?.totalOffices || poly.offices || 0,
          totalPlaces: communeGroup?.totalPlaces || poly.places || 0,
          totalPopulation: communeGroup?.totalPopulation || poly.population || 0,
          municipalityCount: communeGroup?.municipalityCount || poly.municipality || 0,
          color: hslToHex(150, 0.5, lightness),
        };
      });
    } else {
      departmentGroups.value = [];
    }

    // Forcer le remontage du LMap pour nettoyer les layers Leaflet
    leafletMapKey.value++;
    return data;
  },
  {
    server: false,
    watch: [electionIdNumber],
  },
);

// Surveiller les données et émettre map-error si vide
watch([regions, pending], ([newRegions, isPending]) => {
  if (!isPending && (!newRegions || newRegions.length === 0) && departmentGroups.value.length === 0) {
    emit('map-error');
  }
}, { immediate: true });

// IDs des premières occurrences pour éviter les labels dupliqués (mode national)
const firstDeptIds = computed(() => {
  const seen = new Set<string>();
  const ids = new Set<number>();
  for (const r of (regions.value || [])) {
    if (!seen.has(r.departement)) {
      seen.add(r.departement);
      ids.add(r.id);
    }
  }
  return ids;
});

// Émettre map-error en cas d'erreur de chargement
watch(error, (newError) => {
  if (newError) {
    emit('map-error');
  }
});

// Computed réactifs
const zoom = computed(() =>
  isMobile.value ? props.initialZoom - 0.5 : props.initialZoom,
);
const center = computed(() => props.initialCenter);

// Configuration de la carte
const mapOptions = {
  minZoom: 6,
  maxZoom: 11,
  maxBounds: [
    [11.8, -17.9],
    [17.0, -11.2],
  ],
  zoomControl: true,
  attributionControl: false,
  zoomSnap: 0.5,
  zoomDelta: 0.5,
  boxZoom: false,
  doubleClickZoom: false,
  dragging: true,
};

const tileLayerOptions = {
  maxZoom: 11,
  minZoom: 6,
  opacity: 0.3,
  tileSize: 512,
  zoomOffset: -1,
  maxNativeZoom: 9,
  keepBuffer: 2,
  updateWhenIdle: true,
  updateWhenZooming: false,
  bounds: [
    [11.8, -17.9],
    [17.0, -11.2],
  ],
  crossOrigin: true,
};

const polygonOptions = computed(() => ({
  smoothFactor: 2,
  interactive: true,
}));

// Masque pour le Sénégal
const senegalMask = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-20.0, 18.0],
        [-10.0, 18.0],
        [-10.0, 11.0],
        [-20.0, 11.0],
        [-20.0, 18.0],
      ],
    ],
  },
};

// Gestionnaires d'événements
const handleMapReady = (map: unknown) => {
  mapInstance.value = map;
  emit("map-ready", map);

  // Utiliser les polygones de département pour fitBounds en mode local
  const boundsSource = props.isLocalElection && departmentGroups.value.length > 0
    ? departmentGroups.value.map(d => ({ coordinates: d.polygon } as any))
    : regions.value;

  if (boundsSource?.length) {
    const bounds = calculateBounds(boundsSource);
    // @ts-ignore
    map.fitBounds(bounds, {
      padding: isMobile.value ? [10, 10] : [20, 20],
      animate: true,
      duration: 1,
    });
  }
};

// Utilitaires
const calculateBounds = (items: { coordinates: [number, number][] }[]) => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  items.forEach((item) => {
    item.coordinates.forEach((coord) => {
      minLat = Math.min(minLat, coord[0]);
      maxLat = Math.max(maxLat, coord[0]);
      minLng = Math.min(minLng, coord[1]);
      maxLng = Math.max(maxLng, coord[1]);
    });
  });

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
};

const formatNumber = (value?: number) => {
  if (value === undefined || value === null) return "N/A";
  return value.toLocaleString("fr-FR");
};

// Handlers département
const handleDepartmentClick = (dept: LocalDepartmentView) => {
  emit('department-selected', {
    departement: dept.departement,
    region: dept.region,
    municipalities: dept.municipalities,
    totalVoters: dept.totalVoters,
    totalOffices: dept.totalOffices,
    totalPlaces: dept.totalPlaces,
    totalPopulation: dept.totalPopulation,
    municipalityCount: dept.municipalityCount,
  });
};

const handleNationalDepartmentClick = (region: any) => {
  emit('department-selected', {
    departement: region.departement,
    region: region.region,
    municipalities: [],
    totalVoters: (region as any).voters || 0,
    totalOffices: (region as any).offices || 0,
    totalPlaces: (region as any).places || 0,
    totalPopulation: (region as any).population || 0,
    municipalityCount: (region as any).municipality || 0,
  });
};

// Construire l'URL de détail du département avec le contexte de l'élection
const getDepartmentDetailUrl = (departement: string) => {
  const query: Record<string, string> = {};

  // Pour les élections locales, ne pas passer l'ID d'élection
  // car la collection election_map_national n'a pas de données locales
  if (props.electionId && !props.isLocalElection) {
    query.election = String(props.electionId);
  }
  if (route.query.type) {
    query.type = route.query.type as string;
  }
  if (route.query.year) {
    query.year = route.query.year as string;
  }

  return {
    path: `/elections-senegal/carte-electorale/nationale/${encodeURIComponent(departement)}`,
    query,
  };
};

// Utilitaire HSL → Hex (copie locale pour usage dans le template)
function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0, g = 0, b = 0;

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
</script>

<style>
.department-label {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  color: #1a1a1a;
  font-size: 10px;
  font-weight: 600;
  text-shadow:
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
}

.dark .department-label {
  color: #f3f4f6;
  text-shadow:
    -1px -1px 0 #1f2937,
    1px -1px 0 #1f2937,
    -1px 1px 0 #1f2937,
    1px 1px 0 #1f2937;
}

.leaflet-interactive {
  transition: all 0.2s ease;
  will-change: transform;
}

.leaflet-interactive:hover {
  fill-opacity: 0.8 !important;
  cursor: pointer;
  filter: brightness(0.95);
}

.leaflet-container {
  transform: translate3d(0, 0, 0);
  backface-visibility: hidden;
  perspective: 1000;
  transform-style: preserve-3d;
}

.department-polygon {
  will-change: transform;
  contain: layout style paint;
}

.leaflet-tile-container {
  will-change: transform;
  contain: size layout style paint;
}

@media (max-width: 768px) {
  .department-label {
    font-size: 8px;
  }
  .leaflet-interactive {
    transition: none !important;
  }
}
</style>
