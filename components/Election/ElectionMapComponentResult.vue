<!-- components/MapComponent.vue -->
<template>
  <div
    ref="mapContainer"
    class="relative w-full"
    :class="{
      'h-screen md:h-[600px]': !isMobile,
      'h-[85vh] md:h-[400px]': isMobile,
    }"
  >
    <!-- Loading spinner responsive -->
    <div
      v-if="loading || pending"
      class="absolute inset-0 z-50 flex items-center justify-center bg-white/80"
    >
      <div
        :class="{
          'h-20 w-20': !isMobile,
          'h-12 w-12': isMobile,
        }"
        class="animate-spin rounded-full border-8 border-gray-300 border-t-green-700"
      ></div>
    </div>

    <client-only>
      <LMap
        v-if="!pending"
        :zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        :options="mapOptions"
        class="map-container z-0 h-full w-full"
        @ready="handleMapReady"
      >
        <!-- Fond de carte -->
        <LTileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          layer-type="base"
          name="CartoDB"
          :options="{
            ...tileLayerOptions,
            className: 'white-background-map',
          }"
        />

        <!-- Départements -->
        <template v-for="region in regions" :key="region.id">
          <LPolygon
            :lat-lngs="region.coordinates"
            :color="getPolygonBorderColor(region.winnerColor)"
            :fillColor="region.winnerColor"
            :weight="isMobile ? 1 : 2"
            :fill="true"
            :fillOpacity="0.85"
            :options="polygonOptions"
          >
            <LTooltip
              :options="{
                permanent: true,
                direction: 'center',
                className: `department-label ${getTextColorClass(region.winnerColor)}`,
                offset: isMobile ? [0, 0] : [0, -2],
              }"
            >
              <span class="department-name">
                {{ region.departement }}
              </span>
            </LTooltip>
            <LPopup :options="{ className: 'custom-popup' }">
              <div class="popup-content">
                <h3 class="text-base font-bold md:text-lg">
                  {{ region.departement }}
                </h3>
                <div class="text-sm md:text-base">
                  Région: {{ region.region }}
                </div>
                <div class="mt-2 text-sm md:text-base">
                  Coalition gagnante:
                  <span
                    class="font-bold"
                    :style="{ color: region.winnerColor }"
                  >
                    {{ region.winnerName }}
                  </span>
                </div>
                <!-- <NuxtLink
                  :to="`/elections/legislatives/carte-electorale/nationale/${region.departement.toUpperCase()}`"
                  class="text-black-800 mt-2 inline-block rounded-md bg-green-100 px-3 py-1.5 text-sm font-semibold hover:bg-green-200 md:px-4 md:py-2 md:text-base"
                >
                  Voir plus
                </NuxtLink> -->
              </div>
            </LPopup>
          </LPolygon>
        </template>
      </LMap>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import type { TransformedRegion } from "~/types/election-map";
import { useElectionMapDataResult } from "~/composables/useElectionMapJsonResult";

interface Props {
  initialCenter?: [number, number];
  initialZoom?: number;
  loading?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialCenter: () => [14.4974, -14.4524],
  initialZoom: 10,
  loading: false,
});

const emit = defineEmits<{
  "region-click": [region: TransformedRegion];
  "map-ready": [map: unknown];
}>();

// État local avec une détection plus précise du mobile
const isMobile = ref(false);
const mapInstance = ref<unknown>(null);

// Détection améliorée du mobile
onMounted(() => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };
  checkMobile();

  // Utilisation de ResizeObserver pour une meilleure performance
  const resizeObserver = new ResizeObserver(checkMobile);
  const mapContainer = document.querySelector(".map-container");
  if (mapContainer) {
    resizeObserver.observe(mapContainer);
  }

  // Nettoyage
  onUnmounted(() => {
    resizeObserver.disconnect();
  });
});

// Chargement des données
const { getMapDataResult } = useElectionMapDataResult();
const { data: regions, pending } = await useAsyncData(
  "map-data",
  () => getMapDataResult(),
  {
    server: false,
  },
);

// Configuration réactive de la carte
const zoom = computed(() =>
  isMobile.value ? props.initialZoom - 1 : props.initialZoom,
);
const center = computed(() => props.initialCenter);

// Options de carte adaptatives
const mapOptions = computed(() => ({
  minZoom: isMobile.value ? 5 : 6,
  maxZoom: isMobile.value ? 10 : 12,
  maxBounds: [
    [11.8, -17.9],
    [17.0, -11.2],
  ],
  zoomControl: !isMobile.value,
  attributionControl: false,
  zoomSnap: isMobile.value ? 1 : 0.5,
  zoomDelta: isMobile.value ? 1 : 0.5,
  boxZoom: !isMobile.value,
  doubleClickZoom: false,
  dragging: true,
  touchZoom: true,
  tap: true,
  preferCanvas: true,
}));

