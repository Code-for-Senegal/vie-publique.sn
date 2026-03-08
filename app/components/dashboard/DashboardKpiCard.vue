<script setup lang="ts">
interface Props {
  label: string;
  value: string;
  unit?: string;
  variation?: string;
  variationDirection?: 'up' | 'down' | 'neutral';
  icon?: string;
  color?: 'green' | 'blue' | 'amber' | 'purple' | 'red';
}

withDefaults(defineProps<Props>(), {
  unit: '',
  variation: '',
  variationDirection: 'neutral',
  icon: '',
  color: 'blue',
});

const accentColor: Record<string, string> = {
  green: 'text-emerald-600 dark:text-emerald-400',
  blue: 'text-sky-600 dark:text-sky-400',
  amber: 'text-amber-600 dark:text-amber-400',
  purple: 'text-violet-600 dark:text-violet-400',
  red: 'text-red-600 dark:text-red-400',
};

const borderColor: Record<string, string> = {
  green: 'border-emerald-500/30',
  blue: 'border-sky-500/30',
  amber: 'border-amber-500/30',
  purple: 'border-violet-500/30',
  red: 'border-red-500/30',
};

const badgeVariation: Record<string, string> = {
  up: 'text-emerald-600 bg-emerald-500/10 dark:text-emerald-400 dark:bg-emerald-400/10',
  down: 'text-red-600 bg-red-500/10 dark:text-red-400 dark:bg-red-400/10',
  neutral: 'text-gray-500 bg-gray-200/50 dark:text-gray-400 dark:bg-gray-400/10',
};
</script>

<template>
  <div
    :class="[
      'relative overflow-hidden rounded-lg border px-2 py-1.5 sm:px-2.5 sm:py-2',
      'bg-white backdrop-blur-sm dark:bg-gray-900/80',
      borderColor[color],
    ]"
  >
    <div class="flex items-start justify-between">
      <span class="text-[9px] font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">{{ label }}</span>
      <span v-if="icon" class="text-xs opacity-60">{{ icon }}</span>
    </div>
    <div class="mt-0.5 flex items-baseline gap-1">
      <span :class="['text-base font-extrabold tracking-tight sm:text-lg', accentColor[color]]">
        {{ value }}
      </span>
      <span v-if="unit" class="text-[9px] font-medium text-gray-400 dark:text-gray-500">{{ unit }}</span>
    </div>
    <div v-if="variation" class="mt-0.5">
      <span
        :class="[
          'inline-flex items-center gap-0.5 rounded-full px-1.5 py-px text-[9px] font-semibold',
          badgeVariation[variationDirection],
        ]"
      >
        <UIcon
          v-if="variationDirection === 'up'"
          name="i-heroicons-arrow-trending-up-20-solid"
          class="h-2.5 w-2.5"
        />
        <UIcon
          v-else-if="variationDirection === 'down'"
          name="i-heroicons-arrow-trending-down-20-solid"
          class="h-2.5 w-2.5"
        />
        {{ variation }}
      </span>
    </div>
  </div>
</template>
