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
          v-if="!pending && departmentResults.length > 0"
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

          <!-- Départements avec résultats -->
          <template v-for="dept in departmentResults" :key="dept.departement">
            <LPolygon
              :lat-lngs="dept.polygon"
              :color="getPolygonBorderColor(dept.winnerColor)"
              :fill-color="dept.winnerColor"
              :weight="1.5"
              :fill="true"
              :fill-opacity="0.75"
              :options="polygonOptions"
              @click="handleDepartmentClick(dept)"
            >
              <LTooltip
                :options="{
                  permanent: true,
                  direction: 'center',
                  className: `department-label ${getTextColorClass(dept.winnerColor)}`,
                }"
              >
                <span
                  class="text-xs font-semibold"
                  :class="{ 'text-[8px]': isMobile }"
                >
                  {{ dept.departement }}
                </span>
              </LTooltip>
            </LPolygon>
          </template>
        </LMap>

        <!-- Empty State -->
        <div v-else-if="!pending && departmentResults.length === 0" class="flex flex-col items-center justify-center h-full">
          <UIcon name="i-heroicons-map" class="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
          <h3 class="text-lg font-bold text-gray-500">Aucune donnée disponible</h3>
          <p class="text-sm text-gray-400">Les résultats ne sont pas encore disponibles pour cette élection.</p>
        </div>
      </client-only>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useElectionMapData } from "~/composables/useElectionMapJson";
import { useElectionMapDataResult, type TableResultItem } from "~/composables/useElectionMapJsonResult";

interface DepartmentResultView {
  departement: string;
  region: string;
  polygon: [number, number][];
  winnerName: string;
  winnerColor: string;
  headOfList: string;
  communesCount: number;
  communes: TableResultItem[];
}

interface Props {
  initialCenter?: [number, number];
  initialZoom?: number;
  loading?: boolean;
  electionType: string;
  electionYear: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialCenter: () => [14.4974, -14.4524],
  initialZoom: 8,
  loading: false,
});

const emit = defineEmits<{
  "map-ready": [map: unknown];
  "department-selected": [department: any];
  "map-error": [];
}>();

// État local
const isMobile = ref(false);
const mapInstance = ref<unknown>(null);
const departmentResults = ref<DepartmentResultView[]>([]);
const leafletMapKey = ref(0);

// Détection du mobile au montage
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };
  checkMobile();
  window.addEventListener("resize", checkMobile);
  onUnmounted(() => {
    window.removeEventListener("resize", checkMobile);
  });
});

// Charger les polygones département
const { loadDepartmentPolygons } = useElectionMapData(null);
const { getTableDataResult, loading: loadingResults } = useElectionMapDataResult();

// Fonction de normalisation des noms de départements (insensible casse, accents, espaces)
function normalizeDepartmentName(name: string): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Retirer les accents
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Normaliser les espaces multiples
    .replace(/[^a-z0-9 ]/g, ''); // Retirer les caractères spéciaux
}

// Version encore plus agressive pour fallback (lettres uniquement)
function normalizeAggressive(name: string): string {
  if (!name) return '';
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z]/g, ''); // Garder uniquement les lettres
}

// Cache pour le mapping département normalisé -> nom original
const deptNameMapping = new Map<string, string>();

// Trouver la meilleure correspondance pour un nom de département
function findBestDeptMatch(
  polyDept: string,
  deptMap: Map<string, TableResultItem[]>
): TableResultItem[] | null {
  // 1. Essai exact avec normalisation standard
  const polyKey = normalizeDepartmentName(polyDept);
  if (deptMap.has(polyKey)) {
    return deptMap.get(polyKey)!;
  }

  // 2. Essai avec normalisation agressive (lettres uniquement)
  const aggressiveKey = normalizeAggressive(polyDept);
  for (const [key, items] of deptMap) {
    if (normalizeAggressive(deptNameMapping.get(key) || key) === aggressiveKey) {
      return items;
    }
  }

  // 3. Essai avec correspondance partielle (département contenu dans la clé ou vice-versa)
  for (const [key, items] of deptMap) {
    const originalName = deptNameMapping.get(key) || '';
    const aggressiveOriginal = normalizeAggressive(originalName);

    if (aggressiveKey.includes(aggressiveOriginal) || aggressiveOriginal.includes(aggressiveKey)) {
      if (aggressiveKey.length >= 3 && aggressiveOriginal.length >= 3) {
        return items;
      }
    }
  }

  return null;
}

