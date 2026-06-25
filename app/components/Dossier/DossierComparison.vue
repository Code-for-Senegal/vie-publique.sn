<template>
  <div>
    <!-- Desktop : tableau sobre -->
    <table class="hidden w-full border-collapse text-sm sm:table">
      <thead>
        <tr class="border-b border-gray-200 text-left dark:border-gray-700">
          <th class="py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">
            {{ labelColumn }}
          </th>
          <th class="px-4 py-2 font-semibold text-gray-500 dark:text-gray-400">
            {{ beforeColumn }}
          </th>
          <th class="py-2 pl-4 font-semibold text-sky-700 dark:text-sky-400">{{ afterColumn }}</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
        <tr v-for="(row, index) in rows" :key="index" class="align-top">
          <td class="py-3 pr-4 font-medium text-gray-900 dark:text-white">{{ row.label }}</td>
          <td class="px-4 py-3 text-gray-500 dark:text-gray-400">{{ row.before || '—' }}</td>
          <td class="py-3 pl-4 text-gray-700 dark:text-gray-200">{{ row.after || '—' }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Mobile : blocs empilés Avant / Après -->
    <div class="space-y-5 sm:hidden">
      <div
        v-for="(row, index) in rows"
        :key="index"
        class="border-t border-gray-100 pt-4 first:border-t-0 first:pt-0 dark:border-gray-700"
      >
        <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ row.label }}</p>
        <div class="mt-2 space-y-2">
          <div>
            <p
              class="text-xs font-medium uppercase tracking-wide text-gray-400 dark:text-gray-500"
            >
              {{ beforeColumn }}
            </p>
            <p class="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              {{ row.before || '—' }}
            </p>
          </div>
          <div>
            <p class="text-xs font-medium uppercase tracking-wide text-sky-600 dark:text-sky-400">
              {{ afterColumn }}
            </p>
            <p class="mt-0.5 text-sm text-gray-700 dark:text-gray-200">{{ row.after || '—' }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DossierComparisonRow } from '~~/types/dossier';

withDefaults(
  defineProps<{
    rows: DossierComparisonRow[];
    labelColumn?: string;
    beforeColumn?: string;
    afterColumn?: string;
  }>(),
  {
    labelColumn: 'Élément',
    beforeColumn: 'Ancien texte',
    afterColumn: 'Nouveau texte',
  },
);
</script>
