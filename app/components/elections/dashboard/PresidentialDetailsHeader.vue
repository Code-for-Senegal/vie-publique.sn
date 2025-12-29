<script setup lang="ts">
interface Props {
  coalitionName?: string;
  listCount?: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'close'): void;
}>();
</script>

<template>
  <div class="flex items-center justify-between border-b dark:border-gray-800 pb-4">
    <div class="flex items-center gap-4">
      <UButton
        icon="i-heroicons-arrow-left"
        color="gray"
        variant="ghost"
        @click="emit('close')"
        class="hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Retour
      </UButton>
      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Détails de la liste {{ coalitionName }}</h2>
    </div>
    <UBadge v-if="listCount" color="primary" variant="subtle">
      {{ (listCount / 2).toFixed(0) }} circonscriptions
    </UBadge>
  </div>
</template>
