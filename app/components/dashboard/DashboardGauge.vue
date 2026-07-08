<script setup lang="ts">
interface GaugeMetric {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}

const props = withDefaults(
  defineProps<{
    metrics: GaugeMetric[];
    regionCount?: number;
    totalRegions?: number;
  }>(),
  { regionCount: 0, totalRegions: 14 },
);

const cx = 100;
const cy = 105;
const strokeWidth = 8;
const gap = 12; // espacement entre arcs
const baseRadius = 80;

// Chaque arc : rayon décroissant, 270° (3/4 cercle)
function arcData(index: number) {
  const r = baseRadius - index * (strokeWidth + gap);
  const circ = 2 * Math.PI * r;
  const arc = circ * 0.75;
  const metric = props.metrics[index];
  const progress = metric ? Math.min(metric.value / metric.max, 1) : 0;
  return { r, circ, arc, offset: arc * (1 - progress) };
}
</script>

<template>
  <div
    class="flex h-full flex-col items-center justify-between rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700/50 dark:bg-gray-900/80"
  >
    <h3 class="mb-1 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">Indicateurs</h3>

    <!-- SVG arcs concentriques -->
    <div class="relative flex-1 flex items-center">
      <svg width="160" height="136" viewBox="0 0 200 170">
        <template v-for="(metric, i) in metrics" :key="metric.label">
          <!-- Fond -->
          <circle
            :cx="cx"
            :cy="cy"
            :r="arcData(i).r"
            fill="none"
            :stroke-width="strokeWidth"
            class="stroke-black/[0.06] dark:stroke-white/[0.06]"
            :stroke-dasharray="`${arcData(i).arc} ${arcData(i).circ}`"
            stroke-linecap="round"
            :transform="`rotate(135 ${cx} ${cy})`"
          />
          <!-- Progression -->
          <circle
            :cx="cx"
            :cy="cy"
            :r="arcData(i).r"
            fill="none"
            :stroke-width="strokeWidth"
            :stroke="metric.color"
            :stroke-dasharray="`${arcData(i).arc} ${arcData(i).circ}`"
            :stroke-dashoffset="arcData(i).offset"
            stroke-linecap="round"
            :transform="`rotate(135 ${cx} ${cy})`"
            class="transition-all duration-700 ease-out"
          />
        </template>
      </svg>
    </div>

    <!-- Légende avec valeurs -->
    <div class="mt-1 w-full space-y-1">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="flex items-center justify-between gap-1.5"
      >
        <div class="flex items-center gap-1.5 min-w-0">
          <span class="h-2 w-2 flex-shrink-0 rounded-full" :style="{ backgroundColor: metric.color }" />
          <span class="truncate text-[10px] text-gray-500 dark:text-gray-400">{{ metric.label }}</span>
        </div>
        <span class="whitespace-nowrap text-[10px] font-bold tabular-nums text-gray-800 dark:text-gray-200">
          {{ typeof metric.value === 'number' ? metric.value.toFixed(1) : metric.value }}{{ metric.unit }}
        </span>
      </div>
    </div>

    <!-- Sous-texte -->
    <p v-if="regionCount" class="mt-1.5 text-center text-[9px] text-gray-400 dark:text-gray-600">
      Sur {{ regionCount }} / {{ totalRegions }} régions
    </p>
  </div>
</template>
