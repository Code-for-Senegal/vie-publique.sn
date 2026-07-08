<script setup lang="ts">
import type { PublicProjectStats, PublicProjectMode } from '~~/types/public-project';

interface Props {
  stats: PublicProjectStats;
  year?: number;
  mode?: PublicProjectMode;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'global',
});

const formatAmount = (value: number | null): { num: string; unit: string } => {
  if (value === null || value === undefined) return { num: '—', unit: '' };
  if (value >= 1_000_000_000) {
    return { num: (value / 1_000_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }), unit: 'Mds' };
  }
  if (value >= 1_000_000) {
    return { num: (value / 1_000_000).toLocaleString('fr-FR', { maximumFractionDigits: 1 }), unit: 'M' };
  }
  return { num: value.toLocaleString('fr-FR'), unit: '' };
};

// ─── Styles réutilisables ────────────────────────────────────────────
const bottomClass = 'bg-gray-50/50 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
const darkBlue = 'bg-slate-800 text-white dark:bg-slate-900';
const yellow = 'bg-[#fbee81] text-amber-900 dark:bg-yellow-600/20 dark:text-yellow-400';
const lightBlue = 'bg-[#9de1fb] text-sky-900 dark:bg-sky-600/20 dark:text-sky-400';
const teal = 'bg-teal-100 text-teal-900 dark:bg-teal-900/40 dark:text-teal-400';
const emerald = 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-400';

// ─── KPI adaptatifs selon le mode ────────────────────────────────────
const kpis = computed(() => {
  if (props.mode === 'pres') {
    return [
      { label: 'Projets PRES', value: props.stats.totalPres, topClass: yellow, bottomClass },
      { label: 'Ministères', value: props.stats.totalMinistries, topClass: lightBlue, bottomClass },
      { label: props.year ? `Total AE ${props.year}` : 'Total AE', value: formatAmount(props.stats.totalAE), topClass: darkBlue, bottomClass, isAmount: true },
      { label: props.year ? `Total CP ${props.year}` : 'Total CP', value: formatAmount(props.stats.totalCP), topClass: lightBlue, bottomClass, isAmount: true },
    ];
  }

  if (props.mode === 'pip') {
    return [
      { label: 'Total projets', value: props.stats.totalProjects, topClass: darkBlue, bottomClass },
      { label: 'Budget total', value: formatAmount(props.stats.totalBudget), topClass: emerald, bottomClass, isAmount: true },
      { label: 'Ministères', value: props.stats.totalMinistries, topClass: lightBlue, bottomClass },
      { label: 'Secteurs', value: props.stats.totalSectors, topClass: teal, bottomClass },
    ];
  }

  // Global : 6 KPI
  return [
    { label: 'Total projets', value: props.stats.totalProjects, topClass: darkBlue, bottomClass },
    { label: 'Projets PRES', value: props.stats.totalPres, topClass: yellow, bottomClass },
    { label: 'Ministères', value: props.stats.totalMinistries, topClass: lightBlue, bottomClass },
    { label: 'Secteurs', value: props.stats.totalSectors, topClass: teal, bottomClass },
    { label: props.year ? `Total AE ${props.year}` : 'Total AE', value: formatAmount(props.stats.totalAE), topClass: darkBlue, bottomClass, isAmount: true },
    { label: props.year ? `Total CP ${props.year}` : 'Total CP', value: formatAmount(props.stats.totalCP), topClass: lightBlue, bottomClass, isAmount: true },
  ];
});

const gridClass = computed(() =>
  props.mode === 'global'
    ? 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 sm:gap-4'
    : 'grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4',
);
</script>

<template>
  <div :class="gridClass">
    <div
      v-for="kpi in kpis"
      :key="kpi.label"
      class="flex flex-col border border-gray-100 bg-white shadow-sm dark:border-white/5 dark:bg-gray-900/50"
    >
      <div
        class="flex flex-col items-center justify-center p-2 sm:p-3 text-center"
        :class="kpi.topClass"
      >
        <div v-if="kpi.isAmount" class="flex items-start justify-center gap-0.5">
          <span class="text-[22px] sm:text-[28px] font-semibold tracking-tight">{{ kpi.value.num }}</span>
          <span v-if="kpi.value.unit" class="text-[10px] sm:text-sm font-medium tracking-wide opacity-80 pt-0.5">{{ kpi.value.unit }}</span>
        </div>
        <span v-else class="text-[22px] sm:text-[28px] font-semibold tracking-tight">
          {{ kpi.value.toLocaleString('fr-FR') }}
        </span>
        <span
          v-if="stats.versionLabel && kpi.isAmount"
          class="mt-1 text-[10px] opacity-75 font-medium uppercase tracking-widest"
        >
          {{ stats.versionLabel }}
        </span>
      </div>
      <div
        class="flex flex-1 items-center justify-center p-2 sm:p-3 text-center border-t border-white/50 dark:border-white/5"
        :class="kpi.bottomClass"
      >
        <span class="text-[10px] sm:text-xs font-medium text-gray-600 dark:text-gray-400 line-clamp-1">
          {{ kpi.label }}
        </span>
      </div>
    </div>
  </div>
</template>
