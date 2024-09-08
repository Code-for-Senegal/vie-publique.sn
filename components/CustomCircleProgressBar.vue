<template>
  <div class="relative h-28">
    <svg class="h-full w-full" viewBox="0 0 100 100">
      <circle
        class="stroke-current text-gray-200"
        stroke-width="8"
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
      />
      <circle
        class="text-black-700 progress-ring__circle stroke-current"
        stroke-width="8"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
        cx="50"
        cy="50"
        r="40"
        fill="transparent"
      />
    </svg>
    <div
      class="absolute inset-0 flex items-center justify-center text-3xl font-bold"
    >
      {{ progress }}%
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  progress: number;
}>();

const circumference = 2 * Math.PI * 40;
const dashOffset = computed(() => {
  return circumference - (props.progress / 100) * circumference;
});
</script>

<style scoped>
.progress-ring__circle {
  transition: stroke-dashoffset 0.35s;
  transform: rotate(-90deg);
  transform-origin: 50% 50%;
}
</style>
