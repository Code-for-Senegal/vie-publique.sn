<script setup lang="ts">
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale, Tooltip } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import type { PublicProject } from '~~/types/public-project';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, ChartDataLabels);

interface Props {
  projects: PublicProject[];
}

const props = defineProps<Props>();

const chartData = computed(() => {
  // Grouper par entité ministère (via la relation ministry)
  const ministryMap = new Map<number, { name: string; count: number }>();

  for (const project of props.projects) {
    if (!project.ministry) continue;
    const existing = ministryMap.get(project.ministry.id);
    if (existing) {
      existing.count++;
    } else {
      ministryMap.set(project.ministry.id, { name: project.ministry.name, count: 1 });
    }
  }

  // Trier par count décroissant, top 5
  const sorted = Array.from(ministryMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Tronquer les labels longs
  const labels = sorted.map((m) => (m.name.length > 35 ? m.name.substring(0, 32) + '...' : m.name));
  const data = sorted.map((m) => m.count);

  return {
    labels,
    datasets: [
      {
        label: 'Nombre de projets',
        data,
        backgroundColor: '#3B82F6',
        borderRadius: 4,
        barThickness: 20,
      },
    ],
  };
});

const chartOptions = {
  indexAxis: 'y' as const,
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (context: any) => ` ${context.parsed.x} projet${context.parsed.x > 1 ? 's' : ''}`,
      },
    },
    datalabels: {
      anchor: 'end' as const,
      align: 'end' as const,
      color: '#6B7280',
      font: { size: 11, weight: 'bold' as const },
      formatter: (value: number) => value,
    },
  },
  scales: {
    x: {
      beginAtZero: true,
      ticks: { precision: 0, font: { size: 11 } },
      grid: { display: false },
    },
    y: {
      ticks: { font: { size: 11 } },
      grid: { display: false },
    },
  },
};
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">Top 5 ministères</h3>
    <div v-if="projects.length > 0" class="h-[250px]">
      <Bar :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="py-8 text-center text-sm text-gray-400">Aucune donnée</p>
  </div>
</template>
