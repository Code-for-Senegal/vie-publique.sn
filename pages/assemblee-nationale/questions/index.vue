<script setup lang="ts">
const config = useRuntimeConfig();
const { questions, loading, error } = useAssemblyQuestions();

const getImageUrl = (imageId: string) => {
  return `${config.public.cmsApiUrl}/assets/${imageId}`;
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
</script>

<template>
  <div class="container mx-auto px-4 py-4">
    <UBreadcrumb
      class="mt-2"
      :links="[
        { label: 'Accueil', to: '/' },
        { label: '15e législature', to: '/assemblee-nationale' },
        { label: 'Questions' },
      ]"
    />
    <div class="mx-auto max-w-4xl">
      <h1 class="mb-8 text-center text-2xl font-bold md:text-3xl">
        Questions à l'Assemblée
      </h1>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="py-8 text-center text-red-500">
        {{ error }}
      </div>

      <!-- Liste des questions -->
      <div v-else class="space-y-4">
        <UCard
          v-for="question in questions"
          :key="question.id"
          class="transition-all hover:shadow-lg"
        >
          <NuxtLink :to="`/assemblee-nationale/questions/${question.id}`">
            <div class="flex gap-4">
              <!-- Photo du député -->
              <div class="flex-shrink-0">
                <img
                  :src="getImageUrl(question.deputy.photo)"
                  :alt="question.deputy.first_name"
                  class="h-20 w-20 rounded-full object-cover"
                />
              </div>

              <!-- Contenu -->
              <div class="flex-grow">
                <div class="mb-1 text-sm text-gray-500">
                  {{ formatDate(question.question_date) }}
                </div>
                <h2 class="text-normal mb-2 font-medium">
                  {{ question.subject }}
                </h2>
                <div class="text-sm font-medium text-blue-900">
                  {{ question.deputy.first_name }}
                  {{ question.deputy.last_name }}
                </div>
              </div>

              <!-- Flèche -->
              <div class="flex items-center">
                <UIcon
                  name="i-heroicons-chevron-right"
                  class="h-5 w-5 text-gray-400"
                />
              </div>
            </div>
          </NuxtLink>
        </UCard>
      </div>

      <!-- Empty state -->
      <div
        v-if="!loading && !error && questions.length === 0"
        class="py-8 text-center text-gray-500"
      >
        Aucune question trouvée
      </div>
    </div>
  </div>
</template>
