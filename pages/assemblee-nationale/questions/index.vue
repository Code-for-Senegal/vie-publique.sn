<script setup lang="ts">
const config = useRuntimeConfig();
const { questions, loading, error } = useAssemblyQuestions();

const getImageUrl = (imageId: string) => {
  return `${config.public.cmsApiUrl}/assets/${imageId}`;
};

// Calcul des statistiques
const topDeputies = computed(() => {
  if (!questions.value) return [];

  // Grouper les questions par député
  const questionsByDeputy = questions.value.reduce((acc, question) => {
    const deputyId = question.deputy.id;
    if (!acc[deputyId]) {
      acc[deputyId] = {
        id: deputyId,
        first_name: question.deputy.first_name,
        last_name: question.deputy.last_name,
        photo: question.deputy.photo,
        questionsCount: 0,
      };
    }
    acc[deputyId].questionsCount++;
    return acc;
  }, {});

  // Convertir en tableau et trier
  return Object.values(questionsByDeputy)
    .sort((a, b) => b.questionsCount - a.questionsCount)
    .slice(0, 4);
});
</script>

<template>
  <div class="container mx-auto py-4">
    <NuxtLink
      to="/assemblee-nationale"
      class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800"
    >
      <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
      15e législature Assemblée nationale
    </NuxtLink>

    <div class="mx-auto max-w-4xl">
      <div class="prose prose-sm sm:prose my-2">
        <h1 class="mb-2">Questions écrites</h1>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="py-8 text-center text-red-500">
        {{ error }}
      </div>

      <div v-else>
        <!-- Top députés statistiques -->
        <div class="mb-2 rounded-lg p-0">
          <h2 class="mb-4 text-xl font-bold">Députés les plus actifs</h2>

          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div
              v-for="(deputy, index) in topDeputies"
              :key="deputy.id"
              class="custom-shadow relative flex flex-col items-center rounded-lg bg-white p-4 transition-all hover:shadow-md"
            >
              <!-- Badge position -->
              <div
                class="absolute left-1/2 top-20 -translate-x-1/2 rounded-full px-3 py-1 text-sm font-bold text-white"
                :class="{
                  'bg-yellow-500': index === 0,
                  'bg-gray-400': index === 1,
                  'bg-amber-700': index === 2,
                }"
              >
                {{ index + 1 }}{{ index === 0 ? "er" : "ème" }}
              </div>

              <NuxtLink
                :to="`/assemblee-nationale/deputes/${deputy.id}/${$getSlugifyUrlPath(deputy.first_name + ' ' + deputy.last_name)}`"
                class="flex flex-col items-center"
              >
                <img
                  :src="getImageUrl(deputy.photo)"
                  :alt="deputy.first_name"
                  class="mb-3 h-20 w-20 rounded-full object-cover shadow-sm"
                />
                <div class="text-center">
                  <div class="truncate font-medium capitalize text-gray-900">
                    {{ deputy.first_name.toLowerCase() }}<br />
                    <span class="font-bold tracking-wider">
                      {{ deputy.last_name.toUpperCase() }}
                    </span>
                  </div>
                  <div class="mt-1 text-sm text-gray-500">
                    {{ deputy.questionsCount }} question{{
                      deputy.questionsCount > 1 ? "s" : ""
                    }}
                  </div>
                </div>
              </NuxtLink>
            </div>
          </div>
        </div>

        <!-- Liste des questions -->
        <div class="space-y-2">
          <h2 class="mb-4 text-xl font-bold">Questions des députés</h2>
          <UCard
            v-for="question in questions"
            :key="question.id"
            class="custom-shadow transition-all hover:shadow-lg"
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
                    {{ $dateformat(question.question_date) }}
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
      </div>
    </div>
  </div>
</template>
