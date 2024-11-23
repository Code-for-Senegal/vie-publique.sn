<template>
  <div class="mb-2">
    <!-- <pre>{{ title }}</pre> -->
    <div class="mb-1 flex justify-between">
      <span class="text-sm font-medium">{{ title }}</span>
      <span class="text-sm font-medium">{{ executionRate }}%</span>
    </div>
    <div class="h-2.5 w-full bg-gray-200">
      <div
        class="h-2.5"
        :class="[color]"
        :style="{ width: `${executionRate}%` }"
      ></div>
    </div>
    <div class="flex justify-end text-xs">
      <!-- <span>Réalisé: {{ formattedRealizedValue }} Mrd</span> -->
      <span
        >{{ formattedRealizedValue }} sur
        {{ formattedLfiValue }} milliards</span
      >
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  title: string;
  lfiValue: number;
  realizedValue: number;
  color: string;
}>();

const executionRate = computed(() =>
  ((props.realizedValue / props.lfiValue) * 100).toFixed(0),
);

const formattedRealizedValue = computed(() =>
  props.realizedValue.toLocaleString("fr-FR", { maximumFractionDigits: 1 }),
);

const formattedLfiValue = computed(() =>
  props.lfiValue.toLocaleString("fr-FR", { maximumFractionDigits: 1 }),
);
</script>