// Options tuiles adaptatives
const tileLayerOptions = computed(() => ({
  maxZoom: isMobile.value ? 9 : 11,
  minZoom: isMobile.value ? 5 : 6,
  opacity: 0.15,
  tileSize: 512,
  zoomOffset: -1,
  maxNativeZoom: isMobile.value ? 8 : 9,
  keepBuffer: isMobile.value ? 1 : 2,
  updateWhenIdle: true,
  updateWhenZooming: false,
  bounds: [
    [11.8, -17.9],
    [17.0, -11.2],
  ],
  crossOrigin: true,
}));

// Options polygones adaptatives
const polygonOptions = computed(() => ({
  // smoothFactor: isMobile.value ? 3 : 2,
  smoothFactor: 0.5, // Réduire pour plus de précision
  interactive: true,
  bubblingMouseEvents: false,
  className: "department-polygon",
  weight: isMobile.value ? 1 : 2,
  illRule: "evenodd", // Améliore le rendu des polygones
  lineCap: "round", // Lisse les bordures
  lineJoin: "round", // Lisse les jointures
  // Augmente la précision du rendu
  tolerance: isMobile.value ? 1 : 0.5,
  precision: 0.5,
}));

// Utilitaires
const getPolygonBorderColor = (fillColor: string) => "#ffffff";

const getTextColorClass = (backgroundColor: string) => {
  const hex = backgroundColor.replace("#", "");
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? "label-dark" : "label-light";
};

// Gestion de la carte
const handleMapReady = (map: unknown) => {
  mapInstance.value = map;
  emit("map-ready", map);
  initMap(map);
};

const initMap = (map: any) => {
  if (!map) return;

  // Attendre un peu pour s'assurer que le conteneur est bien dimensionné
  setTimeout(() => {
    map.invalidateSize();

    if (regions.value?.length) {
      const bounds = calculateBounds(regions.value);
      map.fitBounds(bounds, {
        padding: isMobile.value ? [10, 10] : [40, 40],
        animate: true,
        duration: 0.5,
        maxZoom: isMobile.value ? 8 : 10,
      });
    }

    // Désactiver le zoom sur double tap pour mobile
    if (isMobile.value) {
      map.options.tap = true;
      map.options.doubleTapZoom = false;
    }
  }, 100);
};

// Observer la visibilité de la carte
const mapContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && mapInstance.value) {
          initMap(mapInstance.value);
        }
      });
    },
    { threshold: 0.1 },
  );

  if (mapContainer.value) {
    observer.observe(mapContainer.value);
  }

  onUnmounted(() => {
    observer.disconnect();
  });
});

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
</script>

<style>
.map-container {
  background-color: #ffffff;
}

.department-label {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  font-weight: 700;
  padding: 2px 4px !important;
}

.department-name {
  font-size: clamp(8px, 2vw, 12px);
  line-height: 1.1;
  text-align: center;
  white-space: nowrap;
}

.label-light {
  color: #ffffff;
  text-shadow:
    -1px -1px 0 #000,
    1px -1px 0 #000,
    -1px 1px 0 #000,
    1px 1px 0 #000,
    0 0 4px rgba(0, 0, 0, 0.5);
}

.label-dark {
  color: #000000;
  text-shadow:
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff,
    0 0 4px rgba(255, 255, 255, 0.8);
}

.custom-popup {
  @apply rounded-lg shadow-lg;
}

.popup-content {
  @apply p-2 md:p-3;
}

.leaflet-interactive {
  transition: filter 0.2s ease;
  will-change: filter;
}

.leaflet-interactive:hover {
  filter: brightness(1.1);
  cursor: pointer;
}

.department-polygon {
  will-change: transform;
  contain: layout style paint;
  stroke-width: 1px;
  stroke-linejoin: round;
  vector-effect: non-scaling-stroke;
}

.leaflet-tile-container {
  will-change: transform;
  contain: size layout style paint;
}

/* Optimisations mobiles */
@media (max-width: 768px) {
  .leaflet-control-zoom {
    display: none;
  }

  .department-label {
    padding: 1px 2px !important;
  }

  .leaflet-interactive {
    transition: none !important;
  }

  .leaflet-popup-content {
    margin: 10px;
    font-size: 14px;
  }

  .leaflet-popup-content-wrapper {
    padding: 0;
  }

  .leaflet-popup {
    margin-bottom: 10px;
  }
}

/* Gestion du mode paysage sur mobile */
@media (max-width: 768px) and (orientation: landscape) {
  .map-container {
    height: 100vh;
  }
}

/* Optimisation pour les très petits écrans */
@media (max-width: 360px) {
  .department-name {
    font-size: 6px;
  }
}

/* Style pour le fond blanc */
.white-background-map {
  filter: brightness(1.1) contrast(0.9) saturate(0);
  background-color: #ffffff;
}

/* S'assurer que le conteneur de la carte et ses parents sont bien blancs */
.leaflet-container {
  background-color: #ffffff !important;
}

.leaflet-layer {
  background-color: #ffffff !important;
}

/* Assurer que le fond reste blanc même pendant le chargement */
.leaflet-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #ffffff;
  z-index: -1;
}
</style>
