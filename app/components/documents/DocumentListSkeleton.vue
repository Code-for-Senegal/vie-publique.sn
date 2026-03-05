<script setup lang="ts">
interface Props {
  count?: number;
  /** 'tall' = h-20 w-14 (standard), 'square' = h-12 w-12 (logos) */
  thumbnailShape?: 'tall' | 'square';
}

withDefaults(defineProps<Props>(), {
  count: 5,
  thumbnailShape: 'tall',
});
</script>

<template>
  <div class="space-y-3">
    <div
      v-for="n in count"
      :key="n"
      class="flex gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700"
    >
      <USkeleton
        :class="['shrink-0 rounded-lg', thumbnailShape === 'square' ? 'h-12 w-12' : 'h-20 w-14']"
      />
      <div class="flex-1 space-y-2">
        <USkeleton class="h-4 w-3/4" />
        <USkeleton class="h-3 w-full" />
        <USkeleton class="h-3 w-1/3" />
      </div>
    </div>
  </div>
</template>
