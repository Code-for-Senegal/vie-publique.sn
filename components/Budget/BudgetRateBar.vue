<template>
  <div class="space-y-2">
    <div v-for="item in items" :key="item.name" class="mb-4">
      <div class="mb-1 flex justify-between">
        <span class="text-sm font-medium">{{ item.name }}</span>
        <span class="text-sm font-medium">{{ item.value.toFixed(1) }} Mrd</span>
      </div>
      <div
        class="h-2.5 w-full flex-grow overflow-hidden rounded-full bg-gray-200"
      >
        <div
          :class="[item.color, 'h-full']"
          :style="{ width: `${(item.value / total) * 100}%` }"
        ></div>
      </div>
      <div class="flex justify-end text-xs">
        <span
          class="text-sm"
          :class="[item.increase > 0 ? 'text-green-600' : 'text-red-600']"
          >{{ item.increase > 0 ? "↑" : "↓" }} {{ item.increase }}%</span
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    name: string;
    value: number;
    increase: number;
    color: string;
  }>;
  total: number;
}>();
</script>
