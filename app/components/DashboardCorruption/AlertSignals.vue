<script setup lang="ts">
import type { AlertSignal } from '~/types/corruption';

defineProps<{
  alerts: AlertSignal[];
}>();

const trendConfig = {
  up: {
    icon: 'i-heroicons-arrow-trending-up',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  down: {
    icon: 'i-heroicons-arrow-trending-down',
    color: 'text-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
  },
  stable: { icon: 'i-heroicons-minus', color: 'text-gray-400', bg: 'bg-gray-50 dark:bg-gray-800' },
};
</script>

<template>
  <div>
    <h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">Signaux d'alerte</h3>
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="alert in alerts"
        :key="alert.id"
        class="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 dark:bg-orange-900/30"
            >
              <UIcon :name="alert.icon" class="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div class="min-w-0">
              <p class="text-sm font-medium text-gray-900 dark:text-white">{{ alert.label }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">Source : {{ alert.source }}</p>
            </div>
          </div>
          <div
            class="flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5"
            :class="trendConfig[alert.trend].bg"
          >
            <UIcon
              :name="trendConfig[alert.trend].icon"
              class="h-3.5 w-3.5"
              :class="trendConfig[alert.trend].color"
            />
          </div>
        </div>
        <p class="mt-3 text-xl font-bold text-gray-900 dark:text-white">
          {{ alert.value }}
        </p>
      </div>
    </div>
  </div>
</template>
