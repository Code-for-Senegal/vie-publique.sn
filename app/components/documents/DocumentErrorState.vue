<script setup lang="ts">
interface Props {
  message?: string;
}

withDefaults(defineProps<Props>(), {
  message: 'Impossible de charger les documents',
});
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div
      class="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30"
    >
      <UIcon name="i-heroicons-exclamation-triangle" class="h-8 w-8 text-red-500" />
    </div>
    <p class="mt-4 text-sm font-medium text-gray-900 dark:text-white">Erreur de chargement</p>
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      {{ message }}
    </p>
  </div>
</template>
