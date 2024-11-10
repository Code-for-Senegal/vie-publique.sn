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
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
          :options="tileLayerOptions"
        />

        <template v-for="region in regions" :key="region.id">
          <LPolygon
            :lat-lngs="region.coordinates"
            :color="getRegionColor(region)"
            :weight="1.5"
            :fill="true"
            :fillOpacity="0.3"
            @click="handleRegionClick(region)"
          >
            <LTooltip :options="{ permanent: true, direction: 'center' }">
              <span class="font-medium">{{ region.departement }}</span>
            </LTooltip>
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
  initialCenter: () => [14.4974, -14.4524], // Centre du Sénégal
  initialZoom: 7,
});

const emit = defineEmits<{
  "region-click": [region: TransformedRegion];
  "map-ready": [map: unknown];
}>();

// État de la carte
const zoom: Ref<number> = ref(props.initialZoom);
const center: Ref<LatLng> = ref(props.initialCenter);
const mapInstance: Ref<unknown> = ref(null);

// Options de la carte
const mapOptions = {
  minZoom: 6,
  maxZoom: 10,
  maxBounds: [
    [12.3, -17.5], // Sud-Ouest
    [16.7, -11.4], // Nord-Est
  ],
  zoomControl: true,
  attributionControl: false,
};

// Options des tuiles
const tileLayerOptions = {
  maxZoom: 10,
  minZoom: 6,
};

// Couleurs pour les régions avec une palette plus douce
const REGION_COLORS = [
  "#A8DADC",
  "#457B9D",
  "#1D3557",
  "#E63946",
  "#F1FAEE",
] as const;

// Fonction de couleur
const getRegionColor = (region: TransformedRegion): string => {
  return REGION_COLORS[region.id % REGION_COLORS.length];
};

// Gestion des événements
const handleMapReady = (map: unknown) => {
  mapInstance.value = map;
  emit("map-ready", map);

  // Ajuster la vue aux limites du Sénégal
  if (props.regions.length > 0) {
    const bounds = calculateBounds(props.regions);
    // @ts-ignore
    map.fitBounds(bounds, { padding: [20, 20] });
  }
};

const handleRegionClick = (region: TransformedRegion) => {
  emit("region-click", region);
};

// Fonction pour calculer les limites de la carte
const calculateBounds = (regions: TransformedRegion[]) => {
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLng = Infinity;
  let maxLng = -Infinity;

  regions.forEach((region) => {
    region.coordinates.forEach((coord) => {
      const lat = coord[0];
      const lng = coord[1];
      minLat = Math.min(minLat, lat);
      maxLat = Math.max(maxLat, lat);
      minLng = Math.min(minLng, lng);
      maxLng = Math.max(maxLng, lng);
    });
  });

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ];
};
</script>
