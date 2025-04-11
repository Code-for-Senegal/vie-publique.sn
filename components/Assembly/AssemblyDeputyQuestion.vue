<template>
  <!-- Section Questions -->
  <UCard v-if="deputy">
    <h2 class="mb-4 text-xl font-bold">Questions écrites</h2>

    <div v-if="loadingQuestions" class="flex justify-center py-4">
      <UIcon name="i-heroicons-arrow-path" class="h-6 w-6 animate-spin" />
    </div>

    <div
      v-else-if="questions.length === 0"
      class="py-4 text-center text-gray-500"
    >
      Aucune question référencée
    </div>

    <div v-else class="space-y-4">
      <div
        v-for="question in questions"
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
    </div>
  </UCard>
</template>

<script setup lang="ts">
const props = defineProps<{
  deputy: any;
}>();

const loadingQuestions = ref(true);
const questions = ref([]);

const fetchDeputyQuestions = async () => {
  try {
    const config = useRuntimeConfig();
    const fields = "id,subject,question_date";
    const sort = `sort=-question_date`;
    const response = await fetch(
      `${config.public.cmsApiUrl}/items/assembly_question?fields=${fields}&${sort}&filter[deputy][id][_eq]=${props.deputy.id}`,
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
