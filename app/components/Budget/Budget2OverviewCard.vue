<template>
  <div class="rounded-lg bg-white p-2 shadow-lg sm:p-4 dark:bg-gray-800">
    <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300">{{ name }}</h3>
    <div class="mt-3 flex items-start">
      <div class="flex items-baseline">
        <span
          class="font-display text-3xl font-bold tracking-tight text-gray-800 sm:text-5xl dark:text-white"
        >
          {{ value }}
        </span>
      </div>
      <div class="ml-2 flex flex-col justify-between space-y-1">
        <span class="font-mono text-xs text-gray-500 sm:text-sm dark:text-gray-400">
          {{ unit }}
        </span>
        <UBadge
          v-if="variation_percentage && variation_percentage !== 'N/A'"
          variant="solid"
          :class="[
            'rounded-full border-none px-1 text-center text-xs font-medium tracking-wide sm:px-2 sm:text-sm',
            {
              'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400': variation_color === 'green',
              'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400': variation_color === 'red',
              'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-300': variation_color === 'gray',
            }
          ]"
        >
          {{ variation_percentage }}
        </UBadge>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  name: string;
  value: string;
  unit?: string;
  variation_percentage: string;
  color?: 'green' | 'red' | 'gray';
  variation_color?: 'green' | 'red' | 'gray';
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  color: 'gray',
  variation_color: 'gray',
});
</script>
