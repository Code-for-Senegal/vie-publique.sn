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

interface EvolutionItem {
  annee: number;
  pib: number;
  croissance: number;
}

const props = defineProps<{
  data: EvolutionItem[];
}>();

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');

const chartData = computed(() => ({
  labels: props.data.map((d) => String(d.annee)),
  datasets: [
    {
      label: 'PIB (Mds FCFA)',
      data: props.data.map((d) => d.pib),
      borderColor: '#38bdf8',
      backgroundColor: (context: any) => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 280);
        gradient.addColorStop(0, 'rgba(56, 189, 248, 0.3)');
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');
        return gradient;
      },
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: isDark.value ? '#0f172a' : '#ffffff',
      pointBorderColor: '#38bdf8',
      pointBorderWidth: 2,
      pointHoverRadius: 6,
      yAxisID: 'y',
      borderWidth: 2,
    },
    {
      label: 'Croissance (%)',
      data: props.data.map((d) => d.croissance),
      borderColor: '#34d399',
      backgroundColor: 'transparent',
      borderDash: [6, 4],
      tension: 0.4,
      pointRadius: 3,
      pointBackgroundColor: isDark.value ? '#0f172a' : '#ffffff',
      pointBorderColor: '#34d399',
      pointBorderWidth: 2,
      yAxisID: 'y1',
      borderWidth: 2,
    },
  ],
}));

const chartOptions = computed(() => ({
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    mode: 'index' as const,
    intersect: false,
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      backgroundColor: isDark.value ? '#1e293b' : 'rgba(255,255,255,0.95)',
      titleColor: isDark.value ? '#f1f5f9' : '#111827',
      bodyColor: isDark.value ? '#94a3b8' : '#4b5563',
      borderColor: isDark.value ? '#334155' : '#e5e7eb',
      borderWidth: 1,
      padding: 8,
      boxPadding: 3,
      cornerRadius: 8,
      callbacks: {
        label: (context: any) => {
          if (context.datasetIndex === 0) {
            return ` PIB : ${new Intl.NumberFormat('fr-FR').format(context.parsed.y)} Mds FCFA`;
          }
          return ` Croissance : ${context.parsed.y}%`;
        },
      },
    },
  },
  scales: {
    x: {
      grid: { color: isDark.value ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 0, 0, 0.04)' },
      ticks: {
        font: { size: 10, weight: 'bold' as const },
        color: isDark.value ? '#64748b' : '#6b7280',
      },
      border: { display: false },
    },
    y: {
      position: 'left' as const,
      grid: { color: isDark.value ? 'rgba(148, 163, 184, 0.08)' : 'rgba(0, 0, 0, 0.04)' },
      border: { display: false },
      ticks: {
        font: { size: 10 },
        color: isDark.value ? '#64748b' : '#6b7280',
        callback: (value: any) => `${new Intl.NumberFormat('fr-FR').format(value)}`,
      },
    },
    y1: {
      position: 'right' as const,
      grid: { drawOnChartArea: false },
      border: { display: false },
      ticks: {
        font: { size: 10 },
        color: '#34d399',
        callback: (value: any) => `${value}%`,
      },
    },
  },
}));
</script>

<template>
  <div class="rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700/50 dark:bg-gray-900/80 sm:p-4">
    <div class="mb-2 flex items-center justify-between">
      <h3 class="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
        Évolution du PIB national
      </h3>
      <div class="flex items-center gap-4 text-[10px]">
        <div class="flex items-center gap-1">
          <span class="h-2 w-2 rounded-full bg-sky-400" />
          <span class="font-medium text-gray-500 dark:text-gray-400">PIB</span>
        </div>
        <div class="flex items-center gap-1">
          <span class="h-0.5 w-3 border-t-2 border-dashed border-emerald-400" />
          <span class="font-medium text-gray-500 dark:text-gray-400">Croissance</span>
        </div>
      </div>
    </div>
    <div class="h-52 sm:h-64">
      <Line :key="`${data.length}-${isDark}`" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>
