<template>
  <dl class="grid gap-x-10 gap-y-5 sm:grid-cols-2">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="border-l-2 border-gray-200 pl-4 dark:border-gray-700"
    >
      <dt class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.title }}</dt>
      <dd
        v-if="item.description"
        class="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400"
      >
        {{ item.description }}
      </dd>
    </div>
  </dl>
</template>

<script setup lang="ts">
import type { DossierHighlight } from '~~/types/dossier';

defineProps<{ items: DossierHighlight[] }>();
</script>
