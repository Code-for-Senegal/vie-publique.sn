<script setup lang="ts">
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Doughnut, Bar } from 'vue-chartjs';
import type { Coalition } from '~~/types/coalition';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);

const props = defineProps<{
  results: Coalition[];
  type: string;
}>();

const colorMode = useColorMode();
const isDark = computed(() => colorMode.value === 'dark');

// Vérifier si des données de sièges existent (pour les législatives)
const hasSeatsData = computed(() => {
  return props.results.some(c => (Number(c.sieges) || 0) + (Number(c.sieges_departement) || 0) > 0);
});

// Le composant ne doit pas s'afficher si législatives sans données de sièges
const shouldDisplay = computed(() => {
  if (props.type === 'legislative') return hasSeatsData.value;
  return true;
});

// Palette de couleurs par défaut si coalition.color est absent
const defaultColors = [
  '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  '#06B6D4', '#E11D48', '#A855F7', '#22C55E', '#D946EF',
];

const sortedResults = computed(() => {
  return [...props.results]
    .sort((a, b) => (b.voix || 0) - (a.voix || 0))
    .slice(0, 10);
});

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('fr-FR').format(num);
};

const getName = (item: Coalition) => {
  if (props.type === 'presidential' && item.head_of_list) {
    const firstName = item.head_of_list.first_name || '';
    const lastName = item.head_of_list.last_name || '';
    return `${firstName} ${lastName}`.trim() || item.name;
  }
  return item.name;
};

const getShortName = (item: Coalition) => {
  const name = getName(item);
  return name.length > 20 ? name.substring(0, 18) + '…' : name;
};

const chartColors = computed(() =>
  sortedResults.value.map((item, i) => item.color || defaultColors[i % defaultColors.length])
);

// --- DONUT CHART (Présidentielle) ---
const doughnutData = computed(() => ({
  labels: sortedResults.value.map(item => getName(item)),
  datasets: [{
    data: sortedResults.value.map(item => item.pourcentage || 0),
    backgroundColor: chartColors.value,
    borderColor: isDark.value ? '#111827' : '#ffffff',
    borderWidth: 3,
    hoverBorderWidth: 0,
    hoverOffset: 8,
  }],
}));

const doughnutOptions = computed((): any => ({
  responsive: true,
  maintainAspectRatio: false,
  cutout: 0,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        color: isDark.value ? '#d1d5db' : '#374151',
        font: { size: 11, weight: 'bold' as const },
        padding: 12,
        usePointStyle: true,
        pointStyle: 'circle',
        boxWidth: 8,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
      titleColor: isDark.value ? '#f3f4f6' : '#111827',
      bodyColor: isDark.value ? '#d1d5db' : '#374151',
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        label: (context: any) => {
          const item = sortedResults.value[context.dataIndex];
          return ` ${context.label}: ${context.parsed}% (${formatNumber(item?.voix || 0)} voix)`;
        },
      },
    },
    datalabels: {
      color: '#ffffff',
      font: { size: 11, weight: 'bold' as const },
      formatter: (value: number) => {
        return value >= 3 ? `${value}%` : '';
      },
      anchor: 'center' as const,
      align: 'center' as const,
      textShadowColor: 'rgba(0,0,0,0.4)',
      textShadowBlur: 4,
    },
  },
}));

// --- BAR CHART (Législatives) — Barres verticales, sièges ---
const getTotalSieges = (item: Coalition) => {
  const national = Number(item.sieges) || 0;
  const dept = Number(item.sieges_departement) || 0;
  return national + dept;
};

const sortedBySeats = computed(() => {
  return [...props.results]
    .sort((a, b) => getTotalSieges(b) - getTotalSieges(a))
    .filter(item => getTotalSieges(item) > 0)
    .slice(0, 12);
});

const barChartColors = computed(() =>
  sortedBySeats.value.map((item, i) => item.color || defaultColors[i % defaultColors.length])
);

