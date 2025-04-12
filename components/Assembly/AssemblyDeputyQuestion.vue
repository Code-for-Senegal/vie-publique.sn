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
          @click="isModalOpen = true"
          label="Voir toutes les questions"
          icon="i-heroicons-arrow-right"
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
              @click="isModalOpen = false"
              aria-label="Fermer"
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

const loadingQuestions = ref(true);
const questions = ref<Question[]>([]);
const isModalOpen = ref(false);

// Calculer les 3 dernières questions à afficher
const displayedQuestions = computed(() => {
  return questions.value.slice(0, 3);
});

const fetchDeputyQuestions = async () => {
  try {
    const config = useRuntimeConfig();
    const fields = "id,subject,question_date";
    const sort = `sort=-question_date`;
    const filters = `filter[status]=published`;
    const response = await fetch(
      `${config.public.cmsApiUrl}/items/assembly_question?fields=${fields}&${sort}&filter[deputy][id][_eq]=${props.deputy.id}&${filters}&limit=2000`,
      {
        headers: {
          Authorization: `Bearer ${config.public.cmsApiKey}`,
        },
      },
    );

    if (!response.ok)
      throw new Error("Erreur lors du chargement des questions");

    const data = await response.json();
    questions.value = data.data;
  } catch (error) {
    console.error(error);
  } finally {
    loadingQuestions.value = false;
  }
};

onMounted(() => {
  if (props.deputy?.id) {
    fetchDeputyQuestions();
  }
});
</script>
