<script setup lang="ts">
import type { PublicProjectBudgetYear } from '~~/types/public-project';

interface Props {
  budgetYears: PublicProjectBudgetYear[];
}

const props = defineProps<Props>();

const formatAmount = (value: number | null): string => {
  if (value === null || value === undefined) return '—';
  return value.toLocaleString('fr-FR') + ' FCFA';
};

const hasBudgetData = computed(() => props.budgetYears.length > 0);
</script>

<template>
  <div
    class="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800"
  >
    <h3 class="mb-4 text-lg font-bold text-gray-900 dark:text-white">
      Historique budgétaire annuel
    </h3>

    <div v-if="hasBudgetData">
      <!-- Tableau -->
      <div class="overflow-x-auto">
        <table class="w-full text-left text-sm">
          <thead
            class="border-b border-gray-200 bg-gray-50 text-xs font-medium uppercase text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
          >
            <tr>
              <th class="px-4 py-3">Année</th>
              <th class="px-4 py-3">Version</th>
              <th class="px-4 py-3 text-right">Montant</th>
              <th class="px-4 py-3 text-right">AE (Autorisations d'Engagement)</th>
              <th class="px-4 py-3 text-right">CP (Crédits de Paiement)</th>
              <th class="px-4 py-3">Document source</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
            <tr v-for="budget in budgetYears" :key="budget.id" class="bg-white dark:bg-gray-900">
              <td class="px-4 py-3 font-semibold text-gray-900 dark:text-white">
                {{ budget.yearLabel }}
              </td>
              <td class="px-4 py-3">
                <span
                  class="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                >
                  {{ budget.versionLabel }}
                </span>
              </td>
              <td
                class="whitespace-nowrap px-4 py-3 text-right font-mono text-gray-900 dark:text-white"
              >
                {{ formatAmount(budget.amount) }}
              </td>
              <td
                class="whitespace-nowrap px-4 py-3 text-right font-mono text-gray-900 dark:text-white"
              >
                {{ formatAmount(budget.amountAE) }}
              </td>
              <td
                class="whitespace-nowrap px-4 py-3 text-right font-mono text-gray-900 dark:text-white"
              >
                {{ formatAmount(budget.amountCP) }}
              </td>
              <td class="px-4 py-3">
                <NuxtLink
                  v-if="budget.sourceDocument"
                  :to="`/documents/${budget.sourceDocument.id}/${budget.sourceDocument.slug}`"
                  class="text-primary-600 dark:text-primary-400 text-xs hover:underline"
                >
                  {{ budget.sourceDocument.title }}
                </NuxtLink>
                <span v-else class="text-xs text-gray-400">—</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Version mobile : cartes -->
      <div class="mt-4 space-y-3 md:hidden">
        <div
          v-for="budget in budgetYears"
          :key="'mobile-' + budget.id"
          class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
        >
          <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-900 dark:text-white">{{ budget.yearLabel }}</span>
            <span
              class="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-300"
            >
              {{ budget.versionLabel }}
            </span>
          </div>
          <div class="mt-2 space-y-1 text-sm">
            <div v-if="budget.amount" class="flex justify-between">
              <span class="text-gray-500">Montant</span>
              <span class="font-mono font-medium text-gray-900 dark:text-white">{{
                formatAmount(budget.amount)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">AE</span>
              <span class="font-mono font-medium text-gray-900 dark:text-white">{{
                formatAmount(budget.amountAE)
              }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">CP</span>
              <span class="font-mono font-medium text-gray-900 dark:text-white">{{
                formatAmount(budget.amountCP)
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Pas de données -->
    <div v-else class="py-8 text-center">
      <UIcon
        name="i-heroicons-banknotes"
        class="mx-auto h-8 w-8 text-gray-300 dark:text-gray-600"
      />
      <p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
        Aucun budget annuel documenté pour ce projet.
      </p>
    </div>
  </div>
</template>
