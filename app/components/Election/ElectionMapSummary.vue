<script setup lang="ts">
interface Props {
  electionId?: string | number | null;
}

const props = withDefaults(defineProps<Props>(), {
  electionId: null,
});

interface SummaryResponse {
  total: {
    voters: number;
    offices: number;
    places: number;
    departments: number;
  };
  national: {
    voters: number;
    offices: number;
    places: number;
    departments: number;
    municipalities: number;
  };
  diaspora: {
    voters: number;
    offices: number;
    places: number;
    countries: number;
    localities: number;
    diplomaticRepresentations: number;
  };
}

// Convertir electionId en computed pour la réactivité
const electionIdRef = computed(() => props.electionId);

// Construire les paramètres de requête avec l'ID d'élection
const queryParams = computed(() => {
  const params: Record<string, string> = {};
  if (electionIdRef.value) {
    params.election = String(electionIdRef.value);
  }
  return params;
});

// Récupérer les données du résumé
const { data: summaryData, pending } = await useFetch<SummaryResponse>(
  "/api/elections/map/summary",
  {
    key: computed(() => `election-summary-${electionIdRef.value || 'all'}`),
    query: queryParams,
    watch: [electionIdRef],
  }
);

// Formater les nombres
const formatNumber = (value: number | undefined) => {
  if (value === undefined || value === null) return "0";
  return value.toLocaleString("fr-FR");
};

// Sections de statistiques calculées dynamiquement
const statSections = computed(() => {
  const data = summaryData.value;
  if (!data) return [];

  return [
    {
      title: "Total",
      color: "gray",
      stats: [
        {
          label: "Électeurs",
          value: formatNumber(data.total.voters),
          icon: "i-heroicons-users",
        },
        {
          label: "Lieux de vote",
          value: formatNumber(data.total.places),
          icon: "i-heroicons-map-pin",
        },
        {
          label: "Bureaux de vote",
          value: formatNumber(data.total.offices),
          icon: "i-heroicons-building-office",
        },
        {
          label: "Départements",
          value: formatNumber(data.total.departments),
          icon: "i-heroicons-map",
        },
      ],
    },
    {
      title: "Diaspora",
      color: "gray",
      stats: [
        {
          label: "Électeurs",
          value: formatNumber(data.diaspora.voters),
          icon: "i-heroicons-users",
        },
        {
          label: "Bureaux de vote",
          value: formatNumber(data.diaspora.offices),
          icon: "i-heroicons-building-office",
        },
        {
          label: "Lieux de vote",
          value: formatNumber(data.diaspora.places),
          icon: "i-heroicons-map-pin",
        },
        {
          label: "Pays",
          value: formatNumber(data.diaspora.countries),
          icon: "i-heroicons-globe-americas",
        },
        {
          label: "Représentations diplomatiques",
          value: formatNumber(data.diaspora.diplomaticRepresentations),
          icon: "i-heroicons-home-modern",
        },
        {
          label: "Localités",
          value: formatNumber(data.diaspora.localities),
          icon: "i-heroicons-map",
        },
      ],
    },
    {
      title: "Nationale",
      color: "gray",
      stats: [
        {
          label: "Électeurs",
          value: formatNumber(data.national.voters),
          icon: "i-heroicons-users",
        },
        {
          label: "Lieux de vote",
          value: formatNumber(data.national.places),
          icon: "i-heroicons-map-pin",
        },
        {
          label: "Bureaux de vote",
          value: formatNumber(data.national.offices),
          icon: "i-heroicons-building-office",
        },
        {
          label: "Départements",
          value: formatNumber(data.national.departments),
          icon: "i-heroicons-map",
        },
      ],
    },
  ];
});
</script>

<template>
  <!-- État de chargement -->
  <div v-if="pending" class="flex justify-center py-8">
    <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin text-primary-500" />
  </div>

  <template v-else>
    <!-- En-tête -->
    <h2 class="mb-4 text-center text-2xl font-bold text-gray-800 dark:text-white">
      Résumé du fichier électoral
    </h2>

    <!-- Sections -->
    <div
      v-for="section in statSections"
      :key="section.title"
      class="mb-4 mt-2 space-y-2"
    >
      <!-- Titre de section avec barres -->
      <div class="flex items-center justify-center gap-4 px-4">
        <div :class="`h-[1px] w-full bg-${section.color}-300`"></div>
        <h3 class="text-lg font-bold dark:text-white" :class="`text-${section.color}-700`">
          {{ section.title }}
        </h3>
        <div :class="`h-[1px] w-full bg-${section.color}-300`"></div>
      </div>

      <!-- Grille de stats -->
      <div class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <UCard
          v-for="stat in section.stats"
          :key="stat.label"
          class="custom-shadow bg-gray-50"
        >
          <div class="mb-1 flex items-center justify-between">
            <span class="flex items-center gap-2 text-sm text-gray-600 dark:text-white">
              <UIcon :name="stat.icon" class="h-4 w-4 transition-colors" />
              {{ stat.label }}
            </span>
          </div>
          <div
            class="text-2xl font-bold text-red-700 transition-colors md:text-3xl"
          >
            {{ stat.value }}
          </div>
        </UCard>
      </div>
    </div>
  </template>
</template>

<style scoped>
.border {
  @apply border-gray-200;
}

.group:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}
</style>
