<script setup lang="ts">
import { Radar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import type { CorruptionPillar } from '~/types/corruption';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const props = defineProps<{
  pillars: CorruptionPillar[];
  year: number;
}>();

const chartData = computed(() => ({
  labels: props.pillars.map((p) => p.label),
  datasets: [
    {
      label: `Sénégal ${props.year}`,
      data: props.pillars.map((p) => p.score),
      backgroundColor: 'rgba(59, 130, 246, 0.15)',
      borderColor: '#3b82f6',
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#3b82f6',
      borderWidth: 2,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom' as const,
    },
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      ticks: {
        stepSize: 20,
        display: false,
      },
      grid: {
        color: 'rgba(0, 0, 0, 0.06)',
      },
      pointLabels: {
        font: { size: 11 },
      },
    },
  },
};
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50"
  >
    <div class="border-b border-gray-200 p-4 dark:border-gray-700 sm:p-6">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
        Les {{ pillars.length }} piliers de la gouvernance
      </h3>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">Scores IIAG Mo Ibrahim {{ year }}</p>
    </div>
    <div class="p-4 sm:p-6">
      <!-- Radar chart -->
      <div class="mx-auto h-64 max-w-sm sm:h-72">
        <Radar :data="chartData" :options="chartOptions" />
      </div>

      <!-- Pillar scores around chart (maquette style) -->
      <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <div
          v-for="pillar in pillars"
          :key="pillar.key"
          class="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800"
        >
          <p class="text-2xl font-extrabold text-gray-900 dark:text-white">
            {{ pillar.score.toFixed(1).replace('.', ',') }}
          </p>
          <div
            v-if="pillar.trendDelta !== 0"
            class="mt-0.5 text-xs font-medium"
            :class="pillar.trendDelta > 0 ? 'text-green-600' : 'text-red-500'"
          >
            {{ pillar.trendDelta > 0 ? '+' : ''
            }}{{ pillar.trendDelta.toFixed(1).replace('.', ',') }}
          </div>
          <p class="mt-1 text-xs font-medium text-gray-600 dark:text-gray-400">
            {{ pillar.label }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
