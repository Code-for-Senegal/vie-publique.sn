<template>
  <div class="w-full">
    <h2 class="mb-4 text-2xl font-bold">{{ title }}</h2>
    <div class="mb-2 text-4xl font-bold text-blue-600">
      {{ totalValue }} {{ unit }}
    </div>
    <div
      class="grid h-80 w-full grid-cols-1 gap-2 overflow-hidden rounded-lg md:grid-cols-2 lg:grid-cols-4"
    >
      <div
        v-for="(item, index) in items"
        :key="index"
        :style="{ height: `${item.percentage}%` }"
        class="flex items-center justify-center text-white"
        :class="[item.color]"
      >
        <div class="text-center">
          <div class="text-lg font-bold">{{ item.name }}</div>
          <div class="text-sm">{{ item.value }} {{ unit }}</div>
          <div>{{ item.percentage.toFixed(1) }}%</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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
