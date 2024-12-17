<!-- pages/departments/[department].vue -->
<script setup lang="ts">
import type { PollingStation } from "~/types/election-map-national";
import { useElectionData } from "~/composables/useElectionMapNational";

const route = useRoute();
const router = useRouter();
const department = decodeURIComponent(route.params.department as string);

// État local
const search = ref("");
const pageSize = ref(10);
const sortBy = ref("municipality");
const sortDesc = ref(false);
const isRefreshing = ref(false);
const selectedMunicipality = ref("");

// Initialisation du composable
const { fetchDepartmentDetails, getDepartmentStats, refreshData } =
  useElectionData();

// Charger les données avec le cache
const {
  data: details,
  pending: detailsPending,
  error: detailsError,
  refresh: refreshDetails,
} = await fetchDepartmentDetails(department);

// Charger les statistiques
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
      (item) => item.municipality === selectedMunicipality.value,
    );
  }

  // Recherche
  if (search.value) {
    const searchLower = search.value.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.municipality.toLowerCase().includes(searchLower) ||
        item.polling_place.toLowerCase().includes(searchLower) ||
        item.implantation.toLowerCase().includes(searchLower),
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
    await refreshData(department);
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
      0,
    ),
    totalOffices: filteredDetails.value.length,
    uniqueMunicipalities: new Set(
      filteredDetails.value.map((item) => item.municipality),
    ).size,
    uniquePollingPlaces: new Set(
      filteredDetails.value.map((item) => item.polling_place),
    ).size,
  };
});

const pending = computed(() => detailsPending.value || statsPending.value);
const error = computed(() => detailsError.value || statsError.value);

function formatNumber(value) {
  return isNaN(value) ? "N/A" : Number(value).toLocaleString("fr-FR");
}

const municipalities = computed(() => {
  if (!details.value) return [];
  return [...new Set(details.value.map((item) => item.municipality))].sort();
});
</script>

<template>
  <div class="space-y-6 p-4">
    <!-- En-tête avec navigation retour -->
    <div class="mb-6 flex items-center gap-4">
      <UButton
        icon="i-heroicons-arrow-left"
        variant="ghost"
        @click.native="router.back()"
      />
      <h1 class="text-2xl font-bold">Département {{ department }}</h1>
    </div>

    <!-- Statistiques globales -->
    <div v-if="stats" class="grid grid-cols-2 gap-4 md:grid-cols-4">
      <UCard class="custom-shadow bg-gray-50">
        <div class="text-center">
          <div class="text-sm text-gray-500">Total Électeurs</div>
          <div
            class="text-2xl font-semibold tabular-nums text-red-700 md:text-4xl"
          >
            {{ formatNumber(stats.sum.voters) }}
          </div>
        </div></UCard
      >
      <UCard class="custom-shadow bg-gray-50">
        <div class="text-center">
          <div class="text-sm text-gray-500">Communes</div>
          <div
            class="text-2xl font-semibold tabular-nums text-red-700 md:text-4xl"
          >
            {{ stats.countDistinct.municipality }}
          </div>
        </div></UCard
      >
      <UCard class="custom-shadow bg-gray-50">
        <div class="text-center">
          <div class="text-sm text-gray-500">Lieux de vote</div>
          <div
            class="text-2xl font-semibold tabular-nums text-red-700 md:text-4xl"
          >
            {{ stats.countDistinct.polling_place }}
          </div>
        </div></UCard
      >
      <UCard class="custom-shadow bg-gray-50">
        <div class="text-center">
          <div class="text-sm text-gray-500">Bureaux</div>
          <div
            class="text-2xl font-semibold tabular-nums text-red-700 md:text-4xl"
          >
            {{ stats.count.office_number }}
          </div>
        </div>
      </UCard>
    </div>

    <div class="flex flex-col items-center justify-between gap-4 sm:flex-row">
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
        ><template #prefix>
          <UIcon
            name="i-heroicons-building-office-2"
            class="h-4 w-4 text-gray-500"
          />
        </template>
      </USelect>
    </div>

    <!-- État de chargement -->
    <div v-if="pending" class="flex justify-center py-8">
      <UIcon name="i-heroicons-arrow-path" class="h-8 w-8 animate-spin" />
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
                sortDesc ? 'i-heroicons-chevron-down' : 'i-heroicons-chevron-up'
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

      <!-- Message si aucun résultat -->
      <div
        v-if="filteredDetails.length === 0"
        class="py-8 text-center text-gray-500"
      >
        Aucun bureau de vote ne correspond à votre recherche.
      </div>

      <!-- Stats de la recherche -->
      <div v-if="localStats" class="mt-6 rounded-lg bg-gray-50 p-4">
        <div class="text-sm text-gray-600">
          Résultats filtrés :
          {{ filteredDetails.length }} bureau(x) de vote,
          {{ localStats.uniqueMunicipalities }} commune(s),
          {{ localStats.uniquePollingPlaces }} lieu(x) de vote,
          {{ localStats.totalVoters.toLocaleString("fr-FR") }} électeurs
        </div>
      </div>
    </template>
  </div>
</template>
