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
          v-if="project.isInPres"
          class="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
          >PRES</span
        >
        <span
          v-if="project.isInPip"
          class="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
          >PIP</span
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
        <span
          v-if="project.currentDelayStatusLabel"
          class="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >{{ project.currentDelayStatusLabel }}</span
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
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800/50">
        <p class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-squares-2x2" class="h-3.5 w-3.5" />
          Secteur
        </p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.sector?.name || 'Non renseigné' }}
        </p>
      </div>

      <!-- Ministère -->
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800/50">
        <p class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-building-office-2" class="h-3.5 w-3.5" />
          Ministère
        </p>
        <NuxtLink
          v-if="project.ministry?.publicSlug"
          :to="`/budget-senegal/${project.ministry.publicSlug}`"
          class="text-primary-600 dark:text-primary-400 mt-0.5 block text-sm font-semibold hover:underline"
        >
          {{ project.ministry.name }}
        </NuxtLink>
        <p v-else class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.ministry?.name || 'Non renseigné' }}
        </p>
      </div>

      <!-- Axe / Politique -->
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800/50">
        <p class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-flag" class="h-3.5 w-3.5" />
          Axe / Politique
        </p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.policyPrimary?.title || 'Non renseigné' }}
        </p>
      </div>

      <!-- Région -->
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800/50">
        <p class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-map-pin" class="h-3.5 w-3.5" />
          Région
        </p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.regionPrimaryLabel || 'National' }}
        </p>
      </div>

      <!-- Code projet -->
      <div class="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800/50">
        <p class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-hashtag" class="h-3.5 w-3.5" />
          Code projet
        </p>
        <p class="mt-0.5 font-mono text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.code || 'Non renseigné' }}
        </p>
      </div>

      <!-- Période -->
      <div
        v-if="project.startYear || project.endYear"
        class="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <p class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-calendar-days" class="h-3.5 w-3.5" />
          Période
        </p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.startYear || '?' }} — {{ project.endYear || '?' }}
        </p>
      </div>

      <!-- Programme -->
      <div
        v-if="project.currentProgramLabel"
        class="rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800/50"
      >
        <p class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
          <UIcon name="i-heroicons-clipboard-document-list" class="h-3.5 w-3.5" />
          Programme
        </p>
        <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
          {{ project.currentProgramLabel }}
        </p>
      </div>
    </div>

    <!-- Budget total projet -->
    <div
      class="mt-4 rounded-xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-800 dark:bg-cyan-900/20"
    >
      <p class="flex items-center gap-1.5 text-xs font-medium text-cyan-700 dark:text-cyan-400">
        <UIcon name="i-heroicons-banknotes" class="h-3.5 w-3.5" />
        Budget total projet
      </p>
      <p class="mt-1 text-xl font-bold text-cyan-900 dark:text-cyan-100">
        {{ formatAmount(project.budgetTotalAmount) }}
      </p>
    </div>

    <!-- Source des données -->
    <div
      v-if="project.sourceLabel"
      class="mt-4 rounded-lg border border-gray-200 p-3 dark:border-gray-700 dark:bg-gray-800/50"
    >
      <p class="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
        <UIcon name="i-heroicons-information-circle" class="h-3.5 w-3.5" />
        Source
      </p>
      <p class="mt-0.5 text-sm font-semibold text-gray-900 dark:text-white">
        {{ project.sourceLabel }}
      </p>
      <div
        v-if="project.yearLabel || project.versionLabel"
        class="mt-1 flex gap-3 text-xs text-gray-500 dark:text-gray-500"
      >
        <span v-if="project.yearLabel">Année : {{ project.yearLabel }}</span>
        <span v-if="project.versionLabel">Version : {{ project.versionLabel }}</span>
      </div>
    </div>
  </div>
</template>
