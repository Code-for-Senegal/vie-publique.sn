<template>
  <div>
    <!-- Filtres -->
    <div class="mb-4 grid hidden gap-4 sm:grid-cols-2 md:grid-cols-3">
      <UInput
        v-model="filters.searchTerm"
        icon="i-heroicons-magnifying-glass"
        placeholder="Rechercher une coalition..."
        class="w-full"
      />
      <UInput
        v-model="filters.minVoix"
        type="number"
        icon="i-heroicons-hand-raised"
        placeholder="Voix minimum"
        class="w-full"
      />
      <UInput
        v-model="filters.minPourcentage"
        type="number"
        step="0.01"
        icon="i-heroicons-percent"
        placeholder="Pourcentage minimum"
        class="w-full"
      />
    </div>

    <!-- Tableau -->
    <div class="relative overflow-hidden rounded-lg shadow">
      <!-- En-tête fixe -->
      <div class="sticky top-0 z-10 bg-gray-50">
        <div
          class="grid min-w-full grid-cols-12 bg-gray-50 text-sm font-semibold text-gray-900"
        >
          <div class="col-span-6 p-4 sm:col-span-7">
            <div class="prose prose-sm mx-auto my-2">
              <h2 class="">Classement</h2>
            </div>
          </div>
          <div
            class="col-span-3 flex cursor-pointer items-center justify-end gap-2 p-4 sm:col-span-3"
            @click="toggleSort('voix')"
          >
            <span>Voix</span>
            <UIcon :name="getSortIcon('voix')" class="h-4 w-4" />
          </div>
          <div
            class="col-span-3 flex cursor-pointer items-center justify-end gap-2 p-4 sm:col-span-2"
          >
            <span>Sièges</span>
          </div>
        </div>
      </div>

      <!-- Corps du tableau avec scroll -->
      <div class="relative max-h-[70vh] overflow-auto">
        <!-- Skeleton de chargement -->
        <template v-if="loading">
          <div
            v-for="n in 5"
            :key="n"
            class="animate-pulse border-b border-gray-200"
          >
            <div class="grid min-w-full grid-cols-12 items-center py-3">
              <div
                class="col-span-6 flex items-center gap-3 px-4 sm:col-span-7"
              >
                <div class="h-12 w-12 rounded-full bg-gray-200"></div>
                <div class="flex-1">
                  <div class="mb-2 h-4 w-3/4 rounded bg-gray-200"></div>
                  <div class="h-3 w-1/2 rounded bg-gray-200"></div>
                </div>
              </div>
              <div class="col-span-3 px-4 sm:col-span-3">
                <div class="ml-auto h-4 w-20 rounded bg-gray-200"></div>
              </div>
              <div class="col-span-3 px-4 sm:col-span-2">
                <div class="ml-auto h-4 w-16 rounded bg-gray-200"></div>
              </div>
            </div>
          </div>
        </template>

        <!-- Liste réelle des coalitions -->
        <template v-else>
          <div
            v-for="coalition in sortedAndFilteredCoalitions"
            :key="coalition.id"
            class="block cursor-pointer border-b border-gray-200 transition-colors hover:bg-gray-50"
          >
            <div class="grid min-w-full grid-cols-12 items-center py-3">
              <!-- Coalition nom et logo -->
              <div
                class="col-span-6 flex items-center gap-3 px-4 sm:col-span-7"
              >
                <div class="flex-shrink-0">
                  <!-- <UAvatar
                    v-if="coalition.logo"
                    :src="$directusImageUrl(coalition.logo, '25')"
                    :alt="coalition.name"
                    size="lg"
                    loading="lazy"
                    fetchpriority="high"
                  /> -->
                  <UAvatar
                    v-if="coalition.logo"
                    :src="$directusImageUrl(coalition.logo, '25')"
                    :alt="coalition.nom"
                    size="sm"
                    loading="lazy"
                    fetchpriority="high"
                  />
                  <UAvatar v-else icon="i-heroicons-photo" size="lg" />
                </div>
                <div>
                  <h2 class="line-clamp-1 text-sm font-semibold text-gray-900">
                    {{ coalition.name }}
                  </h2>
                  <p class="text-sm capitalize text-gray-600">
                    {{ coalition.head_of_list?.first_name.toLowerCase() }}
                    {{ coalition.head_of_list?.last_name.toLowerCase() }}
                  </p>
                </div>
              </div>

              <!-- Voix -->
              <div
                class="col-span-3 px-4 text-right text-gray-900 sm:col-span-3"
              >
                <p>
                  {{ new Intl.NumberFormat("fr-FR").format(coalition.voix) }}
                </p>
                <!-- <UBadge :color="getBadgeColor(coalition.pourcentage)"> -->
                <UBadge
                  variant="subtle"
                  class="custom-shadow"
                  :style="{ backgroundColor: coalition.color }"
                >
                  {{ coalition.pourcentage.toFixed(2) }}%
                </UBadge>
              </div>

              <!-- Pourcentage -->
              <div
                class="col-span-3 px-4 text-right text-gray-900 sm:col-span-2"
              >
                {{ coalition.sieges + coalition.sieges_departement }}
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>

    <!-- Message si aucun résultat -->
    <div
      v-if="!loading && sortedAndFilteredCoalitions.length === 0"
      class="mt-4 text-center text-gray-500"
    >
      Aucune coalition ne correspond aux critères de recherche
    </div>
  </div>
