<!-- components/map/DepartmentTooltip.vue -->
<template>
  <div
    class="absolute z-10 rounded-lg border border-gray-200 bg-white p-2 shadow-lg"
    :style="tooltipStyle"
  >
    <h3 class="text-lg font-bold">{{ department.name }}</h3>
    <p class="text-sm text-gray-600">{{ department.region }}</p>

    <!-- <div class="mt-2 grid grid-cols-2 gap-x-4 text-sm">
      <div>
        <span class="font-medium">Électeurs:</span>
        <span>{{ formatNumber(department.electeurs) }}</span>
      </div>
      <div>
        <span class="font-medium">Bureaux:</span>
        <span>{{ formatNumber(department.bureaux) }}</span>
      </div>
      <div class="col-span-2 mt-1">
        <span class="font-medium">Lieux de vote:</span>
        <span>{{ formatNumber(department.lieux_de_vote) }}</span>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import type { DepartmentGeoData } from "@/types/departments";

const props = defineProps<{
  department: DepartmentGeoData;
  position: { x: number; y: number };
}>();

const tooltipStyle = computed(() => ({
  left: `${props.position.x}px`,
  top: `${props.position.y}px`,
}));

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("fr-FR").format(num);
};
</script>
