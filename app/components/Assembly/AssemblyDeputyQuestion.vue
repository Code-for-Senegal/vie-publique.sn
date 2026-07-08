<template>
  <!-- Section Questions -->
  <section
    v-if="deputy"
    class="rounded-2xl bg-white p-4 ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700 md:p-6"
  >
    <div class="mb-3 flex items-center justify-between">
      <h2 class="text-sm font-bold text-gray-900 dark:text-white md:text-base">
        Questions écrites
        <span v-if="questions.length > 0" class="ml-1 text-blue-600 dark:text-blue-400">
          ({{ questions.length }})
        </span>
      </h2>
      <NuxtLink
        v-if="questions.length > 0"
        to="/assemblee-nationale/questions"
        class="text-xs text-blue-600 hover:underline dark:text-blue-400"
      >
        Voir tout
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loadingQuestions" class="space-y-2">
      <div v-for="i in 3" :key="i" class="flex gap-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-700/50">
        <div class="flex-1 space-y-2">
          <USkeleton class="h-2 w-20" />
          <USkeleton class="h-4 w-full" />
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div
      v-else-if="questions.length === 0"
      class="rounded-xl bg-gray-50 p-4 text-center dark:bg-gray-700/50"
    >
      <UIcon
        name="i-heroicons-chat-bubble-left-right"
        class="mx-auto mb-2 h-8 w-8 text-gray-300 dark:text-gray-600"
      />
      <p class="text-xs text-gray-500 dark:text-gray-400">Aucune question référencée</p>
    </div>

    <!-- Questions List -->
    <div v-else class="space-y-2">
      <NuxtLink
        v-for="question in displayedQuestions"
        :key="question.id"
        :to="`/assemblee-nationale/questions/${question.id}/${question.slug || 'question'}`"
        class="group block rounded-xl bg-gray-50 p-3 transition-all active:scale-[0.99] dark:bg-gray-700/50 md:hover:bg-blue-50 dark:md:hover:bg-blue-900/20"
      >
        <time class="text-[10px] text-gray-400 md:text-xs">
          {{ $dateformat(question.question_date) }}
        </time>
        <h3 class="line-clamp-2 text-xs font-medium text-gray-900 dark:text-white md:text-sm">
          {{ question.subject }}
        </h3>
      </NuxtLink>

      <!-- Voir plus button -->
      <button
        v-if="questions.length > 3"
        class="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-50 p-3 text-sm font-medium text-blue-700 transition-colors active:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 md:hover:bg-blue-100"
        @click="isModalOpen = true"
      >
        <span>Voir les {{ questions.length }} questions</span>
        <UIcon name="i-heroicons-arrow-right" class="h-4 w-4" />
      </button>
    </div>

    <!-- Modal -->
    <UModal v-model="isModalOpen" :ui="{ width: 'sm:max-w-lg' }">
      <div class="rounded-2xl bg-white dark:bg-gray-800">
        <!-- Modal Header -->
        <div
          class="flex items-center justify-between border-b border-gray-100 p-4 dark:border-gray-700"
        >
          <h3 class="text-sm font-bold text-gray-900 dark:text-white md:text-base">
            Questions écrites ({{ questions.length }})
          </h3>
          <button
            class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400"
            @click="isModalOpen = false"
          >
            <UIcon name="i-heroicons-x-mark" class="h-4 w-4" />
          </button>
        </div>

        <!-- Modal Content -->
        <div class="max-h-[60vh] space-y-2 overflow-y-auto p-4">
          <NuxtLink
            v-for="question in questions"
            :key="question.id"
            :to="`/assemblee-nationale/questions/${question.id}/${question.slug || 'question'}`"
            class="group block rounded-xl bg-gray-50 p-3 transition-all active:scale-[0.99] dark:bg-gray-700/50 md:hover:bg-blue-50"
            @click="isModalOpen = false"
          >
            <time class="text-[10px] text-gray-400 md:text-xs">
              {{ $dateformat(question.question_date) }}
            </time>
            <h3 class="line-clamp-2 text-xs font-medium text-gray-900 dark:text-white md:text-sm">
              {{ question.subject }}
            </h3>
          </NuxtLink>
        </div>
      </div>
    </UModal>
  </section>
</template>

<script setup lang="ts">
interface Deputy {
  id: number | string;
  [key: string]: any;
}

interface Question {
  id: number | string;
  subject: string;
  slug?: string;
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
