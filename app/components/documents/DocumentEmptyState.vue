<script setup lang="ts">
interface Props {
  icon?: string;
  title?: string;
  message?: string;
  showReset?: boolean;
}

withDefaults(defineProps<Props>(), {
  icon: 'i-heroicons-document-text',
  title: 'Aucun résultat',
  message: 'Aucun document ne correspond à votre recherche',
  showReset: true,
});

const emit = defineEmits<{
  reset: [];
}>();
</script>

<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <div
      class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800"
    >
      <UIcon :name="icon" class="h-8 w-8 text-gray-400" />
    </div>
    <p class="mt-4 text-sm font-medium text-gray-900 dark:text-white">{{ title }}</p>
    <p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
      {{ message }}
    </p>
    <button
      v-if="showReset"
      type="button"
      class="bg-primary-500 hover:bg-primary-600 mt-4 rounded-full px-4 py-2 text-xs font-medium text-white transition-colors active:scale-95"
      @click="emit('reset')"
    >
      Réinitialiser les filtres
    </button>
  </div>
</template>
