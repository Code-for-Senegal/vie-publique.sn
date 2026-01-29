<!-- pages/elections-senegal/carte-electorale/diaspora/[country].vue -->
<script setup lang="ts">
import { useElectoralDashboard } from '~/composables/elections/dashboard/useElectoralDashboard';

/**
 * Page de détails d'un pays de la diaspora
 * Suit le pattern: page -> composable -> server -> Directus
 */

const route = useRoute();
const router = useRouter();

const country = computed(() =>
  decodeURIComponent(route.params.country as string)
);

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

// États réactifs pour la recherche et la pagination
const search = ref("");
const page = ref(1);
const q = ref(""); // Filtre local côté client

// ✅ Utilisation du composable pour récupérer les données avec l'ID d'élection
const { stats, locations, pending, totalPages, refresh } = useDiasporaCountry({
  country: country.value,
  search,
  page,
  limit: 1000,
  electionId,
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
  let title = country.value;
  if (electionName.value) {
    title += ` - ${electionName.value}`;
  } else if (electionType.value && electionYear.value) {
    title += ` - ${electionType.value} ${electionYear.value}`;
  }
  return title;
});

// SEO avec Open Graph
useSeoMeta({
  title: () => `Diaspora ${pageTitle.value} | Carte Électorale Sénégal`,
  description: () => electionName.value
    ? `Carte électorale de la diaspora sénégalaise en ${country.value} pour ${electionName.value} - Liste des bureaux de vote, localités et électeurs.`
    : `Carte électorale de la diaspora sénégalaise en ${country.value} - Liste des bureaux de vote, localités et électeurs.`,
  ogTitle: () => `Diaspora ${pageTitle.value}`,
  ogDescription: () => `Découvrez les bureaux de vote et statistiques électorales de la diaspora en ${country.value}.`,
});
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 p-4">
    <!-- Breadcrumb -->
    <UBreadcrumb
      :links="[
        { label: 'Accueil', to: '/' },
        { label: 'Carte électorale', to: backUrl },
        { label: country },
      ]"
    />

    <!-- En-tête avec stats -->
    <UCard>
      <template #header>
        <div class="flex flex-col gap-4">
          <div
            class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div class="flex items-center gap-3">
              <UButton
                icon="i-heroicons-arrow-left"
                :to="backUrl"
                variant="ghost"
              />
              <h1 class="text-xl font-bold dark:text-white sm:text-2xl">
                {{ pageTitle }}
              </h1>
            </div>
            <UButton
              v-if="!pending"
              icon="i-heroicons-arrow-path"
              variant="soft"
              @click="refresh"
            >
              Actualiser
            </UButton>
          </div>

          <!-- Statistiques en badges -->
          <div
            v-if="stats"
            class="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4"
          >
            <UCard class="custom-shadow bg-gray-50 dark:bg-gray-800">
              <div class="text-center">
                <div
                  class="text-xs text-gray-600 dark:text-gray-400 sm:text-sm"
                >
                  Localités
                </div>
                <div
                  class="text-xl font-bold text-red-700 dark:text-red-500 sm:text-2xl md:text-4xl"
                >
                  {{ stats.localities }}
                </div>
              </div>
            </UCard>

            <UCard class="custom-shadow bg-gray-50 dark:bg-gray-800">
              <div class="text-center">
                <div
                  class="text-xs text-gray-600 dark:text-gray-400 sm:text-sm"
                >
                  Lieux de vote
                </div>
                <div
                  class="text-xl font-bold text-red-700 dark:text-red-500 sm:text-2xl md:text-4xl"
                >
                  {{ stats.pollingPlaces }}
                </div>
              </div>
            </UCard>

            <UCard class="custom-shadow bg-gray-50 dark:bg-gray-800">
              <div class="text-center">
                <div
                  class="text-xs text-gray-600 dark:text-gray-400 sm:text-sm"
                >
                  Bureaux
                </div>
                <div
                  class="text-xl font-bold text-red-700 dark:text-red-500 sm:text-2xl md:text-4xl"
                >
                  {{ stats.offices }}
                </div>
              </div>
            </UCard>

            <UCard class="custom-shadow bg-gray-50 dark:bg-gray-800">
              <div class="text-center">
                <div
                  class="text-xs text-gray-600 dark:text-gray-400 sm:text-sm"
                >
                  Électeurs
                </div>
                <div
                  class="text-xl font-bold text-red-700 dark:text-red-500 sm:text-2xl md:text-4xl"
                >
                  {{ stats.voters?.toLocaleString("fr-FR") }}
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
          class="w-full sm:max-w-sm"
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
                class="h-8 w-8 animate-spin text-primary-500"
              />
            </div>
          </template>

          <template #empty-state>
            <div
              class="flex flex-col items-center justify-center px-4 py-6 text-gray-500 dark:text-gray-400"
            >
              <UIcon name="i-heroicons-inbox" class="mb-2 h-8 w-8" />
              <p v-if="q">Aucun résultat trouvé pour "{{ q }}"</p>
              <p v-else>Aucune donnée disponible</p>
            </div>
          </template>

          <!-- Formater les nombres -->
          <template #cell-voters="{ row }">
            {{ parseInt(row.voters).toLocaleString("fr-FR") }}
          </template>
        </UTable>
      </div>

      <!-- Stats de la recherche -->
      <div
        v-if="filteredRows.length > 0"
        class="mt-4 rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
      >
        <div class="text-sm text-gray-600 dark:text-gray-300">
          <span class="font-medium">{{ filteredRows.length }}</span> bureau(x)
          de vote affichés
        </div>
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
                inactive:
                  'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600',
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
