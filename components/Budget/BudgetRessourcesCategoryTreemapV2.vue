<template>
  <div class="w-full">
    <h2 class="mb-4 text-2xl font-bold">{{ title }}</h2>
    <div class="mb-2 text-4xl font-bold text-blue-600">
      {{ totalValue }} {{ unit }}
    </div>
    <!-- <pre>{{ items }}</pre> -->
    <div class="flex h-20 w-full overflow-hidden rounded-lg">
      <div
        v-for="(item, index) in items"
        :key="index"
        :style="{ width: `${item.percentage}%` }"
        class="flex flex-col items-center justify-center text-white"
        :class="[item.color]"
      >
        <div class="text-2xl font-bold">{{ item.value }}</div>
        <div class="text-sm">{{ item.name }}</div>
      </div>
    </div>
    <div class="mt-2 flex">
      <div
        v-for="(item, index) in items"
        :key="index"
        :style="{ width: `${item.percentage}%` }"
        class="text-center text-xs"
      >
        {{ item.percentage.toFixed(1) }}%
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface BudgetItem {
  name: string;
  value: number;
  percentage: number;
  color: string;
}

const props = defineProps<{
  title: string;
  items: BudgetItem[];
  unit: string;
}>();

const totalValue = computed(() => {
  return props.items.reduce((sum, item) => sum + item.value, 0);
});
</script>
