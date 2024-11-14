<script setup lang="ts">
const route = useRoute();
const router = useRouter();

const country = computed(() =>
  decodeURIComponent(route.params.country as string),
);
const search = ref("");

// Types
interface DiasporaLocation {
  id: number;
  diplomatic_representation: string;
  country: string;
  locality: string;
  polling_place: string;
  office_number: number;
  voters: string;
}

interface CountryStats {
  country: string;
  count: {
    office_number: number;
    polling_place: number;
  };
  sum: {
    voters: number;
  };
  countDistinct: {
    locality: number;
    polling_place: number;
  };
}

// Récupérer les stats globales du pays
const { data: countryStats } = await useFetch<{ data: CountryStats[] }>(
  "https://cms.vie-publique.sn/items/election_map_diaspora",
  {
    params: {
      filter: {
        country: { _eq: country.value },
      },
      groupBy: ["country"],
      aggregate: {
        count: ["office_number", "polling_place"],
        sum: ["voters"],
        countDistinct: ["locality", "polling_place"],
      },
    },
    headers: {
      Authorization: `Bearer ${useRuntimeConfig().public.cmsApiKey}`,
    },
  },
);

// Récupérer les données détaillées du pays avec pagination
const page = ref(1);
const itemsPerPage = 1000;

const { data: countryDetails, pending } = await useFetch<{
  data: DiasporaLocation[];
  meta: { total_count: number };
}>("https://cms.vie-publique.sn/items/election_map_diaspora", {
  params: {
    filter: {
      country: { _eq: country.value },
      ...(search.value
        ? {
            _or: [
              { locality: { _contains: search.value } },
              { polling_place: { _contains: search.value } },
            ],
          }
        : {}),
    },
    sort: ["locality", "polling_place", "office_number"],
    page: page.value,
    limit: itemsPerPage,
  },
  headers: {
    Authorization: `Bearer ${useRuntimeConfig().public.cmsApiKey}`,
  },
  watch: [search, page], // Rafraîchir quand la recherche ou la page change
});

// Calcul du nombre total de pages
const totalPages = computed(() => {
  return countryDetails.value?.meta?.total_count
    ? Math.ceil(countryDetails.value.meta.total_count / itemsPerPage)
    : 0;
});

// Stats du pays pour les badges
const stats = computed(() => {
  const data = countryStats.value?.data?.[0];
  return data
    ? {
        localities: data.countDistinct.locality,
        pollingPlaces: data.countDistinct.polling_place,
        offices: data.count.office_number,
        voters: data.sum.voters,
      }
    : null;
});

const q = ref("");

const filteredRows = computed(() => {
  if (!q.value) {
    return countryDetails.value?.data;
  }

  return countryDetails.value?.data.filter((person) => {
    return Object.values(person).some((value) => {
      return String(value).toLowerCase().includes(q.value.toLowerCase());
    });
  });
});
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 p-4">
    <!-- Breadcrumb -->
    <UBreadcrumb
      :links="[
        { label: 'Accueil', to: '/' },
        { label: 'Diaspora', to: '/elections/legislatives/carte-electorale' },
        { label: country },
      ]"
    />

    <!-- En-tête avec stats -->
    <UCard>
      <template #header>
        <div class="flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <h1 class="text-2xl font-bold">{{ country }}</h1>
            <UButton
              icon="i-heroicons-arrow-left"
              to="'/elections/legislatives/carte-electorale'"
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
                <div class="text-sm text-gray-600">Localités</div>
                <div class="text-2xl font-bold text-red-700 md:text-4xl">
                  {{ stats.localities }}
                </div>
              </div>
            </UCard>

            <UCard class="custom-shadow bg-gray-50">
              <div class="text-center">
                <div class="text-sm text-gray-600">Lieux de vote</div>
                <div class="text-2xl font-bold text-red-700 md:text-4xl">
                  {{ stats.pollingPlaces }}
                </div>
              </div>
            </UCard>

            <UCard class="custom-shadow bg-gray-50">
              <div class="text-center">
                <div class="text-sm text-gray-600">Bureaux</div>
                <div class="text-2xl font-bold text-red-700 md:text-4xl">
                  {{ stats.offices }}
                </div>
              </div>
            </UCard>

            <UCard class="custom-shadow bg-gray-50">
              <div class="text-center">
                <div class="text-sm text-gray-600">Électeurs</div>
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
        <div class="mt-4 flex justify-center" v-if="totalPages > 1">
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
