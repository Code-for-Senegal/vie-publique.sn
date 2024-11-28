<!-- # components/Election/ElectionResultPvGrid.vue -->
<template>
  <div>
    <!-- Loading State -->
    <template v-if="loading && !pvs.length">
      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <USkeleton v-for="i in 6" :key="i" class="h-48" />
      </div>
    </template>

    <!-- Error State -->
    <UAlert
      v-if="error"
      icon="i-heroicons-exclamation-triangle"
      color="red"
      variant="soft"
      class="mb-4"
    >
      {{ error }}
    </UAlert>

    <!-- Content -->
    <div v-else>
      <!-- Grid -->
      <div class="grid grid-cols-1 gap-4 p-2 md:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="pv in pvs"
          :key="pv.id"
          @click="openModal(pv)"
          class="cursor-pointer overflow-hidden rounded-lg bg-white shadow-md transition-shadow duration-300 hover:shadow-lg"
        >
          <!-- Thumbnail -->
          <div class="relative aspect-[4/3] bg-gray-100">
            <img
              v-if="pv.url && pv.url[0]"
              :src="pv.url[0]"
              :alt="getLocationLabel(pv)"
              class="h-full w-full object-cover"
              loading="lazy"
            />
            <div
              v-else
              class="absolute inset-0 flex items-center justify-center bg-gray-200"
            >
              <span class="text-gray-400">Aucune image</span>
            </div>
          </div>

          <!-- Info -->
          <div class="p-4">
            <div class="mb-2 flex items-start justify-between">
              <div>
                <!-- Pour la diaspora -->
                <template v-if="currentSource === 'etranger'">
                  <h3 class="text-lg font-bold">{{ pv.repDiplomatique }}</h3>
                  <p class="text-gray-600">{{ pv.localite }}</p>
                </template>
                <!-- Pour le national -->
                <template v-else>
                  <h3 class="text-lg font-bold">{{ pv.departement }}</h3>
                  <p class="text-gray-600">{{ pv.commune }}</p>
                </template>
              </div>
              <span
                class="rounded-full px-2.5 py-0.5 text-xs font-medium"
                :class="
                  currentSource === 'etranger'
                    ? 'bg-orange-100 text-orange-800'
                    : 'bg-green-100 text-green-800'
                "
              >
                Bureau {{ pv.numeroBureau }}
              </span>
            </div>

            <!-- Stats -->
            <div class="mt-4 grid grid-cols-2 gap-2 text-sm">
              <div class="rounded bg-gray-50 p-2">
                <span class="block text-gray-500">Inscrits</span>
                <span class="font-semibold">{{ pv.electeursInscrits }}</span>
              </div>
              <div class="rounded bg-gray-50 p-2">
                <span class="block text-gray-500">Exprimés</span>
                <span class="font-semibold">{{ pv.suffragesExprimes }}</span>
              </div>
            </div>

            <!-- Top Résultats -->
            <div class="mt-4 space-y-2">
              <div
                v-for="resultat in getTopResults(pv.resultats, 3)"
                :key="resultat.coalitionId"
                class="flex items-center justify-between text-sm"
              >
                <span class="truncate pr-2" :title="resultat.nom">
                  {{ resultat.nom }}
                </span>
                <span class="font-semibold">
                  {{ resultat.votes }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal -->
      <div
        v-if="selectedPv"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
        @click="closeModal"
      >
        <div
          class="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white"
          @click.stop
        >
          <div class="sticky top-0 z-10 border-b bg-white p-4">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold">
                {{ getLocationLabel(selectedPv) }}
              </h2>
              <button
                @click="closeModal"
                class="text-gray-500 hover:text-gray-700"
              >
                <span class="text-2xl">&times;</span>
              </button>
            </div>
          </div>

          <div class="p-4">
            <!-- Image -->
            <div class="mb-6">
              <img
                v-if="selectedPv.url && selectedPv.url[0]"
                :src="selectedPv.url[0]"
                alt="PV"
                class="h-auto max-w-full rounded-lg shadow-md"
              />
            </div>

            <!-- Informations -->
            <div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div class="rounded-lg bg-gray-50 p-4">
                <!-- <h3 class="mb-3 font-semibold">Informations générales</h3> -->
                <div class="space-y-2">
                  <!-- Pour la diaspora -->
                  <template v-if="currentSource === 'etranger'">
                    <p>
                      <strong>Représentation:</strong>
                      {{ selectedPv.repDiplomatique }}
                    </p>
                    <p><strong>Pays:</strong> {{ selectedPv.pays }}</p>
                    <p><strong>Localité:</strong> {{ selectedPv.localite }}</p>
                  </template>
                  <!-- Pour le national -->
                  <template v-else>
                    <p><strong>Région:</strong> {{ selectedPv.region }}</p>
                    <p>
                      <strong>Département:</strong> {{ selectedPv.departement }}
                    </p>
                    <p><strong>Commune:</strong> {{ selectedPv.commune }}</p>
                  </template>
                  <p>
                    <strong>Lieu de vote:</strong> {{ selectedPv.lieuDeVote }}
                  </p>
                  <p><strong>Bureau:</strong> {{ selectedPv.numeroBureau }}</p>
                </div>
              </div>

              <div class="rounded-lg bg-gray-50 p-4">
                <!-- <h3 class="mb-3 font-semibold">Statistiques</h3> -->
                <div class="space-y-2">
                  <p>
                    <strong>Inscrits:</strong>
                    {{ selectedPv.electeursInscrits }}
                  </p>
                  <p>
                    <strong>Votants:</strong> {{ selectedPv.votesExprimes }}
                  </p>
                  <p>
                    <strong>Exprimés:</strong>
                    {{ selectedPv.suffragesExprimes }}
                  </p>
                  <p><strong>Nuls:</strong> {{ selectedPv.bulletinsNuls }}</p>
                  <p>
                    <strong>Hors bureau:</strong>
                    {{ selectedPv.votesHorsBureauOrigine }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Résultats -->
            <div class="rounded-lg bg-white shadow">
              <div class="border-b px-4 py-3">
                <h3 class="font-semibold">Résultats détaillés</h3>
              </div>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-4 py-2 text-left">Coalition</th>
                      <th class="px-4 py-2 text-right">Votes</th>
                      <th class="px-4 py-2 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="resultat in sortedResults"
                      :key="resultat.coalitionId"
                      class="border-b hover:bg-gray-50"
                    >
                      <td class="px-4 py-2">{{ resultat.nom }}</td>
                      <td class="px-4 py-2 text-right font-medium">
                        {{ resultat.votes }}
                      </td>
                      <td class="px-4 py-2 text-right">
                        {{
                          calculatePercentage(
                            resultat.votes,
                            selectedPv.suffragesExprimes,
                          )
                        }}%
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Refresh button -->
    <div class="fixed bottom-4 right-4">
      <UButton
        :loading="loading"
        :disabled="loading"
        icon="i-heroicons-arrow-path"
        color="gray"
        variant="soft"
        @click="handleRefresh"
      >
        Actualiser
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    source?: "national" | "etranger";
  }>(),
  {
    source: "national",
  },
);

