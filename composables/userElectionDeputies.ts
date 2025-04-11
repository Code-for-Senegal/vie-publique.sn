// composables/useDeputies.ts
export const useDeputies = () => {
  const deputies = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const runtimeConfig = useRuntimeConfig();

  const fetchDeputies = async () => {
    if (loading.value) return;

    loading.value = true;
    error.value = null;

    try {
      // Log pour debugging
      console.log("Fetching deputies...");
      console.log(
        "API Key:",
        runtimeConfig.public.apiKey ? "Present" : "Missing",
      );

      const { data, error: fetchError } = await useFetch(
        "https://cms.vie-publique.sn/items/election_candidates",
        {
          headers: {
            Authorization: `Bearer ${runtimeConfig.public.apiKey}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          query: {
            fields: [
              "id",
              "first_name",
              "last_name",
              "profession",
              "photo",
              "electoral_list.name",
              "electoral_list.type",
            ],
          },
        },
      );

      // Log pour debugging
      console.log("API Response:", data.value);

      if (fetchError.value) {
        console.error("Fetch Error:", fetchError.value);
        throw new Error(
          fetchError.value?.message ||
            "Erreur lors de la récupération des données",
        );
      }

      if (!data.value) {
        throw new Error("Aucune donnée reçue");
      }

      // Vérifier si la réponse contient la propriété data
      if (data.value.data) {
        deputies.value = data.value.data;
      } else {
        deputies.value = Array.isArray(data.value) ? data.value : [];
      }

      // Log pour debugging
      console.log("Processed Deputies:", deputies.value);
    } catch (e) {
      console.error("Detailed Error:", e);
      error.value = "Erreur lors de la récupération des députés";
      deputies.value = [];
    } finally {
      loading.value = false;
    }
  };

  return {
    deputies,
    loading,
    error,
    fetchDeputies,
  };
};
