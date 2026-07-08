<script setup lang="ts">
interface RacCard {
  id: string;
  label: string;
  unit: string;
  value_2023: number;
  value_2024: number;
  delta: number;
  delta_unit: string;
  trend: string;
  category: string;
}

interface Props {
  cards: RacCard[];
  /** Nombre max de KPI affichés (défaut: tous) */
  max?: number;
}

const props = defineProps<Props>();

const visibleCards = computed(() => (props.max ? props.cards.slice(0, props.max) : props.cards));

function formatDelta(delta: number | null, deltaUnit: string | null): string {
  if (delta === null || delta === undefined) return '';
  const sign = delta > 0 ? '+' : '';
  const unit = deltaUnit === 'pdp' ? ' pts' : deltaUnit ? ` ${deltaUnit}` : '';
  return `${sign}${delta}${unit}`;
}

function trendIcon(trend: string): string {
  if (trend === 'up' || trend === 'improving') return 'i-heroicons-arrow-trending-up-20-solid';
  if (trend === 'down') return 'i-heroicons-arrow-trending-down-20-solid';
  return 'i-heroicons-minus-20-solid';
}

function trendColor(trend: string): string {
  if (trend === 'up' || trend === 'improving') return 'text-emerald-700 dark:text-emerald-400';
  if (trend === 'down') return 'text-red-600 dark:text-red-400';
  return 'text-gray-500 dark:text-gray-400';
}

function trendBg(trend: string): string {
  if (trend === 'up' || trend === 'improving') return 'bg-emerald-50 dark:bg-emerald-900/20';
  if (trend === 'down') return 'bg-red-50 dark:bg-red-900/20';
  return 'bg-gray-50 dark:bg-gray-800';
}
</script>

<template>
  <div class="grid grid-cols-2 gap-4 lg:grid-cols-5">
    <div
      v-for="card in visibleCards"
      :key="card.id"
      class="rounded-xl border border-gray-200 bg-white px-5 py-6 dark:border-gray-700/40 dark:bg-gray-900/60"
    >
      <p
        class="text-[11px] font-medium uppercase leading-tight tracking-wide text-gray-500 dark:text-gray-400"
      >
        {{ card.label }}
      </p>
      <div class="mt-3 flex items-baseline gap-1">
        <span class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {{ card.value_2024 }}
        </span>
        <span class="text-sm text-gray-400 dark:text-gray-500">{{ card.unit }}</span>
      </div>
      <div class="mt-3">
        <span
          v-if="card.delta !== null"
          :class="[
            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold',
            trendBg(card.trend),
            trendColor(card.trend),
          ]"
        >
          <UIcon :name="trendIcon(card.trend)" class="h-3.5 w-3.5" />
          {{ formatDelta(card.delta, card.delta_unit) }}
        </span>
      </div>
    </div>
  </div>
</template>
