<script setup lang="ts">
import type { GovernanceScoreIIAG, CorruptionScoreCPI } from '~/types/corruption';

defineProps<{
  country: string;
  iiag: GovernanceScoreIIAG;
  cpi: CorruptionScoreCPI;
}>();

const trendConfig = {
  up: { icon: 'i-heroicons-arrow-trending-up', color: 'text-green-600 dark:text-green-400' },
  down: { icon: 'i-heroicons-arrow-trending-down', color: 'text-red-600 dark:text-red-400' },
  stable: { icon: 'i-heroicons-minus', color: 'text-gray-500 dark:text-gray-400' },
};
</script>

<template>
  <div class="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-800/50">
    <!-- Header Row -->
    <div class="flex items-center justify-between">
      <!-- Left: Country + Score -->
      <div class="flex items-center gap-6">
        <!-- Gray Map Placeholder -->
        <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-600">
           <!-- Ideally an SVG map of Senegal, using Icon for now -->
           <UIcon name="i-heroicons-map" class="h-10 w-10" />
        </div>

        <div>
           <h2 class="text-xl font-bold text-slate-800 dark:text-white">{{ country }}</h2>

           <div class="flex items-baseline font-black leading-none text-slate-900 dark:text-white">
             <span class="text-[3.5rem] tracking-tight">{{ iiag.score.toFixed(1).replace('.', ',') }}</span>
           </div>

           <p class="mt-1 text-sm font-medium text-slate-500 dark:text-gray-400">
             <span class="font-bold text-slate-700 dark:text-gray-300">{{ iiag.rank }}e sur {{ iiag.totalCountries }}</span> en Afrique
           </p>
        </div>
      </div>

      <!-- Right: Alert Signal (Orange style) -->
      <div
        v-if="iiag.trend === 'down'"
        class="flex flex-col items-start rounded-xl bg-orange-50 px-5 py-3 dark:bg-orange-900/10"
      >
        <div class="flex items-center gap-2 text-orange-700 dark:text-orange-400">
          <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5" />
          <span class="font-bold">Signal d'alerte</span>
        </div>
        <p class="mt-1 max-w-[140px] text-sm font-medium leading-tight text-slate-700 dark:text-gray-300">
           Baisse récente de la gouvernance
        </p>
      </div>
    </div>
  </div>
</template>
