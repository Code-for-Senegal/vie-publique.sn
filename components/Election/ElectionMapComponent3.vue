<!-- components/MapComponent.vue -->
<template>
  <div class="relative h-[600px] w-full">
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
        <!-- Utilisation d'un fond de carte plus simple -->
        <LTileLayer
          url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
          layer-type="base"
          name="CartoDB"
          :options="tileLayerOptions"
        />

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
                :to="`/elections/legislatives/31`"
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

// Options de la carte optimisées
const mapOptions = {
  minZoom: 6,
  maxZoom: 9,
  maxBounds: [
    [12.3, -17.5], // Sud-Ouest
    [16.7, -11.4], // Nord-Est
  ],
  zoomControl: true,
  attributionControl: false,
  zoomSnap: 0.5,
  zoomDelta: 0.5,
  boxZoom: false,
  doubleClickZoom: false,
  dragging: true,
};

// Options des tuiles
const tileLayerOptions = {
  maxZoom: 9,
  minZoom: 6,
  opacity: 0.3, // Réduire l'opacité du fond de carte
};

// Options des polygones
const polygonOptions = {
  smoothFactor: 1.5,
  interactive: true,
};

// Palette de couleurs distinctes pour les départements
const REGION_COLORS = [
  "#1f77b4",
  "#ff7f0e",
  "#2ca02c",
  "#d62728",
  "#9467bd",
  "#8c564b",
  "#e377c2",
  "#7f7f7f",
  "#bcbd22",
  "#17becf",
  "#aec7e8",
  "#ffbb78",
  "#98df8a",
  "#ff9896",
  "#c5b0d5",
  "#c49c94",
  "#f7b6d2",
  "#c7c7c7",
  "#dbdb8d",
  "#9edae5",
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
  text-shadow:
    -1px -1px 0 #fff,
    1px -1px 0 #fff,
    -1px 1px 0 #fff,
    1px 1px 0 #fff;
}
</style>
