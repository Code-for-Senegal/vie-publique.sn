<!-- components/MapComponent.vue -->
<template>
  <div class="relative h-[600px] w-full">
    <!-- Loading spinner -->
    <div
      v-if="loading"
      class="absolute inset-0 z-50 flex items-center justify-center bg-white/80"
    >
      <div
        class="h-20 w-20 animate-spin rounded-full border-8 border-gray-300 border-t-green-700"
      ></div>
    </div>

    <client-only>
      <LMap
        :zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        :options="mapOptions"
        class="z-0 h-full w-full"
        @ready="handleMapReady"
      >
        <!-- 1. Fond de carte -->
        <LTileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
          layer-type="base"
          name="CartoDB"
          :options="tileLayerOptions"
        />

        <!-- 2. Masque pour cacher les pays voisins -->
        <!-- Masque ajusté pour le Sénégal -->
        <LGeoJson
          :geojson="senegalMask"
          :options="{
            style: {
              fillColor: '#ffffff',
              color: '#ffffff',
              weight: 1,
              opacity: 1,
              fillOpacity: 1,
            },
          }"
        />

        <!-- 3. Départements du Sénégal -->
        <template v-for="region in regions" :key="region.id">
          <LPolygon
            :lat-lngs="region.coordinates"
            :color="getRegionColor(region)"
            :weight="1"
            :fill="true"
            :fillOpacity="0.6"
            :options="polygonOptions"
            @click="handleRegionClick(region)"
          >
            <LTooltip
              :options="{
                permanent: true,
                direction: 'center',
                className: 'department-label',
              }"
            >
              <span class="text-xs font-semibold">{{
                region.departement
              }}</span>
            </LTooltip>
            <LPopup>
              <div class="p-2">
                <h3 class="text-lg font-bold">{{ region.departement }}</h3>
                <p>Région: {{ region.region }}</p>
              </div>
              <NuxtLink
                :to="`/elections/legislatives/carte-electorale/nationale/${region.departement.toUpperCase()}`"
                class="rounded-md bg-green-100 p-2 text-green-700"
                >Voir plus</NuxtLink
              >
            </LPopup>
          </LPolygon>
        </template>
      </LMap>
    </client-only>
  </div>
</template>

<script setup lang="ts">
import type { TransformedRegion, LatLng } from "~/types/election-map";

interface Props {
  initialCenter?: LatLng;
  initialZoom?: number;
  regions: TransformedRegion[];
  loading: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  initialCenter: () => [14.4974, -14.4524],
  initialZoom: 7,
});

const emit = defineEmits<{
  "region-click": [region: TransformedRegion];
  "map-ready": [map: unknown];
}>();

const zoom: Ref<number> = ref(props.initialZoom);
const center: Ref<LatLng> = ref(props.initialCenter);
const mapInstance: Ref<unknown> = ref(null);

// Définition du masque inverse pour le Sénégal
const senegalMask = {
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-18.0, 17.0], // Coin Nord-Ouest
        [-11.0, 17.0], // Coin Nord-Est
        [-11.0, 12.0], // Coin Sud-Est
        [-18.0, 12.0], // Coin Sud-Ouest
        [-18.0, 17.0], // Retour au point de départ
      ],
    ],
  },
};

// Options de la carte optimisées
// Ajustement des options de la carte
const mapOptions = {
  minZoom: 7,
  maxZoom: 11,
  maxBounds: [
    [12.0, -17.7], // Sud-Ouest
    [16.9, -11.3], // Nord-Est
  ],
  zoomControl: true,
  attributionControl: false,
  zoomSnap: 0.5,
  zoomDelta: 0.5,
  boxZoom: false,
  doubleClickZoom: false,
  dragging: true,
};

// Options des tuiles avec opacité ajustée
const tileLayerOptions = {
  maxZoom: 9,
  minZoom: 6,
  opacity: 0.4, // Fond de carte légèrement plus visible
};

// Options des polygones
const polygonOptions = {
  smoothFactor: 1.5,
  interactive: true,
};

// Palette de couleurs distinctes pour les départements
// Palette de couleurs optimisée pour une meilleure distinction
const REGION_COLORS = [
  "#e6194B",
  "#3cb44b",
  "#ffe119",
  "#4363d8",
  "#f58231",
  "#911eb4",
  "#42d4f4",
  "#f032e6",
  "#bfef45",
  "#fabed4",
  "#469990",
  "#dcbeff",
  "#9A6324",
  "#fffac8",
  "#800000",
  "#aaffc3",
  "#808000",
  "#ffd8b1",
  "#000075",
  "#a9a9a9",
] as const;

const getRegionColor = (region: TransformedRegion): string => {
  return REGION_COLORS[region.id % REGION_COLORS.length];
};

const handleMapReady = (map: unknown) => {
  mapInstance.value = map;
  emit("map-ready", map);

  if (props.regions.length > 0) {
    const bounds = calculateBounds(props.regions);
    // @ts-ignore
    map.fitBounds(bounds, {
      padding: [20, 20],
      animate: true,
      duration: 1,
    });
  }
};

const handleRegionClick = (region: TransformedRegion) => {
  emit("region-click", region);
};

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
.department-label {
  background: none !important;
  border: none !important;
  box-shadow: none !important;
  color: #000;
  font-size: 10px;
  font-weight: 600;
  text-shadow:
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
}

/* Ajout d'un effet de hover sur les départements */
.leaflet-interactive {
  transition: all 0.2s ease;
}

.leaflet-interactive:hover {
  fillopacity: 0.8 !important;
  cursor: pointer;
}
</style>
