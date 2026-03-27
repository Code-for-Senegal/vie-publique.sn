<script setup lang="ts">
import type { PublicProjectStats } from '~~/types/public-project';

interface Props {
  stats: PublicProjectStats;
  year?: number;
}

const props = defineProps<Props>();

const formatAmount = (value: number | null): string => {
  if (value === null || value === undefined) return 'Non documenté';
  // Convertir en milliards si > 1 000 000 000
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} Mds`;
  }
  // Convertir en millions si > 1 000 000
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} M`;
  }
  return value.toLocaleString('fr-FR');
};

const kpis = computed(() => [
  {
    label: 'Total projets',
    value: props.stats.totalProjects,
    icon: 'i-heroicons-clipboard-document-list',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/20',
  },
  {
    label: 'Projets PRES',
    value: props.stats.totalPres,
    icon: 'i-heroicons-star',
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/20',
  },
  {
    label: 'Ministères',
    value: props.stats.totalMinistries,
    icon: 'i-heroicons-building-office-2',
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-900/20',
  },
  {
    label: 'Secteurs',
    value: props.stats.totalSectors,
    icon: 'i-heroicons-squares-2x2',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
  },
  {
    label: props.year ? `Total AE ${props.year}` : 'Total AE',
    value: formatAmount(props.stats.totalAE),
    icon: 'i-heroicons-banknotes',
    color: 'text-cyan-600 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-900/20',
    isAmount: true,
  },
  {
    label: props.year ? `Total CP ${props.year}` : 'Total CP',
    value: formatAmount(props.stats.totalCP),
    icon: 'i-heroicons-currency-dollar',
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/20',
    isAmount: true,
  },
]);
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
    <div
      v-for="kpi in kpis"
      :key="kpi.label"
      class="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-700 dark:bg-gray-800"
    >
      <div class="flex items-center gap-2">
        <div
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
          :class="kpi.bgColor"
        >
          <UIcon :name="kpi.icon" class="h-4 w-4" :class="kpi.color" />
        </div>
        <p class="text-xs text-gray-500 dark:text-gray-400">{{ kpi.label }}</p>
      </div>
      <p class="mt-2 text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
        {{ kpi.isAmount ? kpi.value : kpi.value.toLocaleString('fr-FR') }}
      </p>
      <p
        v-if="stats.versionLabel && kpi.isAmount"
        class="text-[10px] text-gray-400 dark:text-gray-500"
      >
        {{ stats.versionLabel }}
      </p>
    </div>
  </div>
</template>
