<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

interface RegionItem {
  region: string;
  tauxChomage: number;
}

const props = defineProps<{
  data: RegionItem[];
  title?: string;
}>();

const sorted = computed(() => [...props.data].sort((a, b) => b.tauxChomage - a.tauxChomage));

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');

const getBarColor = (value: number): string => {
  if (value >= 25) return '#ef4444';
  if (value >= 20) return '#f97316';
  if (value >= 15) return '#eab308';
  return '#22c55e';
};

const chartData = computed(() => ({
  labels: sorted.value.map((d) => d.region),
  datasets: [
    {
      label: 'Taux de chômage (%)',
      data: sorted.value.map((d) => d.tauxChomage),
      backgroundColor: sorted.value.map((d) => getBarColor(d.tauxChomage)),
      borderRadius: 3,
      barThickness: 14,
    },
  ],
}));

const chartOptions = computed(() => ({
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    datalabels: {
      anchor: 'end' as const,
      align: 'end' as const,
      color: isDark.value ? '#94a3b8' : '#6b7280',
      font: { size: 9, weight: 'bold' as const },
      formatter: (value: number) => `${value}%`,
    },
    tooltip: {
      backgroundColor: isDark.value ? '#1e293b' : 'rgba(255,255,255,0.95)',
      titleColor: isDark.value ? '#f1f5f9' : '#111827',
      bodyColor: isDark.value ? '#94a3b8' : '#4b5563',
      borderColor: isDark.value ? '#334155' : '#e5e7eb',
      borderWidth: 1,
      padding: 10,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => ` Chômage : ${context.parsed.x}%`,
      },
    },
  },
  scales: {
    x: {
      grid: { color: isDark.value ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 0, 0, 0.04)' },
      border: { display: false },
      ticks: {
        font: { size: 10 },
        color: isDark.value ? '#475569' : '#6b7280',
        callback: (value: any) => `${value}%`,
      },
      max: 35,
    },
    y: {
      grid: { display: false },
      border: { display: false },
      ticks: {
        font: { size: 10, weight: 'bold' as const },
        color: isDark.value ? '#94a3b8' : '#6b7280',
        crossAlign: 'far' as const,
      },
    },
  },
}));
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700/50 dark:bg-gray-900/80 sm:p-4">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
        {{ title || 'Taux de chômage par région' }}
      </h3>
      <div class="flex items-center gap-2 text-[9px]">
        <span class="flex items-center gap-0.5">
          <span class="h-1.5 w-1.5 rounded-sm bg-green-500" />
          <span class="text-gray-500">&lt;15%</span>
        </span>
        <span class="flex items-center gap-0.5">
          <span class="h-1.5 w-1.5 rounded-sm bg-yellow-500" />
          <span class="text-gray-500">15-20%</span>
        </span>
        <span class="flex items-center gap-0.5">
          <span class="h-1.5 w-1.5 rounded-sm bg-orange-500" />
          <span class="text-gray-500">20-25%</span>
        </span>
        <span class="flex items-center gap-0.5">
          <span class="h-1.5 w-1.5 rounded-sm bg-red-500" />
          <span class="text-gray-500">&ge;25%</span>
        </span>
      </div>
    </div>
    <div class="h-52 sm:h-64">
      <Bar :key="`${data.length}-${isDark}`" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
