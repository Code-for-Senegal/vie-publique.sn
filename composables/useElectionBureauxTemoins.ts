// composables/useBureauxTemoins.ts
import { ref, computed } from "vue";

export const useBureauxTemoins = () => {
  const bureaux = ref([]);
  const loading = ref(true);
  const filterLoading = ref(false); // Ajout de l'état de chargement des filtres
  const error = ref(null);
  const filteredData = ref([]); // Nouvelle ref pour stocker les données filtrées

  // Filtres
  const selectedRegion = ref("");
  const selectedDepartement = ref("");
  const searchQuery = ref("");
  const currentSort = ref({ key: "", direction: "asc" });

  // Liste unique des régions et départements
  const regions = computed(() => {
    const uniqueRegions = [...new Set(bureaux.value.map((b) => b.region))];
    return uniqueRegions.sort();
  });

  const departements = computed(() => {
    let deps = bureaux.value
      .filter((b) => !selectedRegion.value || b.region === selectedRegion.value)
      .map((b) => b.departement);
    return [...new Set(deps)].sort();
  });

  // Statistiques globales (non filtrées)
  const globalStats = computed(() => {
    const uniqueRegions = new Set(bureaux.value.map((b) => b.region));
    const uniqueDepartements = new Set(bureaux.value.map((b) => b.departement));
    const uniqueCommunes = new Set(bureaux.value.map((b) => b.commune));
    const uniqueLieuxDeVote = new Set(bureaux.value.map((b) => b.lieuDeVote)); // Ajout cette ligne

    return {
      totalBureaux: bureaux.value.length,
      regions: uniqueRegions.size,
      departements: uniqueDepartements.size,
      communes: uniqueCommunes.size,
      lieuxDeVote: uniqueLieuxDeVote.size, // Ajout cette ligne
      electeurs: bureaux.value.reduce((sum, b) => sum + b.electeurs, 0),
    };
  });

  // Nombre de résultats filtrés
  const filteredCount = computed(() => filteredBureaux.value.length);

  // Fonction de filtrage séparée
  const applyFilters = () => {
    filterLoading.value = true;

    try {
      // On repart TOUJOURS des données originales
      let filtered = [...bureaux.value];

      // Application des filtres en séquence
      if (selectedRegion.value) {
        filtered = bureaux.value.filter(
          (b) => b.region === selectedRegion.value,
        );
      }

      if (selectedDepartement.value) {
        filtered = filtered.filter(
          (b) => b.departement === selectedDepartement.value,
        );
      }

      // Recherche textuelle
      if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase().trim();
        filtered = filtered.filter(
          (b) =>
            b.region.toLowerCase().includes(query) ||
            b.departement.toLowerCase().includes(query) ||
            b.commune.toLowerCase().includes(query) ||
            b.lieuDeVote.toLowerCase().includes(query),
        );
      }

      // Tri
      if (currentSort.value.key) {
        const { key, direction } = currentSort.value;
        filtered.sort((a, b) => {
          const aValue = a[key];
          const bValue = b[key];
          const modifier = direction === "asc" ? 1 : -1;

          if (typeof aValue === "string") {
            return modifier * aValue.localeCompare(bValue);
          }
          return modifier * (aValue > bValue ? 1 : -1);
        });
      }

      // Mise à jour des données filtrées
      filteredData.value = filtered;
    } finally {
      setTimeout(() => {
        filterLoading.value = false;
      }, 300);
    }
  };

  // Filtrage des bureaux
  // Le computed retourne maintenant simplement les données filtrées
  const filteredBureaux = computed(() => filteredData.value);

  // Watchers pour déclencher le filtrage
  watch([selectedRegion, selectedDepartement, searchQuery, currentSort], () => {
    applyFilters();
  });

  // Watch spécifique pour réinitialiser le département quand la région change
  watch(selectedRegion, () => {
    selectedDepartement.value = "";
  });

  // Récupération des données
  const fetchBureaux = async () => {
    loading.value = true;
    error.value = null;
    try {
      const config = useRuntimeConfig();
      const response = await fetch(
        config.public.sunuElectionApiUrl + "/bureaux/temoins",
        {
          headers: {
            "api-key": config.public.sunuElectionApiKey,
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      bureaux.value = await response.json();
      applyFilters(); // Ajout de cette ligne pour initialiser les données filtrées
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Une erreur est survenue";
      bureaux.value = [];
      filteredData.value = []; // Réinitialiser aussi les données filtrées en cas d'erreur
    } finally {
      loading.value = false;
    }
  };

  // Tri
  const sortBy = (key: string) => {
    if (currentSort.value.key === key) {
      currentSort.value.direction =
        currentSort.value.direction === "asc" ? "desc" : "asc";
    } else {
      currentSort.value = { key, direction: "asc" };
    }
  };

  // Reset des filtres
  const resetFilters = () => {
    selectedRegion.value = "";
    selectedDepartement.value = "";
    searchQuery.value = "";
    currentSort.value = { key: "", direction: "asc" };
  };

  return {
    bureaux,
    loading,
    error,
    selectedRegion,
    selectedDepartement,
    searchQuery,
    currentSort,
    regions,
    departements,
    globalStats,
    filteredCount,
    filteredBureaux,
    fetchBureaux,
    sortBy,
    resetFilters,
    filterLoading,
  };
};
