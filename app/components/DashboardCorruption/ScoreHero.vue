<script setup lang="ts">
import type { GovernanceScoreIIAG, CorruptionScoreCPI } from '~/types/corruption';

defineProps<{
  country: string;
  iiag: GovernanceScoreIIAG;
  cpi: CorruptionScoreCPI;
}>();

const trendConfig = {
  up: { icon: 'i-heroicons-arrow-trending-up', color: 'text-green-600' },
  down: { icon: 'i-heroicons-arrow-trending-down', color: 'text-red-600' },
  stable: { icon: 'i-heroicons-minus', color: 'text-gray-500' },
};
</script>

<template>
  <div
    class="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800/50"
  >
    <div class="p-4 sm:p-6">
      <div class="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <!-- IIAG Score (primary — maquette) -->
        <div class="flex items-center gap-6">
          <div>
            <p class="text-sm font-medium text-gray-500 dark:text-gray-400">{{ country }}</p>
            <div class="mt-1 flex items-baseline gap-1">
              <span class="text-5xl font-extrabold text-gray-900 dark:text-white">
                {{ iiag.score.toFixed(1).replace('.', ',') }}
              </span>
            </div>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {{ iiag.rank }}e sur {{ iiag.totalCountries }} en Afrique
            </p>
          </div>

          <!-- Signal d'alerte badge -->
          <div
            v-if="iiag.trend === 'down'"
            class="rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 dark:border-orange-800 dark:bg-orange-900/30"
          >
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-exclamation-triangle" class="h-5 w-5 text-orange-500" />
              <span class="text-sm font-semibold text-orange-700 dark:text-orange-300"
                >Signal d'alerte</span
              >
            </div>
            <p class="mt-0.5 text-xs text-orange-600 dark:text-orange-400">
              Baisse récente de la gouvernance
            </p>
          </div>
        </div>

        <!-- CPI Score (secondary) -->
        <div
          class="rounded-xl border border-gray-100 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-900"
        >
          <p
            class="mb-1 text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400"
          >
            Indice CPI (Transparency Int.)
          </p>
          <div class="flex items-center gap-4">
            <div>
              <span class="text-3xl font-extrabold text-orange-600 dark:text-orange-400">{{
                cpi.score
              }}</span>
              <span class="text-lg text-gray-400">/100</span>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-400">
              <p>{{ cpi.rank }}e / {{ cpi.totalCountries }} pays</p>
              <div class="flex items-center gap-1">
                <UIcon
                  :name="trendConfig[cpi.trend].icon"
                  class="h-4 w-4"
                  :class="trendConfig[cpi.trend].color"
                />
                <span :class="trendConfig[cpi.trend].color" class="text-xs font-medium">
                  {{ cpi.trendDelta > 0 ? '+' : '' }}{{ cpi.trendDelta }} vs {{ cpi.year - 1 }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
