<template>
  <div
    class="divide-y divide-gray-100 border-y border-gray-100 dark:divide-gray-700 dark:border-gray-700"
  >
    <details v-for="(item, index) in items" :key="index" class="group py-1">
      <summary
        class="flex cursor-pointer list-none items-center justify-between gap-3 py-3 text-[15px] font-medium text-gray-900 dark:text-white"
      >
        <span itemprop="name">{{ item.question }}</span>
        <UIcon
          name="i-heroicons-plus"
          class="h-4 w-4 shrink-0 text-gray-400 transition-transform group-open:rotate-45 dark:text-gray-500"
        />
      </summary>
      <div
        class="prose prose-sm max-w-none pb-4 text-gray-600 dark:prose-invert dark:text-gray-400"
        v-html="item.answer"
      />
    </details>
  </div>
</template>

<script setup lang="ts">
import type { DossierFaqItem } from '~~/types/dossier';

/** FAQ sobre (accordéon minimal). Le JSON-LD FAQPage est généré côté page détail. */
defineProps<{ items: DossierFaqItem[] }>();
</script>
