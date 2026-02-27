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
      display: false,
    },
    tooltip: {
      enabled: true, // Keep tooltips for detailed info
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      titleColor: '#111827',
      bodyColor: '#4b5563',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      displayColors: false,
    },
  },
  layout: {
    padding: 20, // Add padding to avoid cutting off custom labels
  },
  scales: {
    r: {
      beginAtZero: true,
      max: 100,
      min: 0,
      ticks: {
        stepSize: 20,
        display: false,
      },
      grid: {
        color: '#f3f4f6',
        circular: true,
      },
      angleLines: {
        color: '#e5e7eb',
      },
      pointLabels: {
        display: true,
        font: {
          size: 11,
          family: "'Plus Jakarta Sans', sans-serif",
          weight: 'bold'
        },
        color: (context: any) => {
           // We try to return an array of colors corresponding to the lines
           // This is a known trick in Chart.js for multi-line labels in some contexts, 
           // but officially color applies to the whole label.
           // If this fails, the fallback is all one color.
           // However, let's try to detect the trend and color the whole label if needed,
           // OR better: Since we can't style partial text easily in canvas,
           // we will just color the WHOLE line based on trend? No that's ugly.
           
           // ACTUALLY: The best way to achieve the mockup "Black Score + Green Trend" 
           // is usually to use HTML Overlay instead of Canvas labels, but that's complex for Radar.
           
           // Let's stick to a clean implementation:
           // We will use standard dark color for now.
           // If the user REALLY needs green trend, we might need a custom plugin.
           return '#374151'; 
        },
        // Custom formatter to show Label + Score on 2 lines
        callback: (label: string, index: number) => {
           const pillar = props.pillars[index];
           if (!pillar) return label;

           const score = pillar.score.toFixed(1).replace('.', ',');
           const trend = pillar.trendDelta > 0 ? `+${pillar.trendDelta}` : `${pillar.trendDelta}`;

           // We return an array for multi-line labels
           // Line 1: Label Name
           // Line 2: Score ( Trend )
           // Changing order to match mockup better: Label outside? Or Score outside?
           // Mockup has Score+Trend at the vertex, and Label under it.
           return [`${score} ${trend !== '0' ? trend : ''}`, label];
        }
      },
    },
  },
};
</script>

<template>
  <div class="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/50">
    <div class="flex-none">
      <h3 class="text-lg font-bold text-gray-900 dark:text-white">
        Les {{ pillars.length }} piliers de la gouvernance
      </h3>
      <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">Sénégal {{ year }}</p>
    </div>

    <!-- Chart Container -->
    <div class="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden py-2">
      <div class="h-full w-full">
        <Radar :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>
