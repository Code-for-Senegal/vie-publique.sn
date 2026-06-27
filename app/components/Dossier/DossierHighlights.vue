<template>
  <!--
    Mobile : cards compactes (fond léger, padding réduit) pour un balayage rapide.
    Desktop (sm+) : retour au style éditorial sobre « filet à gauche », sans fond.
  -->
  <dl class="grid gap-2.5 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-5">
    <div
      v-for="(item, index) in items"
      :key="index"
      class="rounded-lg bg-gray-50 p-3 dark:bg-gray-800 sm:rounded-none sm:border-l-2 sm:border-gray-200 sm:bg-transparent sm:p-0 sm:pl-4 sm:dark:border-gray-700 sm:dark:bg-transparent"
    >
      <dt class="text-sm font-semibold text-gray-900 dark:text-white">{{ item.title }}</dt>
      <dd
        v-if="item.description"
        class="mt-0.5 text-sm leading-snug text-gray-600 dark:text-gray-400 sm:mt-1 sm:leading-relaxed"
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
