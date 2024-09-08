<script setup lang="ts">
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  icon: string;
  ministry: string;
  budget: number;
}>();
</script>

<template>
  <div class="bg-beige-100 flex flex-col items-center rounded p-2">
    <div class="mb-1 text-2xl">{{ icon }}</div>
    <div class="text-xl font-bold">{{ budget.toFixed(1) }} Mrd</div>
    <div class="text-center text-xs">{{ ministry }}</div>
  </div>
</template>

<style scoped>
.bg-beige-100 {
  background-color: #efebe9;
}
</style>
