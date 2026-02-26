<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import type { CorruptionEvolution } from '~/types/corruption';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

const props = defineProps<{
  evolution: CorruptionEvolution[];
}>();

const chartData = computed(() => ({
  labels: props.evolution.map((e) => String(e.year)),
  datasets: [
    {
      label: 'Sénégal',
      data: props.evolution.map((e) => e.score),
      borderColor: '#ea580c',
      backgroundColor: 'rgba(234, 88, 12, 0.1)',
      fill: true,
      tension: 0.3,
      pointRadius: 4,
      pointHoverRadius: 6,
    },
    {
      label: 'Moyenne Afrique subsaharienne',
      data: props.evolution.map((e) => e.africaAvg),
      borderColor: '#9ca3af',
      backgroundColor: 'rgba(156, 163, 175, 0.1)',
      fill: true,
      borderDash: [5, 5],
      tension: 0.3,
      pointRadius: 3,
      pointHoverRadius: 5,
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
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    y: {
      min: 20,
      max: 60,
      ticks: {
        stepSize: 5,
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
        Évolution de l'Indice de Perception de la Corruption
      </h3>
      <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Score CPI du Sénégal comparé à la moyenne Afrique subsaharienne
      </p>
    </div>
    <div class="p-4 sm:p-6">
      <div class="h-64 sm:h-80">
        <Line :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
