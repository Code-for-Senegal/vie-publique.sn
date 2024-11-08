<!-- components/MapComponent.vue -->
<template>
  <div class="relative h-[600px] w-full">
    <div
      v-if="loading"
      class="absolute inset-0 z-50 flex items-center justify-center bg-white/80"
    >
      <USpinner />
    </div>

    <!-- Map -->
    <client-only>
      <LMap
        :zoom="zoom"
        :center="center"
        :use-global-leaflet="false"
        class="z-0 h-full w-full"
      >
        <LTileLayer
          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/light_all/{z}/{x}/{y}.png"
          :options="{
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 18,
            minZoom: 6,
          }"
        />

        <template v-for="region in regions" :key="region.id">
          <LPolygon
            :lat-lngs="region.coordinates"
            :color="getRegionStyle(region).color"
            :fillColor="getRegionStyle(region).fillColor"
            :weight="getRegionStyle(region).weight"
            :fillOpacity="getRegionStyle(region).fillOpacity"
            @mouseover="handleMouseOver(region)"
            @mouseout="handleMouseOut()"
            @click="handleRegionClick(region)"
          >
            <LTooltip :options="{ permanent: false }">
              {{ region.region }} - {{ region.departement }}
            </LTooltip>
          </LPolygon>
        </template>
      </LMap>
    </client-only>

    <!-- Légende -->
    <div
      class="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white p-4 shadow-md"
    >
      <h3 class="mb-2 font-bold">Légende</h3>
      <div class="flex flex-col gap-2">
        <div
          v-for="(color, name) in legendColors"
          :key="name"
          class="flex items-center gap-2"
        >
          <div
            class="h-4 w-4 rounded"
            :style="{ backgroundColor: color }"
          ></div>
          <span>{{ name }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TransformedRegion, LatLng } from "~/types/election-map";

interface Props {
  initialCenter?: LatLng;
  initialZoom?: number;
  loading: boolean;
  regions: TransformedRegion[];
}

const selectedRegion = ref<number | null>(null);
const hoveredRegion = ref<number | null>(null);

// Styles de base
const baseStyles = {
  default: {
    fillColor: "#CCCCCC",
    color: "#FFFFFF",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.7,
  },
  selected: {
    fillColor: "#FF4444",
    color: "#FFFFFF",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8,
  },
  hover: {
    fillColor: "#FFAAAA",
    color: "#FFFFFF",
    weight: 2,
    opacity: 1,
    fillOpacity: 0.7,
  },
} as const;

const props = withDefaults(defineProps<Props>(), {
  initialCenter: () => [14.6937, -17.4441],
  initialZoom: 7,
});

// Couleurs par région (exemple avec deux partis)
const regionColors = {
  DAKAR: "#FF0000", // Rouge
  KAOLACK: "#0000FF", // Bleu
  LOUGA: "#FF0000", // Rouge
  // Ajoutez d'autres régions selon vos besoins
};

const legendColors = {
  "Parti A": "#FF0000",
  "Parti B": "#0000FF",
};

const getRegionStyle = (region: TransformedRegion): StyleOptions => {
  if (selectedRegion.value === region.id) {
    return baseStyles.selected;
  }
  if (hoveredRegion.value === region.id) {
    return baseStyles.hover;
  }

  return {
    ...baseStyles.default,
    fillColor: regionColors[region.region] || baseStyles.default.fillColor,
  };
};

// Gestionnaires d'événements
const handleMouseOver = (region: TransformedRegion) => {
  hoveredRegion.value = region.id;
};

const handleMouseOut = () => {
  hoveredRegion.value = null;
};

const handleRegionClick = (region: TransformedRegion) => {
  selectedRegion.value = selectedRegion.value === region.id ? null : region.id;
};

// Configuration de la carte
const zoom = ref(6);
const center = ref([14.6937, -17.4441]); // Centre du Sénégal
</script>

<style scoped>
:deep(.leaflet-tooltip) {
  background: rgba(255, 255, 255, 0.9);
  border: none;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}
</style>
