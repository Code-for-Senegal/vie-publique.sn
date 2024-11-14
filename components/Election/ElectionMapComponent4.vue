<!-- components/MapComponent.vue -->
<template>
  <div
    class="relative w-full"
    :class="{ 'h-[600px]': !isMobile, 'h-[400px]': isMobile }"
  >
    <!-- Loading spinner -->
    <div
      v-if="loading || pending"
      class="absolute inset-0 z-50 flex items-center justify-center bg-white/80"
    >
      <div
        class="h-20 w-20 animate-spin rounded-full border-8 border-gray-300 border-t-green-700"
      ></div>
    </div>

    <client-only>
      <LMap
        v-if="!pending"
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

        <!-- Départements -->
        <template v-for="region in regions" :key="region.id">
          <LPolygon
            :lat-lngs="region.coordinates"
            :color="getRegionColor(region.id)"
            :weight="1.5"
            :fill="true"
            :fillOpacity="0.7"
            :options="polygonOptions"
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
                {{ region.departement }}
              </span>
            </LTooltip>
            <LPopup>
              <div class="p-2">
                <h3 class="text-lg font-bold">{{ region.departement }}</h3>
                <div>Région: {{ region.region }}</div>
                <!-- <pre>{{ region }}</pre> -->
                <!-- <div v-if="region.stats" class="mt-2 text-sm"> -->
                <div>
                  Communes:
                  <span class="font-bold text-red-700">{{
                    formatNumber(region.municipality)
                  }}</span>
                </div>
                <div class="mb-1">
                  Population:
                  <span class="font-bold text-red-700">{{
                    formatNumber(region.population)
                  }}</span>
                </div>
                <div>
                  Électeurs:
                  <span class="font-bold text-red-700">{{
                    formatNumber(region.voters)
                  }}</span>
                </div>
                <div>
                  Bureaux de vote:
                  <span class="font-bold text-red-700">{{
                    formatNumber(region.offices)
                  }}</span>
                </div>
                <div>
                  Lieux de vote:
                  <span class="font-bold text-red-700">{{
                    formatNumber(region.places)
                  }}</span>
                </div>
              </div>
              <NuxtLink
                :to="`/elections/legislatives/carte-electorale/nationale/${region.departement.toUpperCase()}`"
                class="text-black-800 mt-0 inline-block rounded-md bg-green-100 p-2 font-bold"
              >
                Voir plus
              </NuxtLink>
            </LPopup>
          </LPolygon>
        </template>
      </LMap>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import type { TransformedRegion } from "~/types/election-map";
import { useElectionMapData } from "~/composables/useElectionMapJson";

interface Props {
  initialCenter?: [number, number];
  initialZoom?: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialCenter: () => [14.4974, -14.4524],
  initialZoom: 8,
  loading: false,
});

const emit = defineEmits<{
  "region-click": [region: TransformedRegion];
  "map-ready": [map: unknown];
}>();

// État local
const isMobile = ref(false);
const mapInstance = ref<unknown>(null);

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

// Chargement des données via le composable
const { getMapData, getRegionColor } = useElectionMapData();
const { data: regions, pending } = await useAsyncData(
  "map-data",
  () => getMapData(),
  {
    server: false,
  },
);

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
  tileSize: 512, // Tuiles plus grandes
  zoomOffset: -1, // Compensation pour les tuiles plus grandes
  maxNativeZoom: 9, // Limite le zoom maximal des tuiles
  keepBuffer: 2, // Réduit le buffer de tuiles
  updateWhenIdle: true, // Met à jour seulement quand la carte est inactive
  updateWhenZooming: false, // Désactive les mises à jour pendant le zoom
  bounds: [
    // Limite le chargement des tuiles à la zone du Sénégal
    [11.8, -17.9],
    [17.0, -11.2],
  ],
  crossOrigin: true,
};

const polygonOptions = computed(() => ({
  smoothFactor: 2, // Augmente le lissage pour réduire le nombre de points
  interactive: true,
  // renderer: new L.Canvas(), // Utilise Canvas au lieu de SVG
  // pane: "overlayPane",
  // bubblingMouseEvents: false, // Désactive la propagation des événements
  // weight: isMobile.value ? 1 : 1.5, // Bordures plus fines sur mobile
  // fillOpacity: 0.6,
  // className: "department-polygon", // Pour le ciblage CSS
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

  if (regions.value?.length) {
    const bounds = calculateBounds(regions.value);
    // @ts-ignore
    map.fitBounds(bounds, {
      padding: isMobile.value ? [10, 10] : [20, 20],
      animate: true,
      duration: 1,
    });
  }
};

// Utilitaires
const calculateBounds = (regions: TransformedRegion[]) => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  regions.forEach((region) => {
    region.coordinates.forEach((coord) => {
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
  return value ? value.toLocaleString("fr-FR") : "N/A";
};
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

.leaflet-interactive {
  transition: all 0.2s ease;
  will-change: transform;
}

.leaflet-interactive:hover {
  fillopacity: 0.8 !important;
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