const barData = computed(() => ({
  labels: sortedBySeats.value.map(item => item.acronym || getShortName(item)),
  datasets: [{
    label: 'Sièges obtenus',
    data: sortedBySeats.value.map(item => getTotalSieges(item)),
    backgroundColor: barChartColors.value.map(c => c + 'CC'),
    borderColor: barChartColors.value,
    borderWidth: 1.5,
    borderRadius: 6,
    borderSkipped: false,
    barPercentage: 0.8,
    categoryPercentage: 0.85,
  }],
}));

const barOptions = computed((): any => ({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    datalabels: {
      display: false,
    },
    legend: {
      display: true,
      position: 'top' as const,
      labels: {
        color: isDark.value ? '#d1d5db' : '#374151',
        font: { size: 12, weight: 'bold' as const },
        usePointStyle: true,
        pointStyle: 'rectRounded',
        padding: 16,
      },
    },
    tooltip: {
      backgroundColor: isDark.value ? '#1f2937' : '#ffffff',
      titleColor: isDark.value ? '#f3f4f6' : '#111827',
      bodyColor: isDark.value ? '#d1d5db' : '#374151',
      borderColor: isDark.value ? '#374151' : '#e5e7eb',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      callbacks: {
        title: (items: any[]) => {
          const idx = items[0]?.dataIndex;
          return getName(sortedBySeats.value[idx]);
        },
        label: (context: any) => {
          const item = sortedBySeats.value[context.dataIndex];
          return [
            ` Sièges: ${getTotalSieges(item)}`,
            ` Voix: ${formatNumber(item?.voix || 0)} (${item?.pourcentage || 0}%)`,
          ];
        },
      },
    },
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 165,
      grid: {
        color: isDark.value ? '#374151' : '#f3f4f6',
      },
      ticks: {
        color: isDark.value ? '#9ca3af' : '#6b7280',
        font: { size: 11 },
        stepSize: 15,
        precision: 0,
        callback: (value: any) => {
          if (value === 165) return '165 (total)';
          return value;
        },
      },
      title: {
        display: true,
        text: 'Nombre de sièges',
        color: isDark.value ? '#9ca3af' : '#6b7280',
        font: { size: 12, weight: 'bold' as const },
      },
      border: { display: false },
    },
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: isDark.value ? '#d1d5db' : '#374151',
        font: { size: 10, weight: 'bold' as const },
        maxRotation: 45,
        minRotation: 0,
      },
      border: { display: false },
    },
  },
}));
</script>

<template>
  <div v-if="shouldDisplay" class="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm overflow-hidden">
    <!-- Header -->
    <div class="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
      <div>
        <h3 class="font-bold text-gray-900 dark:text-white text-sm sm:text-base">
          {{ type === 'presidential' ? 'Répartition des voix par candidat' : 'Répartition des sièges par coalition' }}
        </h3>
      </div>
    </div>

    <!-- Chart -->
    <div class="p-4 sm:p-6">
      <ClientOnly>
        <!-- DONUT: Présidentielle -->
        <div v-if="type === 'presidential'" class="flex justify-center">
          <div class="w-full max-w-md" style="height: 360px;">
            <Doughnut
              :key="`donut-${isDark}`"
              :data="doughnutData"
              :options="doughnutOptions"
            />
          </div>
        </div>

        <!-- BAR VERTICAL: Législatives -->
        <div v-else-if="type === 'legislative'">
          <div class="w-full" style="height: 400px;">
            <Bar
              :key="`bar-${isDark}`"
              :data="barData"
              :options="barOptions"
            />
          </div>
        </div>

        <template #fallback>
          <div class="flex items-center justify-center h-64">
            <div class="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-primary-600"></div>
          </div>
        </template>
      </ClientOnly>
    </div>

    <!-- Footer légende résumée -->
    <div v-if="results.length > 10" class="px-5 py-3 border-t border-gray-100 dark:border-gray-800 text-center">
      <span class="text-xs text-gray-400 italic">+ {{ results.length - 10 }} autres listes non affichées</span>
    </div>
  </div>
</template>
