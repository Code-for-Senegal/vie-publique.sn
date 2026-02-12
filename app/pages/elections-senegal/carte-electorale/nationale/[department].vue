<!-- pages/elections-senegal/carte-electorale/nationale/[department].vue -->
<script setup lang="ts">
import type { PollingStation } from "~~/types/election-map-national";
import { useElectoralDashboard } from '~/composables/elections/dashboard/useElectoralDashboard';

const route = useRoute();
const router = useRouter();
const department = decodeURIComponent(route.params.department as string);

// Récupérer l'ID de l'élection depuis les query params
const electionId = computed(() => route.query.election as string | undefined);
const electionType = computed(() => route.query.type as string | undefined);
const electionYear = computed(() => route.query.year as string | undefined);

// Récupérer le nom de l'élection depuis la config
const { config } = useElectoralDashboard();
const electionName = computed(() => {
  if (!config.value?.elections || !electionId.value) return null;
  const election = config.value.elections.find(e => String(e.id) === electionId.value);
  return election?.name || null;
});

// État local initialisé avec les query params de l'URL pour partage
const search = ref((route.query.q as string) || "");
const pageSize = ref(10);
const sortBy = ref((route.query.sort as string) || "municipality");
const sortDesc = ref(route.query.order === "desc");
const isRefreshing = ref(false);
const selectedMunicipality = ref((route.query.commune as string) || "");

// Initialisation du composable SSR avec l'ID d'élection
const { fetchDepartmentDetails, getDepartmentStats } = useElectionData({
  electionId,
});

// Charger les données avec le cache et SSR
const {
  data: details,
  pending: detailsPending,
  error: detailsError,
  refresh: refreshDetails,
} = await fetchDepartmentDetails(department);

// Charger les statistiques avec SSR
const {
  data: stats,
  pending: statsPending,
  error: statsError,
  refresh: refreshStats,
} = await getDepartmentStats(department);

// Colonnes du tableau
const columns = [
  {
    key: "polling_place",
    label: "Lieu de vote",
    sortable: true,
  },
  {
    key: "office_number",
    label: "N° Bureau",
    sortable: true,
    class: "text-right",
  },
  {
    key: "voters",
    label: "Électeurs",
    sortable: true,
    class: "text-right",
  },
  {
    key: "implantation",
    label: "Implantation",
    sortable: true,
  },
];

// Filtrage et tri des données
const filteredDetails = computed(() => {
  if (!details.value) return [];

  let filtered = [...details.value];

  // Filtre par commune
  if (selectedMunicipality.value) {
    filtered = filtered.filter(
      (item) => item.municipality === selectedMunicipality.value
    );
  }

  // Recherche
  if (search.value) {
    const searchLower = search.value.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.municipality.toLowerCase().includes(searchLower) ||
        item.polling_place.toLowerCase().includes(searchLower) ||
        item.implantation?.toLowerCase().includes(searchLower)
    );
  }

  // Tri
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof PollingStation];
    const bValue = b[sortBy.value as keyof PollingStation];

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDesc.value
        ? bValue.localeCompare(aValue, "fr")
        : aValue.localeCompare(bValue, "fr");
    }

    return sortDesc.value
      ? Number(bValue) - Number(aValue)
      : Number(aValue) - Number(bValue);
  });

  return filtered;
});

// Gestion du tri
const handleSort = (column: string) => {
  if (sortBy.value === column) {
    sortDesc.value = !sortDesc.value;
  } else {
    sortBy.value = column;
    sortDesc.value = false;
  }
};

// Fonction de rafraîchissement
const handleRefresh = async () => {
  if (isRefreshing.value) return;

  isRefreshing.value = true;
  try {
    await Promise.all([refreshDetails(), refreshStats()]);
  } finally {
    isRefreshing.value = false;
  }
};

// Calcul des statistiques locales
const localStats = computed(() => {
  if (!filteredDetails.value.length) return null;

  return {
    totalVoters: filteredDetails.value.reduce(
      (sum, item) => sum + item.voters,
      0
    ),
    totalOffices: filteredDetails.value.length,
    uniqueMunicipalities: new Set(
      filteredDetails.value.map((item) => item.municipality)
    ).size,
    uniquePollingPlaces: new Set(
      filteredDetails.value.map((item) => item.polling_place)
    ).size,
  };
});

