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
      borderColor: '#3b82f6', // blue-500
      backgroundColor: (context) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 300);
        gradient.addColorStop(0, 'rgba(59, 130, 246, 0.2)');
        gradient.addColorStop(1, 'rgba(59, 130, 246, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#ffffff',
      pointBorderColor: '#3b82f6',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
    },
    {
      label: 'Moyenne Afrique',
      data: props.evolution.map((e) => e.africaAvg),
      borderColor: '#9ca3af', // gray-400
      backgroundColor: 'transparent',
      borderDash: [4, 4],
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 4,
    },
  ],
}));

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false, // We'll render a custom legend if needed or relying on title
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#111827',
      bodyColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: 10,
      boxPadding: 4,
    },
  },
  layout: {
    padding: {
      left: -10,
      right: 0,
    }
  },
  scales: {
    x: {
      grid: {
        display: false,
        drawBorder: false,
      },
      ticks: {
        font: {
          size: 11,
          family: "'Plus Jakarta Sans', sans-serif",
        },
        color: '#6b7280',
        maxRotation: 0,
        autoSkip: true,
        maxTicksLimit: 6,
      }
    },
    y: {
      min: 45,
      max: 62,
      grid: {
        color: '#f3f4f6',
        borderDash: [2, 2],
      },
      border: {
        display: false,
      },
      ticks: {
        stepSize: 5,
        font: {
          size: 10,
        },
        color: '#9ca3af',
        callback: (value) => Math.floor(value as number), // entiers seulement
      },
    },
  },
};
</script>

<template>
  <div class="flex flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/50">
    <div class="mb-2 flex flex-none items-center justify-between">
      <div>
        <h3 class="text-base font-bold text-gray-900 dark:text-white">
          Évolution de la gouvernance globale
        </h3>
        <!-- Custom Legend -->
        <div class="mt-1 flex items-center gap-4 text-xs">
          <div class="flex items-center gap-1.5">
            <span class="h-2.5 w-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100 dark:ring-blue-900"></span>
            <span class="font-medium text-gray-600 dark:text-gray-300">Sénégal</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="h-0.5 w-3 bg-gray-400"></span>
            <span class="text-gray-500 dark:text-gray-400">Moyenne Afrique</span>
          </div>
        </div>
      </div>

      <!-- Current Value Badge -->
      <div v-if="evolution.length" class="text-right">
        <span class="block text-2xl font-bold text-blue-600 dark:text-blue-400">
          {{ evolution[evolution.length - 1].score }}
        </span>
        <span class="text-xs text-gray-400">Score 2023</span>
      </div>
    </div>

    <div class="h-48 w-full sm:h-56">
      <Line :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