// Initialiser le composable avec la source appropriée
const { pvs, loading, error, fetchPvs, currentSource } = usePvs(props.source);
const selectedPv = ref(null);

// Surveiller les changements de source
watch(
  () => props.source,
  (newSource) => {
    fetchPvs(newSource);
  },
);

// Méthode pour obtenir le label de localisation en fonction de la source
const getLocationLabel = (pv: any) => {
  if (currentSource.value === "etranger") {
    return `${pv.repDiplomatique} - ${pv.localite}`;
  }
  return `${pv.departement} - ${pv.commune}`;
};

// Handle refresh
const handleRefresh = () => {
  fetchPvs(props.source);
};

// Modal functions
const openModal = (pv) => {
  selectedPv.value = pv;
};

const closeModal = () => {
  selectedPv.value = null;
};

// Computed properties
const sortedResults = computed(() => {
  if (!selectedPv.value) return [];
  return [...selectedPv.value.resultats].sort((a, b) => b.votes - a.votes);
});

// Utility functions
const calculatePercentage = (votes: number, total: number) => {
  if (!total) return 0;
  return ((votes / total) * 100).toFixed(1);
};

const getTopResults = (resultats: any[], limit: number) => {
  return [...resultats].sort((a, b) => b.votes - a.votes).slice(0, limit);
};

// Handle escape key
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape" && selectedPv.value) {
      closeModal();
    }
  };

  window.addEventListener("keydown", handleEscape);
  onUnmounted(() => {
    window.removeEventListener("keydown", handleEscape);
  });
});
</script>
