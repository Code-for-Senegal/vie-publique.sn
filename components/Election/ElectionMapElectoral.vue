<!-- components/map/SenegalMap.vue -->
<template>
  <div class="relative h-full w-full">
    <svg
      viewBox="0 0 800 600"
      class="h-full w-full"
      @mouseleave="store.setHoveredDepartment(null)"
    >
      <g>
        <path
          v-for="department in store.departments"
          :key="department.id"
          :d="department.path"
          :fill="getDepartmentColor(department)"
          :class="getDepartmentClasses(department)"
          @mouseenter="store.setHoveredDepartment(department.id)"
          @click="store.setSelectedDepartment(department.id)"
        />
      </g>
    </svg>

    <ElectionMapTooltip
      v-if="hoveredDepartment"
      :department="hoveredDepartment"
      :position="tooltipPosition"
    />
  </div>
</template>

<script setup lang="ts">
import { useDepartmentsStore } from "@/stores/departments";
import type { DepartmentGeoData } from "@/types/departments";
import ElectionMapTooltip from "./ElectionMapTooltip.vue";

const store = useDepartmentsStore();
const tooltipPosition = ref({ x: 0, y: 0 });

const hoveredDepartment = computed(() => {
  if (!store.hoveredDepartment) return null;
  return store.getDepartmentById(store.hoveredDepartment);
});

// Calculer la couleur du département en fonction du nombre d'électeurs
// const getDepartmentColor = (department: DepartmentGeoData): string => {
//   const electeurs = department.electeurs;
//   if (electeurs > 200000) return "#1d4ed8"; // blue-700
//   if (electeurs > 100000) return "#2563eb"; // blue-600
//   if (electeurs > 50000) return "#3b82f6"; // blue-500
//   return "#60a5fa"; // blue-400
// };
const getDepartmentColor = (department: DepartmentGeoData): string => {
  const randomColor = Math.floor(Math.random() * 16777215).toString(16);
  return `#${randomColor.padStart(6, "0")}`;
};

const getDepartmentClasses = (department: DepartmentGeoData): string => {
  return [
    "transition-colors duration-200",
    "hover:opacity-80",
    "cursor-pointer",
    store.selectedDepartment === department.id
      ? "stroke-2 stroke-black"
      : "stroke-1 stroke-white",
  ].join(" ");
};

// Gérer la position du tooltip
const updateTooltipPosition = (event: MouseEvent) => {
  tooltipPosition.value = {
    x: event.clientX + 10,
    y: event.clientY + 10,
  };
};

onMounted(() => {
  window.addEventListener("mousemove", updateTooltipPosition);
});

onUnmounted(() => {
  window.removeEventListener("mousemove", updateTooltipPosition);
});
</script>
