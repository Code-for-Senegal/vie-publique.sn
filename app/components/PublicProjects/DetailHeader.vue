<script setup lang="ts">
import type { PublicProjectDetail } from '~~/types/public-project';

interface Props {
  project: PublicProjectDetail;
}

const props = defineProps<Props>();

const formatAmount = (value: number | null): string => {
  if (value === null || value === undefined) return 'Non documenté';
  return value.toLocaleString('fr-FR') + ' FCFA';
};
</script>

<template>
  <div>
    <!-- Titre et badges -->
    <div class="mb-4">
      <div class="flex flex-wrap items-center gap-2">
        <span
          v-if="project.isPres"
          class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          >PRES</span
        >
        <span
          v-if="project.isPriority"
          class="rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
          >Prioritaire</span
        >
        <span
          v-if="project.currentStatusLabel"
          class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >{{ project.currentStatusLabel }}</span
        >
      </div>
      <h1 class="mt-2 text-2xl font-bold text-gray-900 dark:text-white sm:text-3xl">
        {{ project.title }}
      </h1>
      <p v-if="project.summary" class="mt-2 text-gray-600 dark:text-gray-400">
        {{ project.summary }}
      </p>
    </div>

    <!-- Informations clés en grille -->
    <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      <!-- Secteur -->
      <div
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Secteur</p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.sector?.name || 'Non renseigné' }}
        </p>
      </div>

      <!-- Ministère -->
      <div
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Ministère</p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.ministry?.name || 'Non renseigné' }}
        </p>
      </div>

      <!-- Axe / Politique -->
      <div
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Axe / Politique</p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.policyPrimary?.title || 'Non renseigné' }}
        </p>
      </div>

      <!-- Région -->
      <div
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Région</p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.regionPrimaryLabel || 'National' }}
        </p>
      </div>

      <!-- Code projet -->
      <div
        v-if="project.code"
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Code projet</p>
        <p class="mt-0.5 font-mono text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.code }}
        </p>
      </div>

      <!-- Source -->
      <div
        v-if="project.sourceLabel"
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Source</p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.sourceLabel }}
        </p>
      </div>

      <!-- Période -->
      <div
        v-if="project.startYear || project.endYear"
        class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <p class="text-xs font-medium text-gray-500 dark:text-gray-400">Période</p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.startYear || '?' }} — {{ project.endYear || '?' }}
        </p>
      </div>
    </div>

    <!-- Budget total projet -->
    <div
      class="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20"
    >
      <p class="text-xs font-medium text-cyan-700 dark:text-cyan-400">Budget total projet</p>
      <p class="mt-1 text-xl font-bold text-cyan-900 dark:text-cyan-100">
        {{ formatAmount(project.budgetTotalAmount) }}
      </p>
    </div>
  </div>
</template>
