<script setup lang="ts">
interface Props {
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 8
});
</script>

<template>
  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
    <UCard
      v-for="i in count"
      :key="i"
      class="h-40 border dark:border-gray-800 shadow-none animate-pulse"
    />
  </div>
</template>
