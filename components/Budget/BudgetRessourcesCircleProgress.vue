<template>
  <div class="relative h-32 w-32">
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
      class="absolute inset-0 flex flex-col items-center justify-center text-center"
    >
      <div class="text-wrap text-xl" :class="`text-${colorText}-700`">
        {{ Math.floor(percentage) }}%
      </div>
      <div class="text-wrap text-xs">{{ label }}</div>
      <div class="text-sm font-bold">{{ value }}</div>
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