// Charger et transformer les données
const { data: rawResults, pending } = useLazyAsyncData(
  `map-result-locale-${props.electionType}-${props.electionYear}`,
  async () => {
    // 1. Charger les polygones des départements
    const deptPolygons = await loadDepartmentPolygons();

    // 2. Charger les résultats par commune
    const communeResults = await getTableDataResult(props.electionType, props.electionYear);

    // 3. Grouper les résultats par département (avec normalisation)
    const deptMap = new Map<string, TableResultItem[]>();

    for (const commune of communeResults) {
      const rawDept = commune.departement || '';
      const deptKey = normalizeDepartmentName(rawDept);
      if (!deptKey) continue;

      deptNameMapping.set(deptKey, rawDept);

      if (!deptMap.has(deptKey)) {
        deptMap.set(deptKey, []);
      }
      deptMap.get(deptKey)!.push(commune);
    }

    // 4. Déterminer le gagnant par département (coalition avec le plus de communes)
    const results: DepartmentResultView[] = [];

    for (const poly of deptPolygons) {
      // Utiliser la fonction de correspondance avec fallback
      const communes = findBestDeptMatch(poly.departement, deptMap) || [];

      // Compter les victoires par coalition (avec leur couleur)
      const coalitionWins = new Map<string, { count: number; headOfList: string; color: string }>();
      for (const commune of communes) {
        const coalition = commune.coalition;
        if (!coalitionWins.has(coalition)) {
          coalitionWins.set(coalition, { count: 0, headOfList: commune.headOfList, color: commune.coalitionColor });
        }
        coalitionWins.get(coalition)!.count++;
      }

      // Trouver la coalition gagnante (plus de communes remportées)
      let winnerName = '';
      let winnerCount = 0;
      let headOfList = '';
      let winnerColor = '#e5e7eb'; // Couleur par défaut si pas de données

      for (const [coalition, data] of coalitionWins) {
        if (data.count > winnerCount) {
          winnerCount = data.count;
          winnerName = coalition;
          headOfList = data.headOfList;
          winnerColor = data.color || '#cccccc';
        }
      }

      results.push({
        departement: poly.departement,
        region: poly.region,
        polygon: poly.coordinates,
        winnerName,
        winnerColor,
        headOfList,
        communesCount: winnerCount,
        communes,
      });
    }

    return results;
  },
  {
    watch: [() => props.electionType, () => props.electionYear],
    immediate: true
  }
);

// Màj `departmentResults` quand les données changent
watch(rawResults, (newData) => {
  if (newData) {
    departmentResults.value = newData;
    leafletMapKey.value++;
  }
}, { immediate: true });

// Émettre map-error si pas de données après chargement
watch([() => departmentResults.value, pending], ([results, isPending]) => {
  if (!isPending && (!results || results.length === 0 || results.every(r => !r.winnerName))) {
    emit('map-error');
  }
}, { immediate: true });

// Configuration
const zoom = computed(() => isMobile.value ? props.initialZoom - 0.5 : props.initialZoom);
const center = computed(() => props.initialCenter);

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

const senegalMask = {
  type: "Feature" as const,
  properties: {},
  geometry: {
    type: "Polygon" as const,
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

// Handlers
const handleMapReady = (map: unknown) => {
  mapInstance.value = map;
  emit("map-ready", map);

  if (departmentResults.value?.length) {
    const bounds = calculateBounds(departmentResults.value.map(d => ({ coordinates: d.polygon })));
    // @ts-ignore
    map.fitBounds(bounds, {
      padding: isMobile.value ? [10, 10] : [20, 20],
      animate: true,
      duration: 1,
    });
  }
};

const handleDepartmentClick = (dept: DepartmentResultView) => {
  emit('department-selected', {
    departement: dept.departement,
    region: dept.region,
    winnerName: dept.winnerName,
    winnerColor: dept.winnerColor,
    headOfList: dept.headOfList,
    communesCount: dept.communesCount,
    communes: dept.communes,
  });
};

// Utilitaires
const calculateBounds = (items: { coordinates: [number, number][] }[]) => {
  let minLat = Infinity, maxLat = -Infinity, minLng = Infinity, maxLng = -Infinity;

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

// Couleur de bordure du polygone (plus foncée)
function getPolygonBorderColor(fillColor: string): string {
  // Simple darken
  return fillColor;
}

// Classe de texte selon la luminosité de la couleur de fond
function getTextColorClass(bgColor: string): string {
  if (!bgColor || bgColor === '#e5e7eb') return 'text-gray-800';

  // Convertir hex en RGB
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculer la luminosité
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  return luminance > 0.5 ? 'text-gray-900' : 'text-white';
}
</script>

<style>
.department-label {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.department-label.text-white {
  color: white !important;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.department-label.text-gray-900 {
  color: #111827 !important;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}
</style>
