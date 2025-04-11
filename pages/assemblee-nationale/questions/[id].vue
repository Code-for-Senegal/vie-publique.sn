<script setup lang="ts">
const route = useRoute();
const config = useRuntimeConfig();
const { question, loading, error, fetchAssemblyQuestionById } =
  useAssemblyQuestions();

onMounted(async () => {
  if (route.params.id) {
    await fetchAssemblyQuestionById(route.params.id as string);
  }
});

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

const isImageFile = (fileType: string) => {
  return fileType.startsWith("image/");
};
</script>

<template>
  <div class="container mx-auto py-2">
    <div class="mx-auto max-w-4xl">
      <!-- Bouton retour -->
      <NuxtLink
        to="/assemblee-nationale/questions"
        class="mb-6 inline-flex items-center text-gray-600 hover:text-gray-800"
      >
        <UIcon name="i-heroicons-arrow-left" class="mr-2 h-5 w-5" />
        Retour à la liste
      </NuxtLink>

      <!-- Loading state -->
      <div v-if="loading" class="flex justify-center py-8">
        <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="py-8 text-center text-red-500">
        {{ error }}
      </div>

      <!-- Contenu de la question -->
      <div v-else-if="question" class="space-y-6">
        <!-- En-tête avec info député -->
        <div class="rounded-lg bg-white shadow-sm">
          <NuxtLink
            :to="`/assemblee-nationale/deputes/${question.deputy.id}/${$getSlugifyUrlPath(question.deputy.first_name + ' ' + question.deputy.last_name)}`"
            class="block"
          >
            <div class="mb-6 flex items-center gap-4">
              <img
                :src="getImageUrl(question.deputy.photo)"
                :alt="question.deputy.first_name"
                class="h-20 w-20 rounded-full object-cover"
              />
              <div>
                <h2 class="text-xl font-bold">
                  {{ question.deputy.first_name }}
                  {{ question.deputy.last_name }}
                </h2>
                <div class="text-sm text-gray-500">
                  {{ formatDate(question.question_date) }}
                </div>
              </div>
            </div>
          </NuxtLink>
          <h1 class="mb-4 text-2xl font-bold">
            {{ question.subject }}
          </h1>

          <!-- Corps de la question -->
          <div
            class="prose prose-gray max-w-none"
            v-html="question.question_text"
          ></div>

          <NuxtLink
            :to="`/assemblee-nationale/deputes/${question.deputy.id}/${$getSlugifyUrlPath(question.deputy.first_name + ' ' + question.deputy.last_name)}`"
            class="block text-blue-600 underline"
            >Voir son profil</NuxtLink
          >
        </div>

        <!-- Pièces jointes -->
        <div
          v-if="question.attachments?.length > 0"
          class="rounded-lg bg-white shadow-sm"
        >
          <h3 class="mb-4 text-lg font-bold">Documents joints</h3>
          <div class="grid grid-cols-1 gap-2 md:grid-cols-2">
            <div
              v-for="attachment in question.attachments"
              :key="attachment.directus_files_id.id"
              class="overflow-hidden rounded-lg"
            >
              <!-- Image attachments -->
              <img
                v-if="isImageFile(attachment.directus_files_id.type)"
                :src="getImageUrl(attachment.directus_files_id.id)"
                :alt="'Document joint'"
                class="h-auto w-full rounded border border-gray-200"
              />
              <!-- Non-image attachments -->
              <UButton
                v-else
                :href="getImageUrl(attachment.directus_files_id.id)"
                target="_blank"
                class="w-full"
              >
                <UIcon name="i-heroicons-document" class="mr-2 h-5 w-5" />
                Télécharger le document
              </UButton>
            </div>
          </div>
        </div>
      </div>

      <!-- Not found state -->
      <div v-else class="py-8 text-center text-gray-500">
        Question non trouvée
      </div>
    </div>
  </div>
</template>
