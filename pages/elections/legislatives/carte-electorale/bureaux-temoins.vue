<!-- # pages/elections/bureaux-temoins/index.vue -->
<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Breadcrumb -->
    <UBreadcrumb
      class="mb-6"
      :links="[
        { label: 'Accueil', to: '/' },
        { label: 'Tableau de bord', to: '/elections' },
        { label: 'Bureaux Témoins' },
      ]"
    />

    <div class="mb-8">
      <h1 class="mb-2 text-3xl font-bold">Bureaux Témoins</h1>
      <p class="text-gray-600">Liste des bureaux de vote témoins</p>
    </div>

    <!-- Loading State -->
    <template v-if="loading">
      <div class="space-y-4">
        <USkeleton class="h-32" />
        <USkeleton class="h-64" />
      </div>
    </template>

    <!-- Error State -->
    <UAlert
      v-else-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      class="mb-4"
    >
      {{ error }}
    </UAlert>

    <div v-else>
      <!-- Stats Cards -->
      <div class="mb-8">
        <ElectionBureauxTemoinsStats :stats="globalStats" />
      </div>

      <!-- Filtres -->
      <div class="mb-6 space-y-4">
        <div class="grid grid-cols-1 gap-4 md:grid-cols-3">
          <!-- Recherche -->
          <UInput
            v-model="searchQuery"
            icon="i-heroicons-magnifying-glass"
            placeholder="Rechercher..."
            class="w-full"
          />

          <!-- Sélection Région -->
          <USelect
            v-model="selectedRegion"
            :options="regions"
            placeholder="Filtrer par région"
            class="w-full"
          >
            <template #leading>
              <i class="i-heroicons-map" />
            </template>
          </USelect>

          <!-- Sélection Département -->
          <USelect
            v-model="selectedDepartement"
            :options="departements"
            placeholder="Filtrer par département"
            :disabled="!selectedRegion"
            class="w-full"
          >
            <template #leading>
              <i class="i-heroicons-building-office" />
            </template>
          </USelect>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600">
            <template v-if="filterLoading"> Chargement... </template>
            <template v-else>
              {{ filteredCount }} bureau{{
                filteredCount > 1 ? "x" : ""
              }}
              affiché{{ filteredCount > 1 ? "s" : "" }}
            </template>
          </p>
          <div class="flex space-x-2">
            <UButton
              color="gray"
              variant="soft"
              icon="i-heroicons-arrow-path"
              :loading="loading"
              @click="handleRefresh"
            >
              Actualiser
            </UButton>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark"
              @click="resetFilters"
            >
              Réinitialiser les filtres
            </UButton>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="relative overflow-x-auto rounded-lg bg-white shadow">
        <!-- Overlay de chargement -->
        <div
          v-if="filterLoading"
          class="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-75"
        >
          <UProgress />
        </div>

        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                v-for="header in tableHeaders"
                :key="header.key"
                class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                :class="{ 'cursor-pointer hover:bg-gray-100': header.sortable }"
                @click="header.sortable && sortBy(header.key)"
              >
                <div class="flex items-center space-x-1">
                  <span>{{ header.label }}</span>
                  <template v-if="header.sortable">
                    <i
                      v-if="
                        currentSort.key === header.key &&
                        currentSort.direction === 'asc'
                      "
                      class="i-heroicons-chevron-up h-4 w-4"
                    />
                    <i
                      v-else-if="
                        currentSort.key === header.key &&
                        currentSort.direction === 'desc'
                      "
                      class="i-heroicons-chevron-down h-4 w-4"
                    />
                    <i
                      v-else
                      class="i-heroicons-arrows-up-down h-4 w-4 text-gray-300"
                    />
                  </template>
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200 bg-white">
            <tr
              v-for="bureau in filteredBureaux"
              :key="bureau.lieuDeVote"
              class="hover:bg-gray-50"
            >
              <td class="whitespace-nowrap px-6 py-4">
                {{ bureau.region }}
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                {{ bureau.departement }}
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                {{ bureau.commune }}
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                {{ bureau.lieuDeVote }}
              </td>
              <td class="whitespace-nowrap px-6 py-4 text-right">
                {{ bureau.electeurs.toLocaleString() }}
              </td>
              <td class="whitespace-nowrap px-6 py-4">
                {{ bureau.implantation }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Meta tags
useHead({
  title: "Bureaux Témoins - Législatives 2024",
  meta: [{ name: "robots", content: "noindex" }],
});

const tableHeaders = [
  { key: "region", label: "Région", sortable: true },
  { key: "departement", label: "Département", sortable: true },
  { key: "commune", label: "Commune", sortable: true },
  { key: "lieuDeVote", label: "Lieu de vote", sortable: true },
  { key: "electeurs", label: "Électeurs", sortable: true },
  { key: "implantation", label: "Implantation", sortable: true },
];

const {
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
} = useBureauxTemoins();

// Chargement initial
onMounted(() => {
  fetchBureaux();
});

// Gestion du rafraîchissement
const handleRefresh = () => {
  fetchBureaux();
};
</script>
