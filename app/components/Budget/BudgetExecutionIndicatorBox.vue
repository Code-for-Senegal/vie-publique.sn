<template>
  <div class="bg-beige-100 rounded-lg p-4">
    <h3 class="mb-2 text-sm font-semibold">{{ title }}</h3>
    <div class="text-2xl font-bold sm:text-3xl">
      {{ formattedValue }} {{ unit }}
    </div>

    <div class="mt-1">Taux d'exécution</div>
    <div class="mt-0 text-2xl font-medium text-green-700">
      {{ executionRate }}%
    </div>
    <div class="mt-0">
      <span class="">sur {{ formattedLfiValue }} {{ unit }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  lfiValue: number;
  realizedValue: number;
  unit: string;
}>();

const formattedValue = computed(() =>
  props.realizedValue.toLocaleString("fr-FR", { maximumFractionDigits: 0 }),
);
const formattedLfiValue = computed(() =>
  props.lfiValue.toLocaleString("fr-FR", { maximumFractionDigits: 0 }),
);
const executionRate = computed(() =>
  ((props.realizedValue / props.lfiValue) * 100).toFixed(2),
);
</script>

<style scoped>
.bg-beige-100 {
  background-color: #efebe9;
}
</style>
