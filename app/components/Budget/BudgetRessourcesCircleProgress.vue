<template>
  <div class="relative mx-auto h-32 w-32">
    <svg class="h-full w-full" viewBox="0 0 35 35">
      <path
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        stroke="#eee"
        stroke-width="2"
      />
      <path
        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
        fill="none"
        :stroke="colorBg"
        stroke-width="2"
        :stroke-dasharray="`${percentage}, 100`"
      />
    </svg>
    <div
      class="absolute inset-0 flex flex-col items-center justify-center text-center px-2"
    >
      <div class="text-2xl font-bold" :class="`text-${colorText}-700 dark:text-${colorText}-400`">
        {{ Math.floor(percentage) }}%
      </div>
      <div class="w-full text-[0.65rem] leading-tight text-gray-700 dark:text-gray-300 line-clamp-2">{{ label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  percentage: number;
  label: string;
  value: string;
  colorBg?: string;
  colorText?: string;
}>();
</script>
