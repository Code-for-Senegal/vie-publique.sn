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
}

defineProps<Props>();

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
  if (trend === 'up') return 'text-emerald-600 dark:text-emerald-400';
  if (trend === 'improving') return 'text-emerald-600 dark:text-emerald-400';
  if (trend === 'down') return 'text-red-500 dark:text-red-400';
  return 'text-gray-500 dark:text-gray-400';
}

function trendBg(trend: string): string {
  if (trend === 'up' || trend === 'improving') return 'bg-emerald-100/80 dark:bg-emerald-400/10';
  if (trend === 'down') return 'bg-red-100/80 dark:bg-red-400/10';
  return 'bg-gray-100 dark:bg-gray-800';
}

function accentBorder(trend: string): string {
  if (trend === 'up' || trend === 'improving') return 'border-l-emerald-500';
  if (trend === 'down') return 'border-l-red-500';
  return 'border-l-gray-300 dark:border-l-gray-600';
}
</script>

<template>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <div
      v-for="card in cards"
      :key="card.id"
      :class="[
        'rounded-2xl border border-l-4 border-gray-200 bg-white p-5 dark:border-gray-700/50 dark:bg-gray-900/80',
        accentBorder(card.trend),
      ]"
    >
      <p class="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {{ card.label }}
      </p>
      <div class="mt-3 flex items-baseline gap-1.5">
        <span
          class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white lg:text-4xl"
        >
          {{ card.value_2024 }}
        </span>
        <span class="text-base text-gray-400 dark:text-gray-500">{{ card.unit }}</span>
      </div>
      <div class="mt-3 flex items-center gap-2">
        <span
          v-if="card.delta !== null"
          :class="[
            'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold',
            trendBg(card.trend),
            trendColor(card.trend),
          ]"
        >
          <UIcon :name="trendIcon(card.trend)" class="h-4 w-4" />
          {{ formatDelta(card.delta, card.delta_unit) }}
        </span>
        <span class="text-xs text-gray-400 dark:text-gray-500">vs 2023</span>
      </div>
    </div>
  </div>
</template>
