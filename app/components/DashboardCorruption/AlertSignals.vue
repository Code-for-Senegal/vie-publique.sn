<script setup lang="ts">
import type { AlertSignal } from '~/types/corruption';

defineProps<{
  alerts: AlertSignal[];
}>();

// Custom button configs based on mockup logic (demo)
const getButtonConfig = (alert: AlertSignal, index: number) => {
  if (index === 0) {
    return {
      label: 'Signaler un problème',
      icon: '',
      class: 'bg-red-700 text-white hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 w-full justify-center',
      to: '/dashboard/corruption/signaler'
    };
  }
  if (index === 1) {
    return {
      label: 'Zone faible',
      icon: 'i-heroicons-document-text',
      class: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
      to: undefined // No link for now
    };
  }
  return {
    label: 'Voir les zones faibles',
    icon: '',
    class: 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50 w-full justify-center',
     to: '/dashboard/corruption/signaler'
  };
};

const getCardStyle = (index: number) => {
  if (index === 0) return 'bg-red-50/50 border-l-4 border-l-red-600 dark:bg-red-900/10 dark:border-l-red-500';
  return 'bg-gray-50 dark:bg-gray-900/20'; // Clean default
};

</script>

<template>
  <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <div
      v-for="(alert, index) in alerts.slice(0, 3)"
      :key="alert.id"
      class="flex flex-col rounded-xl p-5 transition-all hover:shadow-md"
      :class="getCardStyle(index)"
    >
      <!-- Header -->
      <div class="mb-4 min-h-[40px]">
        <h4 class="text-base font-semibold leading-snug text-gray-900 dark:text-white" :title="alert.label">
          {{ alert.label }}
        </h4>
        <!-- Source (optional, kept small) -->
        <!-- <p class="text-[10px] text-gray-400 mt-1 line-clamp-1">{{ alert.source }}</p> -->
      </div>

      <!-- Value Section -->
      <div class="mt-auto mb-4 flex items-baseline gap-2">
         <span class="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          {{ alert.value.toString().replace('.', ',') }}
         </span>

         <!-- Trend Badge -->
         <span
          v-if="alert.trend !== 'stable'"
          class="flex items-center text-sm font-bold"
          :class="alert.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'"
        >
           <UIcon :name="alert.trend === 'up' ? 'i-heroicons-arrow-trending-up' : 'i-heroicons-arrow-trending-down'" class="mr-0.5 h-4 w-4" />
           {{ alert.trend === 'up' ? '+' : '' }}4,6
         </span>
      </div>

      <!-- Action Button -->
      <div>
        <NuxtLink
          :to="getButtonConfig(alert, index).to"
          class="inline-flex items-center rounded-lg px-4 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1"
          :class="getButtonConfig(alert, index).class"
        >
          <UIcon v-if="getButtonConfig(alert, index).icon" :name="getButtonConfig(alert, index).icon" class="mr-2 h-4 w-4" />
          {{ getButtonConfig(alert, index).label }}
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