const pending = computed(() => detailsPending.value || statsPending.value);
const error = computed(() => detailsError.value || statsError.value);

function formatNumber(value: number | string | undefined) {
  if (value === undefined || value === null) return "N/A";
  const num = typeof value === "string" ? parseInt(value) : value;
  return isNaN(num) ? "N/A" : num.toLocaleString("fr-FR");
}

const municipalities = computed(() => {
  if (!details.value) return [];
  return [...new Set(details.value.map((item) => item.municipality))].sort();
});

// Construire l'URL de retour avec le contexte de l'élection
const backUrl = computed(() => {
  const query: Record<string, string> = {};
  if (electionId.value) query.election = electionId.value;
  if (electionType.value) query.type = electionType.value;
  if (electionYear.value) query.year = electionYear.value;

  return {
    path: "/elections-senegal/carte-electorale",
    query,
  };
});

// Titre de la page avec contexte élection (utilise le nom de l'élection)
const pageTitle = computed(() => {
  let title = `Département ${department}`;
  if (electionName.value) {
    title += ` - ${electionName.value}`;
  } else if (electionType.value && electionYear.value) {
    title += ` - ${electionType.value} ${electionYear.value}`;
  }
  return title;
});

// Synchroniser les filtres et recherche avec l'URL
watch(
  [search, selectedMunicipality, sortBy, sortDesc],
  ([newSearch, newMunicipality, newSort, newDesc]) => {
    const query: Record<string, string> = {};

    // Conserver les params de l'élection
    if (electionId.value) query.election = electionId.value;
    if (electionType.value) query.type = electionType.value;
    if (electionYear.value) query.year = electionYear.value;

    if (newSearch) query.q = newSearch;
    if (newMunicipality) query.commune = newMunicipality;
    if (newSort && newSort !== "municipality") query.sort = newSort;
    if (newDesc) query.order = "desc";

    router.replace({
      query: Object.keys(query).length > 0 ? query : undefined,
    });
  }
);

