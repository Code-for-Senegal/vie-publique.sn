<!-- components/TableauDepartements.vue -->
<script setup lang="ts">
import type { DepartmentStats } from "~/types/election-map-national";
// import { useElectionData } from "~/composables/useElectionData";

// Initialisation du composable
const { fetchDepartmentsStats, refreshData } = useElectionData();

// État local
const search = ref("");
const page = ref(1);
const pageSize = ref(20);
const sortBy = ref("department");
const sortDesc = ref(false);
const isRefreshing = ref(false);

// Charger les données avec le cache
const {
  data: departments,
  pending,
  error,
  refresh,
} = await fetchDepartmentsStats();

// Filtrage et tri des données
const filteredDepartments = computed(() => {
  if (!departments.value) return [];

  let filtered = [...departments.value];

  // Recherche
  if (search.value) {
    const searchLower = search.value.toLowerCase().trim();
    filtered = filtered.filter((dept) =>
      dept.department.toLowerCase().includes(searchLower),
    );
  }

  // Tri
  filtered.sort((a, b) => {
    const aValue = a[sortBy.value as keyof DepartmentStats];
    const bValue = b[sortBy.value as keyof DepartmentStats];

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

// Pagination
const paginatedDepartments = computed(() => {
  const start = (page.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return filteredDepartments.value.slice(start, end);
});

const totalPages = computed(() =>
  Math.ceil(filteredDepartments.value.length / pageSize.value),
);

// Navigation
const router = useRouter();

const handleRowClick = (row: DepartmentStats) => {
  router.push(
    `/elections/legislatives/carte-electorale/nationale/${row.department}`,
  );
};

// Gestion du tri
const handleSort = (column: string) => {
  console.log("handleSort", column);
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
    await refreshData();
    await refresh();
  } finally {
    isRefreshing.value = false;
  }
};

// Reset de la pagination quand la recherche change
watch(search, () => {
  page.value = 1;
});
</script>

<template>
  <UCard class="mx-auto max-w-7xl">
    <template #header>
      <div class="flex items-center justify-between">
        <h2 class="text-xl font-bold">Départements</h2>
        <UInput
          v-model="search"
          icon="i-heroicons-magnifying-glass"
          placeholder="Rechercher un département..."
          class="max-w-sm"
        />
      </div>
    </template>

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

    <!-- Tableau -->
    <template v-else>
      <UTable
        :rows="filteredDepartments"
        :columns="[
          { key: 'department', label: 'Département', sortable: true },
          { key: 'sum.voters', label: 'Total Électeurs' },
          { key: 'countDistinct.municipality', label: 'Communes' },
          { key: 'count.polling_place', label: 'Lieux' },
          { key: 'count.office_number', label: 'Bureaux' },
        ]"
        hover
        select-mode="click"
        :loading="!departments"
        @select="handleRowClick"
      >
        <template #header-cell="{ column }">
          <div
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
        </template>

        <!-- Formatage des nombres -->
        <template #cell-sum_voters="{ row }">
          <span class="tabular-nums">
            {{ row.sum_voters.toLocaleString("fr-FR") }}
          </span>
        </template>
      </UTable>

      <!-- Message si aucun résultat -->
      <div
        v-if="filteredDepartments.length === 0"
        class="py-8 text-center text-gray-500"
      >
        Aucun département ne correspond à votre recherche.
      </div>

      <!-- Pagination -->
      <UPagination
        v-if="totalPages > 1"
        v-model="page"
        :total="totalPages"
        :ui="{
          wrapper: 'flex items-center justify-center gap-1 mt-4',
          rounded: 'rounded-full',
        }"
      />

      <!-- Stats totales -->
      <div v-if="departments" class="mt-6 text-right text-sm text-gray-500">
        Total : {{ filteredDepartments.length }} département(s)
      </div>
    </template>
  </UCard>
</template>
