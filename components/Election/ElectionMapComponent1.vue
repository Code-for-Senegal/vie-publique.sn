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

    <!-- Map -->
    <client-only>
      <LMap
        :zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        class="z-0 h-full w-full"
        @ready="handleMapReady"
      >
        <LTileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        />

        <template v-for="region in regions" :key="region.id">
          <LPolygon
            :lat-lngs="region.coordinates"
            :color="getRegionColor(region)"
            :weight="2"
            :fill="true"
            :fillOpacity="0.4"
            @click="handleRegionClick(region)"
          >
            <LPopup>
              <div class="p-2">
                <h3 class="text-lg font-bold">{{ region.region }}</h3>
                <p>Département: {{ region.departement }}</p>
              </div>
              <NuxtLink
                :to="`/elections/legislatives/31`"
                class="rounded-md bg-green-500 p-2 text-white"
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
  initialCenter: () => [14.6937, -17.4441],
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

// Couleurs pour les régions
const REGION_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FFEEAD",
] as const;

// Typer la fonction de couleur
const getRegionColor = (region: TransformedRegion): string => {
  return REGION_COLORS[region.id % REGION_COLORS.length];
};

// Gestion des événements
const handleMapReady = (map: unknown) => {
  mapInstance.value = map;
  emit("map-ready", map);
};

const handleRegionClick = (region: TransformedRegion) => {
  emit("region-click", region);
};
</script>
