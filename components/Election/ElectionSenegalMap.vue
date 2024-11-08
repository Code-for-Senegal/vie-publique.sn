<template>
  <UCard class="h-[800px]">
    <template #header>
      <div class="mb-4 flex items-center justify-between">
        <h2 class="text-xl font-semibold">Départements du Sénégal</h2>
      </div>
    </template>

    <div ref="mapContainer" class="relative h-full w-full">
      <!-- Loading state -->
      <div
        v-if="loading"
        class="absolute inset-0 z-50 flex items-center justify-center bg-white bg-opacity-75"
      >
        <USpinner />
      </div>

      <!-- Error state -->
      <UAlert
        v-if="error"
        type="error"
        :title="error"
        class="absolute right-4 top-4 z-50"
      />

      <svg
        ref="mapSvg"
        class="h-full w-full"
        :style="{ minHeight: '600px' }"
      ></svg>

      <!-- Tooltip -->
      <div
        v-if="hoveredDepartment"
        class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full transform rounded-lg bg-white p-3 text-sm shadow-lg"
        :style="tooltipStyle"
      >
        <div class="mb-1 text-base font-bold">
          {{ hoveredDepartment.departement }}
        </div>
        <div class="text-gray-600">
          <div>Région: {{ hoveredDepartment.region }}</div>
        </div>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import * as d3 from "d3";

// Types pour vos données Directus
interface DepartmentPosition {
  type: string;
  coordinates: number[][][];
}

interface Department {
  id: number;
  Position: DepartmentPosition;
  region: string;
  departement: string;
}

// Refs
const loading = ref(true);
const error = ref<string | null>(null);
const mapContainer = ref<HTMLDivElement | null>(null);
const mapSvg = ref<SVGElement | null>(null);
const width = ref(800);
const height = ref(600);
const hoveredDepartment = ref<Department | null>(null);

// Config
const config = {
  colors: {
    default: "#e5e7eb",
    hover: "#93c5fd",
    stroke: "#1f2937",
    selected: "#3b82f6",
  },
  strokeWidth: 0.5,
  margin: { top: 20, right: 20, bottom: 20, left: 20 },
};

// Styles réactifs pour le tooltip
const tooltipStyle = reactive({
  left: "0px",
  top: "0px",
  opacity: "0",
});

// Convertir les données en format GeoJSON
const convertToGeoJSON = (departments: Department[]) => {
  return {
    type: "FeatureCollection",
    features: departments.map((dept) => ({
      type: "Feature",
      id: dept.id,
      properties: {
        id: dept.id,
        region: dept.region,
        departement: dept.departement,
      },
      geometry: dept.Position,
    })),
  };
};

const createMap = async () => {
  if (!mapContainer.value || !mapSvg.value) return;

  loading.value = true;
  error.value = null;

  try {
    console.log("Chargement des données...");
    const { fetchDepartments } = useDepartments();
    const departments = await fetchDepartments();
    console.log("Données chargées:", departments);

    if (!departments.length) {
      throw new Error("Aucune donnée de département trouvée");
    }

    const svg = d3.select(mapSvg.value);
    svg.selectAll("*").remove();

    const containerWidth = mapContainer.value.clientWidth;
    const containerHeight = mapContainer.value.clientHeight;

    // Ajuster la projection
    const projection = d3
      .geoMercator()
      .center([-14.5, 14.5])
      .scale(4000)
      .translate([containerWidth / 2, containerHeight / 2]);

    const path = d3.geoPath().projection(projection);

    // Convertir et dessiner les données
    const geojsonData = convertToGeoJSON(departments);

    // Ajouter un groupe principal avec transformation
    const g = svg.append("g");

    // Dessiner les départements
    g.selectAll("path")
      .data(geojsonData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", config.colors.default)
      .attr("stroke", config.colors.stroke)
      .attr("stroke-width", config.strokeWidth)
      .attr("class", "department-path");
    // ... événements ...

    // Ajouter le zoom
    const zoom = d3
      .zoom()
      .scaleExtent([1, 8])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
  } catch (err) {
    console.error("Erreur:", err);
    error.value =
      err instanceof Error ? err.message : "Erreur de chargement de la carte";
  } finally {
    loading.value = false;
  }
};

// ... reste du code (handleResize, debounce, cycle de vie) reste identique ...
</script>

<style scoped>
.department-path {
  transition: fill 0.2s ease;
  vector-effect: non-scaling-stroke;
}

.department-path:hover {
  cursor: pointer;
}

svg {
  display: block;
  max-width: 100%;
  height: auto;
}
</style>
