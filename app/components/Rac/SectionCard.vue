<script setup lang="ts">
interface Metric {
  id: string;
  label: string;
  unit: string;
  value_2023: number | null;
  value_2024: number | null;
  delta: number | null;
  delta_unit: string | null;
  trend: string | null;
}

interface Section {
  id: string;
  title: string;
  group: string;
  source_ministry: string;
  metrics: Metric[];
  facts: string[];
  challenges: string[];
}

interface Props {
  section: Section;
  /** Nombre max de métriques affichées (défaut: 3) */
  maxMetrics?: number;
  /** Couleur du groupe (amber, emerald, sky, rose, violet) */
  color?: string;
  /** Icône du groupe */
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxMetrics: 3,
  color: 'sky',
  icon: 'i-heroicons-chart-bar-20-solid',
});

// Ne garder que les métriques avec des données 2024
const visibleMetrics = computed(() =>
  props.section.metrics.filter((m) => m.value_2024 !== null).slice(0, props.maxMetrics),
);

// Classes dynamiques selon la couleur
const colorClasses = computed(() => {
  const map: Record<
    string,
    { border: string; bg: string; icon: string; badge: string; accent: string }
  > = {
    amber: {
      border: 'border-amber-300 dark:border-amber-700/50',
      bg: 'bg-amber-50/60 dark:bg-amber-950/20',
      icon: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
      badge: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      accent: 'text-amber-600 dark:text-amber-400',
    },
    emerald: {
      border: 'border-emerald-300 dark:border-emerald-700/50',
      bg: 'bg-emerald-50/60 dark:bg-emerald-950/20',
      icon: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    sky: {
      border: 'border-sky-300 dark:border-sky-700/50',
      bg: 'bg-sky-50/60 dark:bg-sky-950/20',
      icon: 'bg-sky-100 text-sky-600 dark:bg-sky-900/40 dark:text-sky-400',
      badge: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
      accent: 'text-sky-600 dark:text-sky-400',
    },
    rose: {
      border: 'border-rose-300 dark:border-rose-700/50',
      bg: 'bg-rose-50/60 dark:bg-rose-950/20',
      icon: 'bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-400',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
      accent: 'text-rose-600 dark:text-rose-400',
    },
    violet: {
      border: 'border-violet-300 dark:border-violet-700/50',
      bg: 'bg-violet-50/60 dark:bg-violet-950/20',
      icon: 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-400',
      badge: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
      accent: 'text-violet-600 dark:text-violet-400',
    },
  };
  return map[props.color] ?? map.sky;
});

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
}

function trendIcon(trend: string | null): string {
  if (trend === 'up' || trend === 'improving') return 'i-heroicons-arrow-trending-up-20-solid';
  if (trend === 'down') return 'i-heroicons-arrow-trending-down-20-solid';
  return 'i-heroicons-minus-20-solid';
}

function trendColor(trend: string | null): string {
  if (trend === 'up' || trend === 'improving') return 'text-emerald-600 dark:text-emerald-400';
  if (trend === 'down') return 'text-red-500 dark:text-red-400';
  return 'text-gray-400 dark:text-gray-500';
}
</script>

<template>
  <div :class="['overflow-hidden rounded-2xl border-2 p-5', colorClasses.border, colorClasses.bg]">
    <!-- Header : icône + titre -->
    <div class="mb-4 flex items-center gap-3">
      <div :class="['flex h-10 w-10 items-center justify-center rounded-xl', colorClasses.icon]">
        <UIcon :name="icon" class="h-5 w-5" />
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          {{ section.title }}
        </h3>
        <span
          v-if="section.source_ministry"
          :class="[
            'inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold',
            colorClasses.badge,
          ]"
        >
          {{ section.source_ministry }}
        </span>
      </div>
    </div>

    <!-- Métriques clés : gros chiffres -->
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <div
        v-for="metric in visibleMetrics"
        :key="metric.id"
        class="rounded-xl bg-white/70 px-4 py-3 dark:bg-gray-900/50"
      >
        <p class="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">
          {{ metric.label }}
        </p>
        <div class="flex items-baseline gap-2">
          <span class="text-2xl font-extrabold tabular-nums text-gray-900 dark:text-white">
            {{ formatNumber(metric.value_2024) }}
          </span>
          <span class="text-sm text-gray-400">{{ metric.unit }}</span>
        </div>
        <div v-if="metric.trend" class="mt-1 flex items-center gap-1">
          <UIcon :name="trendIcon(metric.trend)" :class="['h-4 w-4', trendColor(metric.trend)]" />
          <span :class="['text-xs font-semibold', trendColor(metric.trend)]">
            {{ metric.delta !== null ? (metric.delta > 0 ? '+' : '') + metric.delta : '' }}
            {{ metric.delta_unit === 'pdp' ? 'pts' : (metric.delta_unit ?? '') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Premier défi (résumé) -->
    <div v-if="section.challenges.length" class="mt-4">
      <p class="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
        <UIcon
          name="i-heroicons-exclamation-triangle-20-solid"
          class="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-500"
        />
        {{ section.challenges[0] }}
      </p>
    </div>
  </div>
</template>
