<template>
  <header
    class="sticky top-0 z-40 flex h-12 items-center gap-2 bg-white px-4 dark:bg-neutral-900"
  >
    <div class="flex w-full items-center gap-2">
      <h1 class="flex-1 truncate font-bold">{{ title }}</h1>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>