</template>

<script setup lang="ts">
import type { _backgroundColor } from "#tailwind-config/theme";
import type { Coalition } from "~/types/coalition";

const props = defineProps<{
  coalitions: Coalition[];
  loading: boolean;
}>();

// État pour les filtres et le tri
const filters = ref({
  searchTerm: "",
  minVoix: "",
  minPourcentage: "",
});

const sortConfig = ref({
  field: "voix",
  direction: "desc" as "asc" | "desc",
});

// Fonction pour basculer le tri
const toggleSort = (field: "voix" | "pourcentage") => {
  if (sortConfig.value.field === field) {
    sortConfig.value.direction =
      sortConfig.value.direction === "asc" ? "desc" : "asc";
  } else {
    sortConfig.value.field = field;
    sortConfig.value.direction = "desc";
  }
};

// Fonction pour obtenir l'icône de tri
const getSortIcon = (field: string) => {
  if (sortConfig.value.field !== field) return "i-heroicons-arrows-up-down";
  return sortConfig.value.direction === "asc"
    ? "i-heroicons-arrow-up"
    : "i-heroicons-arrow-down";
};

// Computed pour filtrer et trier les coalitions
const sortedAndFilteredCoalitions = computed(() => {
  let filtered = [...props.coalitions];

  // Appliquer les filtres
  if (filters.value.searchTerm) {
    const searchTerm = filters.value.searchTerm.toLowerCase();
    filtered = filtered.filter(
      (coalition) =>
        coalition.name.toLowerCase().includes(searchTerm) ||
        coalition.head_of_list?.first_name.toLowerCase().includes(searchTerm) ||
        coalition.head_of_list?.last_name.toLowerCase().includes(searchTerm),
    );
  }

  if (filters.value.minVoix) {
    filtered = filtered.filter(
      (coalition) => coalition.voix >= Number(filters.value.minVoix),
    );
  }

  if (filters.value.minPourcentage) {
    filtered = filtered.filter(
      (coalition) =>
        coalition.pourcentage >= Number(filters.value.minPourcentage),
    );
  }

  // Appliquer le tri
  return filtered.sort((a, b) => {
    const multiplier = sortConfig.value.direction === "asc" ? 1 : -1;
    return (a[sortConfig.value.field] - b[sortConfig.value.field]) * multiplier;
  });
});

const getBadgeColor = (percentage: number) => {
  if (percentage >= 15) return "yellow";
  if (percentage >= 5) return "gray";
  return "gray";
};
</script>

<style scoped>
/* Optionnel : Ajouter un dégradé pour indiquer qu'il y a du scroll */
.overflow-auto {
  background:
    linear-gradient(white 30%, rgba(255, 255, 255, 0)),
    linear-gradient(rgba(255, 255, 255, 0), white 70%) 0 100%,
    radial-gradient(
      farthest-side at 50% 0,
      rgba(0, 0, 0, 0.2),
      rgba(0, 0, 0, 0)
    ),
    radial-gradient(
        farthest-side at 50% 100%,
        rgba(0, 0, 0, 0.2),
        rgba(0, 0, 0, 0)
      )
      0 100%;
  background-repeat: no-repeat;
  background-size:
    100% 40px,
    100% 40px,
    100% 14px,
    100% 14px;
  background-attachment: local, local, scroll, scroll;
}
</style>
