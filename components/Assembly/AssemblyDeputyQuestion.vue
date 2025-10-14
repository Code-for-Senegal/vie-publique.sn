<template>
  <!-- Section Questions -->
  <UCard v-if="deputy">
    <h2 class="mb-4 text-xl font-bold">
      <span v-if="questions.length > 1">{{ questions.length }}</span>
      Questions écrites
    </h2>

    <div v-if="loadingQuestions" class="flex justify-center py-4">
      <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin" />
    </div>

    <div
      v-else-if="questions.length === 0"
      class="py-4 text-center text-gray-500"
    >
      Aucune question référencée pour le moment
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="question in displayedQuestions"
        :key="question.id"
        class="transition-all hover:shadow-md"
      >
        <NuxtLink
          :to="`/assemblee-nationale/questions/${question.id}`"
          class="block"
        >
          <div>
            <div class="text-xs text-gray-500">
              {{ $dateformat(question.question_date) }}
            </div>
            <h3 class="font-xs">
              {{ question.subject }}
            </h3>
            <UDivider site="sm" class="mt-4" />
          </div>
        </NuxtLink>
      </div>

      <!-- Bouton "Voir plus" si plus de 3 questions -->
      <div v-if="questions.length > 3" class="mt-4 text-center">
        <UButton
          variant="ghost"
          color="primary"
          label="Voir toutes les questions"
          icon="i-heroicons-arrow-right"
          @click="isModalOpen = true"
        />
      </div>
    </div>

    <!-- Modal pour afficher toutes les questions -->
    <UModal v-model="isModalOpen" :ui="{ width: 'md:max-w-2xl' }">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-bold">
              Toutes les questions écrites ({{ questions.length }})
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              aria-label="Fermer"
              @click="isModalOpen = false"
            />
          </div>
        </template>

        <div class="max-h-[70vh] space-y-4 overflow-y-auto p-1">
          <div
            v-for="question in questions"
            :key="question.id"
            class="transition-all hover:shadow-md"
          >
            <NuxtLink
              :to="`/assemblee-nationale/questions/${question.id}`"
              class="block"
              @click="isModalOpen = false"
            >
              <div>
                <div class="text-xs text-gray-500">
                  {{ $dateformat(question.question_date) }}
                </div>
                <h3 class="font-xs">
                  {{ question.subject }}
                </h3>
                <UDivider site="sm" class="mt-4" />
              </div>
            </NuxtLink>
          </div>
        </div>
      </UCard>
    </UModal>
  </UCard>
</template>

<script setup lang="ts">
interface Deputy {
  id: number | string;
  [key: string]: any;
}

interface Question {
  id: number | string;
  subject: string;
  question_date: string;
  [key: string]: any;
}

const props = defineProps<{
  deputy: Deputy;
}>();

const isModalOpen = ref(false);

// ✅ Utilisation de la nouvelle architecture SSR
const { data, pending: loadingQuestions } = await useFetch<{
  questions: Question[];
}>(`/api/assembly/deputies/${props.deputy.id}/questions`);

const questions = computed(() => data.value?.questions || []);

// Calculer les 3 dernières questions à afficher
const displayedQuestions = computed(() => {
  return questions.value.slice(0, 3);
});
</script>
