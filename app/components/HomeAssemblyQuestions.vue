<template>
  <div class="my-4">
    <!-- Loading state -->
    <div v-if="loading" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div v-for="n in 3" :key="n" class="animate-pulse">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-gray-200"></div>
          <div class="flex-1">
            <div class="h-4 w-3/4 rounded bg-gray-200"></div>
            <div class="mt-2 h-3 w-1/2 rounded bg-gray-200"></div>
            <div class="mt-1 h-2 w-1/4 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Error state -->
    <UAlert
      v-else-if="error"
      title="Erreur de chargement"
      description="Impossible de charger les questions écrites"
      color="red"
      icon="i-heroicons-exclamation-triangle"
    />

    <!-- Content -->
    <div v-else>
      <h2 class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white">
        Dernières initiatives parlementaires
      </h2>

      <div class="grid gap-4 sm:grid-cols-3">
        <div
          v-for="question in questions?.slice(0, 3)"
          :key="question.id"
          class="custom-shadow group relative overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-200 hover:translate-y-[-2px] hover:shadow-md dark:bg-gray-800 dark:ring-1 dark:ring-gray-700 dark:backdrop-blur-md"
        >
          <NuxtLink :to="`/assemblee-nationale/questions/${question.id}`" class="block h-full p-4">
            <!-- En-tête avec photo du député et date -->
            <div class="mb-3 flex items-start gap-3">
              <CmsImage
                :src="question.deputy.photo"
                :quality="50"
                :alt="question.deputy.first_name + ' ' + question.deputy.last_name"
                class="h-10 w-10 rounded-full object-cover"
              />
              <div class="flex-1">
                <div class="text-xs text-gray-500 dark:text-gray-300">
                  {{ question.deputy.first_name }}
                  {{ question.deputy.last_name }}
                </div>
                <div class="text-xs text-gray-400 dark:text-gray-400">
                  {{ $dateformat(question.question_date) }}
                </div>
              </div>
            </div>

            <!-- Sujet de la question -->
            <h3 class="line-clamp-3 text-sm font-medium text-gray-900 dark:text-white">
              {{ question.subject }}
            </h3>
          </NuxtLink>
        </div>
      </div>

      <!-- Lien "Voir toute l'activité parlementaire" -->
      <div class="mt-8 text-center">
        <NuxtLink
          to="/assemblee-nationale/questions"
          class="group inline-flex items-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:ring-gray-400 dark:bg-gray-800 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-700 dark:hover:ring-gray-600"
        >
          Voir toute l'activité parlementaire
          <UIcon
            name="i-heroicons-arrow-right"
            class="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
          />
        </NuxtLink>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="!loading && !error && (!questions || questions.length === 0)"
      class="py-8 text-center text-gray-500 dark:text-gray-400"
    >
      Aucune question disponible pour le moment
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAssemblyQuestions } from '~/composables/useAssemblyQuestions';

const { questions, loading, error } = useAssemblyQuestions();
</script>