// SEO avec Open Graph
useSeoMeta({
  title: () => `${pageTitle.value} | Carte Électorale Sénégal`,
  description: () => electionName.value
    ? `Carte électorale du département ${department} pour ${electionName.value} - Liste des bureaux de vote, communes et électeurs.`
    : `Carte électorale du département ${department} - Liste des bureaux de vote, communes et électeurs.`,
  ogTitle: () => pageTitle.value,
  ogDescription: () => `Découvrez les bureaux de vote et statistiques électorales du département ${department}.`,
});
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 p-4">
    <!-- Breadcrumb -->
    <UBreadcrumb
      :links="[
        { label: 'Accueil', to: '/' },
        { label: 'Carte électorale', to: backUrl },
        { label: department },
      ]"
    />

    <!-- En-tête avec navigation retour -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex items-center gap-4">
        <UButton
          icon="i-heroicons-arrow-left"
          variant="ghost"
          :to="backUrl"
        />
        <h1 class="text-xl font-bold dark:text-white sm:text-2xl">
          {{ department }}
        </h1>
      </div>
    </div>

    <!-- Statistiques globales -->
    <div v-if="stats" class="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
      <UCard class="custom-shadow bg-gray-50 dark:bg-gray-800">
        <div class="text-center">
          <div class="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Total Électeurs
          </div>
          <div
            class="text-xl font-semibold tabular-nums text-red-700 dark:text-red-500 sm:text-2xl md:text-4xl"
          >
            {{ formatNumber(stats.sum?.voters) }}
          </div>
        </div>
      </UCard>
      <UCard class="custom-shadow bg-gray-50 dark:bg-gray-800">
        <div class="text-center">
          <div class="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Communes
          </div>
          <div
            class="text-xl font-semibold tabular-nums text-red-700 dark:text-red-500 sm:text-2xl md:text-4xl"
          >
            {{ formatNumber(stats.countDistinct?.municipality) }}
          </div>
        </div>
      </UCard>
      <UCard class="custom-shadow bg-gray-50 dark:bg-gray-800">
        <div class="text-center">
          <div class="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Lieux de vote
          </div>
          <div
            class="text-xl font-semibold tabular-nums text-red-700 dark:text-red-500 sm:text-2xl md:text-4xl"
          >
            {{ formatNumber(stats.countDistinct?.polling_place) }}
          </div>
        </div>
      </UCard>
      <UCard class="custom-shadow bg-gray-50 dark:bg-gray-800">
        <div class="text-center">
          <div class="text-xs text-gray-500 dark:text-gray-400 sm:text-sm">
            Bureaux
          </div>
          <div
            class="text-xl font-semibold tabular-nums text-red-700 dark:text-red-500 sm:text-2xl md:text-4xl"
          >
            {{ formatNumber(stats.count?.office_number) }}
          </div>
        </div>
      </UCard>
    </div>

    <!-- Filtres -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
      <!-- Barre de recherche -->
      <UInput
        v-model="search"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher une commune, un lieu de vote..."
        class="w-full sm:max-w-sm"
      />

      <!-- Select Commune -->
      <USelect
        v-model="selectedMunicipality"
        :options="municipalities"
        placeholder="Filtrer par commune"
        option-attribute="name"
        searchable
        clearable
        class="w-full sm:max-w-sm"
      >
        <template #prefix>
          <UIcon
            name="i-heroicons-building-office-2"
            class="h-4 w-4 text-gray-500"
          />
        </template>
      </USelect>
    </div>

    <!-- État de chargement -->
    <div v-if="pending" class="flex justify-center py-8">
      <UIcon
        name="i-heroicons-arrow-path"
        class="h-8 w-8 animate-spin text-primary-500"
      />
    </div>

    <!-- Message d'erreur -->
    <UAlert
      v-else-if="error"
      color="red"
      variant="solid"
      :title="error.message"
    >
      <template #description>
        Une erreur est survenue lors du chargement des données.
        <UButton variant="link" color="white" @click="handleRefresh">
          Réessayer
        </UButton>
      </template>
    </UAlert>

    <!-- Tableau des données -->
    <template v-else>
      <div class="overflow-x-auto">
        <UTable
          :rows="filteredDetails"
          :columns="columns"
          hover
          caption="Liste des bureaux de vote"
        >
          <template #header-cell="{ column }">
            <div
              v-if="column.sortable"
              class="flex cursor-pointer items-center gap-2"
              @click="handleSort(column.key)"
            >
              {{ column.label }}
              <UIcon
                v-if="sortBy === column.key"
                :name="
                  sortDesc
                    ? 'i-heroicons-chevron-down'
                    : 'i-heroicons-chevron-up'
                "
                class="h-4 w-4"
              />
            </div>
            <div v-else>
              {{ column.label }}
            </div>
          </template>

          <!-- Formatage des nombres -->
          <template #cell-voters="{ row }">
            <span class="tabular-nums">
              {{ row.voters.toLocaleString("fr-FR") }}
            </span>
          </template>
        </UTable>
      </div>

      <!-- Message si aucun résultat -->
      <div
        v-if="filteredDetails.length === 0"
        class="py-8 text-center text-gray-500 dark:text-gray-400"
      >
        Aucun bureau de vote ne correspond à votre recherche.
      </div>

      <!-- Stats de la recherche -->
      <div
        v-if="localStats"
        class="mt-6 rounded-lg bg-gray-50 p-4 dark:bg-gray-800"
      >
        <div class="text-sm text-gray-600 dark:text-gray-300">
          Résultats filtrés :
          <span class="font-medium">{{ filteredDetails.length }}</span>
          bureau(x) de vote,
          <span class="font-medium">{{
            localStats.uniqueMunicipalities
          }}</span>
          commune(s),
          <span class="font-medium">{{ localStats.uniquePollingPlaces }}</span>
          lieu(x) de vote,
          <span class="font-medium text-red-700 dark:text-red-500">{{
            localStats.totalVoters.toLocaleString("fr-FR")
          }}</span>
          électeurs
        </div>
      </div>
    </template>
  </div>
</template>
