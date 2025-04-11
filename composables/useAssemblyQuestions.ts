// composables/useAssemblyQuestions.ts
export const useAssemblyQuestions = () => {
  const questions = ref([]);
  const question = ref<any>(null);
  const loading = ref(true);
  const error = ref(null);

  const fetchAssemblyQuestions = async () => {
    loading.value = true;
    error.value = null;

    console.log(
      "fetchAssemblyQuestions " + useRuntimeConfig().public.cmsApiUrl,
    );

    const sort = `sort=-question_date`;

    const filters = `filter[status]=published`;
    const fields =
      "id,subject,question_date,deputy.id,deputy.first_name,deputy.last_name,deputy.photo";
    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/assembly_question?fields=${fields}&${sort}&${filters}`,
        {
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dataResponse = await response.json();
      questions.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      questions.value = [];
    } finally {
      loading.value = false;
    }
  };

  const fetchAssemblyQuestionById = async (id: string) => {
    loading.value = true;
    error.value = null;

    const fields =
      "id,subject,question_text,question_date,attachments.directus_files_id.id,attachments.directus_files_id.type,deputy.id,deputy.first_name,deputy.last_name,deputy.photo";

    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        `${config.public.cmsApiUrl}/items/assembly_question/${id}?fields=${fields}`,
        {
          headers: {
            Authorization: `Bearer ${config.public.cmsApiKey}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const dataResponse = await response.json();
      question.value = dataResponse.data;
    } catch (e) {
      error.value =
        e instanceof Error
          ? e.message
          : "Erreur lors du chargement des groupes";
      question.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Pour réinitialiser l'état
  const resetCommissions = () => {
    questions.value = [];
    loading.value = false;
    error.value = null;
  };

  // Charger les données initiales
  onMounted(() => {
    fetchAssemblyQuestions();
  });

  return {
    questions,
    loading,
    error,
    fetchAssemblyQuestions,
    question,
    fetchAssemblyQuestionById,
    resetCommissions,
  };
};
