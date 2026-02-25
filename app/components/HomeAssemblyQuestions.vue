<script setup lang="ts">
import { useAssemblyQuestions } from '~/composables/useAssemblyQuestions';

const { questions, loading, error } = useAssemblyQuestions();
</script>

<template>
  <section class="my-4" aria-labelledby="questions-heading">
    <h2
      id="questions-heading"
      class="mb-4 text-center text-xl font-semibold text-gray-800 dark:text-white"
    >
      Dernières initiatives parlementaires
    </h2>

    <!-- Loading state -->
    <div
      v-if="loading"
      class="no-scrollbar flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-1 pb-4 pt-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
      aria-busy="true"
    >
      <div
        v-for="n in 3"
        :key="n"
        class="w-56 flex-shrink-0 snap-start rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 md:w-auto md:flex-shrink md:p-4 dark:bg-gray-800 dark:ring-gray-700/50"
      >
        <div class="flex items-center gap-2.5">
          <USkeleton class="h-9 w-9 flex-shrink-0 rounded-full md:h-10 md:w-10" />
          <div class="flex-1 space-y-1.5">
            <USkeleton class="h-3 w-20" />
            <USkeleton class="h-2.5 w-14" />
          </div>
        </div>
        <div class="mt-2.5 space-y-1.5">
          <USkeleton class="h-3 w-full" />
          <USkeleton class="h-3 w-full" />
          <USkeleton class="h-3 w-2/3" />
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
    <div v-else-if="questions && questions.length > 0">
      <div
        class="no-scrollbar flex snap-x snap-mandatory items-start gap-2.5 overflow-x-auto px-1 pb-4 pt-1 md:grid md:grid-cols-3 md:gap-4 md:overflow-x-visible md:px-0 md:pb-0 md:pt-0"
        role="list"
      >
        <article
          v-for="question in questions.slice(0, 3)"
          :key="question.id"
          role="listitem"
          class="w-56 flex-shrink-0 snap-start md:w-auto md:flex-shrink"
        >
          <NuxtLink
            :to="`/assemblee-nationale/questions/${question.id}`"
            :aria-label="`Voir la question de ${question.deputy.first_name} ${question.deputy.last_name}`"
            class="block h-full rounded-xl bg-white p-3 shadow-sm ring-1 ring-gray-100 transition-all active:scale-[0.98] md:p-4 md:hover:shadow-md dark:bg-gray-800 dark:ring-gray-700/50"
          >
            <!-- Deputy header -->
            <div class="flex items-center gap-2.5">
              <CmsImage
                :src="question.deputy.photo"
                :quality="50"
                :fallback="'/unknown_member.webp'"
                :alt="`${question.deputy.first_name} ${question.deputy.last_name}`"
                class="h-9 w-9 flex-shrink-0 rounded-full object-cover md:h-10 md:w-10"
              />
              <div class="min-w-0 flex-1">
                <p class="truncate text-[13px] font-semibold text-gray-900 md:text-sm dark:text-white">
                  {{ question.deputy.first_name }} {{ question.deputy.last_name }}
                </p>
                <p class="text-[11px] text-gray-500 md:text-xs dark:text-gray-400">
                  {{ $dateformat(question.question_date) }}
                </p>
              </div>
            </div>

            <!-- Subject - fixed height with line-clamp -->
            <p class="mt-2.5 line-clamp-3 min-h-[3.5rem] text-[12px] leading-relaxed text-gray-600 md:mt-3 md:min-h-[4rem] md:text-sm dark:text-gray-300">
              {{ question.subject }}
            </p>
          </NuxtLink>
        </article>
      </div>

      <!-- CTA -->
      <div class="mt-6 text-center">
        <UButton
          to="/assemblee-nationale/questions"
          color="gray"
          variant="solid"
          size="md"
          trailing-icon="i-heroicons-arrow-right"
          class="bg-white font-medium"
        >
          Voir toute l'activité parlementaire
        </UButton>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-else
      class="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
    >
      Aucune question disponible pour le moment
    </div>
  </section>
</template>

<style scoped>
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
