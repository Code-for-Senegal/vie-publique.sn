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
  /** Nombre max de métriques affichées (défaut: 2) */
  maxMetrics?: number;
  /** Couleur du groupe (amber, emerald, rose, violet) */
  color?: string;
  /** Icône du groupe */
  icon?: string;
}

const props = withDefaults(defineProps<Props>(), {
  maxMetrics: 2,
  color: 'sky',
  icon: 'i-heroicons-chart-bar-20-solid',
});

// Ne garder que les métriques avec des données 2024
const visibleMetrics = computed(() =>
  props.section.metrics.filter((m) => m.value_2024 !== null).slice(0, props.maxMetrics),
);

// Couleur du header (bande colorée pleine, sobre)
const headerClass = computed(() => {
  const map: Record<string, string> = {
    amber: 'bg-amber-500 dark:bg-amber-600',
    emerald: 'bg-emerald-600 dark:bg-emerald-700',
    sky: 'bg-sky-600 dark:bg-sky-700',
    rose: 'bg-rose-500 dark:bg-rose-600',
    violet: 'bg-violet-600 dark:bg-violet-700',
  };
  return map[props.color] ?? map.sky;
});

function formatNumber(value: number | null): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
}

function formatDelta(metric: Metric): string {
  if (metric.delta === null) return '';
  const sign = metric.delta > 0 ? '+' : '';
  const unit =
    metric.delta_unit === 'pdp' ? ' pts' : metric.delta_unit ? ` ${metric.delta_unit}` : '';
  return `${sign}${metric.delta}${unit}`;
}

function trendColor(trend: string | null): string {
  if (trend === 'up' || trend === 'improving') return 'text-emerald-700 dark:text-emerald-400';
  if (trend === 'down') return 'text-red-600 dark:text-red-400';
  return 'text-gray-400 dark:text-gray-500';
}
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/40">
    <!-- ── HEADER : bande colorée avec icône + titre ── -->
    <div :class="['flex items-center gap-3 px-5 py-3.5', headerClass]">
      <UIcon :name="icon" class="h-5 w-5 text-white/90" />
      <h3 class="text-base font-bold text-white">
        {{ section.title }}
      </h3>
    </div>

    <!-- ── CONTENU : fond blanc, indicateurs gros chiffres ── -->
    <div class="bg-white px-5 py-5 dark:bg-gray-900/60">
      <div class="space-y-5">
        <div v-for="metric in visibleMetrics" :key="metric.id">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">
            {{ metric.label }}
          </p>
          <div class="mt-1 flex items-baseline gap-2">
            <span class="text-3xl font-extrabold tabular-nums text-gray-900 dark:text-white">
              {{ formatNumber(metric.value_2024) }}
            </span>
            <span class="text-sm text-gray-400">{{ metric.unit }}</span>
            <span
              v-if="metric.delta !== null"
              :class="['text-sm font-semibold', trendColor(metric.trend)]"
            >
              {{ formatDelta(metric) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Premier défi -->
      <div
        v-if="section.challenges.length"
        class="mt-5 border-t border-gray-100 pt-4 dark:border-gray-700/30"
      >
        <p class="flex items-start gap-2 text-sm text-gray-500 dark:text-gray-400">
          <UIcon
            name="i-heroicons-exclamation-triangle-20-solid"
            class="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500"
          />
          {{ section.challenges[0] }}
        </p>
      </div>
    </div>
  </div>
</template>
