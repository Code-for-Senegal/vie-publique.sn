<template>
  <ol class="relative border-l border-gray-200 pl-6 dark:border-gray-700">
    <li v-for="(item, index) in items" :key="index" class="mb-6 last:mb-0">
      <span
        class="absolute -left-[5px] mt-1.5 h-2.5 w-2.5 rounded-full bg-sky-500 ring-4 ring-white dark:ring-gray-900"
      />
      <time class="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500">
        {{ formatDate(item.date) }}
      </time>
      <h3 class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
        {{ item.title }}
      </h3>
      <p
        v-if="item.description"
        class="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400"
      >
        {{ item.description }}
      </p>
    </li>
  </ol>
</template>

<script setup lang="ts">
import type { DossierTimelineItem } from '~~/types/dossier';

defineProps<{ items: DossierTimelineItem[] }>();

// Accepte une date ISO (formatée) ou un libellé libre (renvoyé tel quel).
const formatDate = (value: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  if (isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' });
};
</script>
