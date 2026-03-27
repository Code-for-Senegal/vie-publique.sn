<script setup lang="ts">
import { Doughnut } from 'vue-chartjs';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import type { PublicProject } from '~~/types/public-project';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
  projects: PublicProject[];
}

const props = defineProps<Props>();

// Couleurs par défaut si le secteur n'a pas de couleur
const defaultColors = [
  '#3B82F6',
  '#10B981',
  '#F59E0B',
  '#EF4444',
  '#8B5CF6',
  '#EC4899',
  '#06B6D4',
  '#84CC16',
  '#F97316',
  '#6366F1',
];

const chartData = computed(() => {
  // Grouper par entité secteur (via la relation sector)
  const sectorMap = new Map<number, { name: string; count: number; color: string | null }>();

  for (const project of props.projects) {
    if (!project.sector) continue;
    const existing = sectorMap.get(project.sector.id);
    if (existing) {
      existing.count++;
    } else {
      sectorMap.set(project.sector.id, {
        name: project.sector.name,
        count: 1,
        color: project.sector.color || null,
      });
    }
  }

  // Trier par count décroissant
  const sorted = Array.from(sectorMap.values()).sort((a, b) => b.count - a.count);

  const labels = sorted.map((s) => s.name);
  const data = sorted.map((s) => s.count);
  const backgroundColor = sorted.map(
    (s, i) => s.color || defaultColors[i % defaultColors.length],
  );

  return {
    labels,
    datasets: [
      {
        data,
        backgroundColor,
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right' as const,
      labels: {
        boxWidth: 12,
        padding: 8,
        font: { size: 11 },
      },
    },
    tooltip: {
      callbacks: {
        label: (context: any) => {
          const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
          const value = context.parsed;
          const pct = ((value / total) * 100).toFixed(1);
          return ` ${context.label}: ${value} projet${value > 1 ? 's' : ''} (${pct}%)`;
        },
      },
    },
  },
};
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-white">
      Répartition par secteur
    </h3>
    <div v-if="projects.length > 0" class="h-[250px]">
      <Doughnut :data="chartData" :options="chartOptions" />
    </div>
    <p v-else class="py-8 text-center text-sm text-gray-400">Aucune donnée</p>
  </div>
</template>
