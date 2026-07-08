<script setup lang="ts">
interface Props {
  count?: number;
}

const props = withDefaults(defineProps<Props>(), {
  count: 2
});
</script>

<template>
  <div class="space-y-6">
    <div v-for="i in count" :key="i" class="space-y-3">
      <USkeleton class="h-12 w-full rounded-xl" />
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <USkeleton v-for="j in 4" :key="j" class="aspect-[3/4] rounded-lg" />
      </div>
    </div>
  </div>
</template>
