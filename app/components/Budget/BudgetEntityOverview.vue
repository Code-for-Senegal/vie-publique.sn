<script setup lang="ts">
interface Props {
  entityName: string;
  currentBudget: number;
  latestYear?: number;
  variation: {
    percentage: string;
    color: string;
  };
}

const props = defineProps<Props>();
</script>

<template>
  <div class="white:custom-shadow rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
    <h2 class="mb-4 text-center text-xl font-bold text-gray-900 dark:text-white">
      Budget total {{ latestYear }}
    </h2>

    <!-- Total du budget en grand -->
    <div class="mb-6 text-center">
      <div class="flex items-baseline justify-center gap-2">
        <div class="text-5xl font-bold text-blue-600">
          {{ currentBudget.toLocaleString(undefined, { maximumFractionDigits: 1 }) }}
          <span class="text-3xl">Mrd FCFA</span>
        </div>
        <UBadge
          v-if="variation.percentage !== 'N/A'"
          variant="solid"
          :class="[
            'rounded-full border-none px-3 py-1 text-sm font-medium',
            {
              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400':
                variation.color === 'green',
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400':
                variation.color === 'red',
              'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300':
                variation.color === 'gray',
            },
          ]"
        >
          {{
            variation.percentage.startsWith('+')
              ? '↑'
              : variation.percentage.startsWith('-')
                ? '↓'
                : ''
          }}
          {{ variation.percentage.replace('+', '').replace('-', '') }}
        </UBadge>
      </div>
      <p class="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Montant total du budget alloué à {{ entityName }}
      </p>
    </div>
  </div>
</template>
