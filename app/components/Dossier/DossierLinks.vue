<template>
  <ul
    class="divide-y divide-gray-100 border-y border-gray-100 dark:divide-gray-700 dark:border-gray-700"
  >
    <li v-for="(link, index) in links" :key="index">
      <a
        v-if="isExternal(link.url)"
        :href="link.url"
        target="_blank"
        rel="noopener"
        class="group flex items-center gap-3 py-3 text-sm text-gray-700 transition-colors hover:text-sky-600 dark:text-gray-300 dark:hover:text-sky-400"
      >
        <UIcon
          name="i-heroicons-arrow-top-right-on-square"
          class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
        />
        <span class="flex-1 font-medium">{{ link.label }}</span>
      </a>
      <NuxtLink
        v-else
        :to="link.url"
        class="group flex items-center gap-3 py-3 text-sm text-gray-700 transition-colors hover:text-sky-600 dark:text-gray-300 dark:hover:text-sky-400"
      >
        <UIcon
          name="i-heroicons-arrow-right"
          class="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
        />
        <span class="flex-1 font-medium">{{ link.label }}</span>
      </NuxtLink>
    </li>
  </ul>
</template>

<script setup lang="ts">
import type { DossierLink } from '~~/types/dossier';

defineProps<{ links: DossierLink[] }>();

const isExternal = (url: string) => /^https?:\/\//i.test(url);
</script>
