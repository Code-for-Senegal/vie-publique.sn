<script setup lang="ts">
/**
 * Page de détails d'un pays de la diaspora
 * Suit le pattern: page -> composable -> server -> Directus
 */

const route = useRoute();
const router = useRouter();

const country = computed(() =>
  decodeURIComponent(route.params.country as string),
);

// États réactifs pour la recherche et la pagination
const search = ref("");
const page = ref(1);
const q = ref(""); // Filtre local côté client

// ✅ Utilisation du composable pour récupérer les données
const { stats, locations, pending, totalPages } = useDiasporaCountry({
  country: country.value,
  search,
  page,
  limit: 1000,
});

// Filtrage local côté client (pour le champ de recherche dans le tableau)
const filteredRows = computed(() => {
  if (!q.value) {
    return locations.value;
  }

  return locations.value.filter((location) => {
    return Object.values(location).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});
</script>

<template>
  <div class="mx-auto min-h-screen max-w-7xl space-y-6 p-4 pb-16">
    <AppBreadcrumb :items="[
      { label: 'Élections', to: '/elections' },
      { label: 'Législatives 2024', to: '/elections/legislatives' },
      { label: 'Carte électorale', to: '/elections/legislatives/carte-electorale' },
      { label: 'Diaspora', to: '/elections/legislatives/carte-electorale' },
      { label: country }
    ]" />

    <!-- En-tête avec stats -->
    <UCard>
      <template #header>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">{{ country }}</h1>
            <UButton
              icon="i-heroicons-arrow-left"
              to="/elections/legislatives/carte-electorale"
              variant="ghost"
              @click="router.back()"
            />
          </div>

          <!-- Statistiques en badges -->
          <div
            v-if="stats"
            class="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <UCard class="custom-shadow bg-gray-50">
              <div class="text-center">
                <div class="text-sm text-gray-600 dark:text-white">Localités</div>
                <div class="text-2xl font-bold text-red-700 md:text-4xl">
                  {{ stats.localities }}
                </div>
              </div>
            </UCard>

            <UCard class="custom-shadow bg-gray-50">
              <div class="text-center">
                <div class="text-sm text-gray-600 dark:text-white">Lieux de vote</div>
                <div class="text-2xl font-bold text-red-700 md:text-4xl">
                  {{ stats.pollingPlaces }}
                </div>
              </div>
            </UCard>

            <UCard class="custom-shadow bg-gray-50">
              <div class="text-center">
                <div class="text-sm text-gray-600 dark:text-white">Bureaux</div>
                <div class="text-2xl font-bold text-red-700 md:text-4xl">
                  {{ stats.offices }}
                </div>
              </div>
            </UCard>

            <UCard class="custom-shadow bg-gray-50">
              <div class="text-center">
                <div class="text-sm text-gray-600 dark:text-white">Électeurs</div>
                <div class="text-2xl font-bold text-red-700 md:text-4xl">
                  {{ stats.voters.toLocaleString() }}
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </template>

      <!-- Barre de recherche -->
      <div class="mb-4">
        <UInput
          v-model="q"
          icon="i-heroicons-magnifying-glass"
          placeholder="Rechercher une localité ou lieu de vote..."
          class="max-w-sm"
        />
      </div>

      <!-- Tableau des données -->
      <div class="overflow-x-auto">
        <UTable
          :rows="filteredRows"
          :columns="[
            {
              key: 'locality',
              label: 'Localité',
            },
            {
              key: 'polling_place',
              label: 'Lieu de vote',
            },
            {
              key: 'office_number',
              label: 'Bureau',
            },
            {
              key: 'voters',
              label: 'Électeurs',
              sortable: true,
            },
          ]"
          :loading="pending"
        >
          <template #loading>
            <div class="flex justify-center p-4">
              <UIcon
                name="i-heroicons-arrow-path"
                class="h-8 w-8 animate-spin"
              />
            </div>
          </template>

          <template #empty-state>
            <div
              class="flex flex-col items-center justify-center px-4 py-6 text-gray-500"
            >
              <UIcon name="i-heroicons-inbox" class="mb-2 h-8 w-8" />
              <p v-if="q">Aucun résultat trouvé pour "{{ search }}"</p>
              <p v-else>Aucune donnée disponible</p>
            </div>
          </template>

          <!-- Formater les nombres -->
          <template #cell-voters="{ row }">
            {{ parseInt(row.voters).toLocaleString() }}
          </template>
        </UTable>
      </div>

      <!-- Pagination -->
      <template #footer>
        <div v-if="totalPages > 1" class="mt-4 flex justify-center">
          <UPagination
            v-model="page"
            :total="totalPages"
            :ui="{
              wrapper: 'flex items-center gap-1',
              button: {
                base: 'h-8 w-8 flex items-center justify-center rounded-md disabled:opacity-50 disabled:cursor-not-allowed',
                active: 'bg-primary-500 text-white hover:bg-primary-600',
                inactive: 'bg-gray-100 hover:bg-gray-200',
              },
            }"
          />
        </div>
      </template>
    </UCard>
  </div>
</template>

<style scoped>
.u-table th {
  @apply whitespace-nowrap;
}
</style>
