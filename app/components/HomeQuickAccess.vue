<script setup lang="ts">
import type { NavigationCard } from '~/composables/useNavigationCards';

defineProps<{
  navigationCards: NavigationCard[];
}>();
</script>

<template>
  <div class="my-4">
    <div class="flex flex-wrap justify-center gap-2">
      <NuxtLink
        v-for="card in navigationCards.filter((c) => c.display !== false)"
        :key="card.title"
        :to="card.to"
        class="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 shadow-sm transition-all hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:border-primary-700 dark:hover:bg-primary-900/30 dark:hover:text-primary-400"
      >
        <UIcon :name="card.icon" class="h-4 w-4" />
        {{ card.title }}
      </NuxtLink>
    </div>
  </div>
</template>
